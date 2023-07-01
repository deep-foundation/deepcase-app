import { useDeep, useDeepId } from '@deep-foundation/deeplinks/imports/client';
import json5 from 'json5';
import { useEffect, useMemo, useRef } from 'react';
import { useCytoHandlersSwitch, useInsertingCytoStore, useShowFocus, useShowTypes } from '../hooks';
import _ from 'lodash';
import { CytoHandler } from '../cyto-handler';
import { useCytoHandlersRules } from './hooks';

export function useCytoElements(ml, _links, cy, spaceId, cyh) {
  const [showTypes, setShowTypes] = useShowTypes();
  const [showFocus, setShowFocus] = useShowFocus();

  const [cytoHandlers, setCytoHandlers] = useCytoHandlersSwitch();
  const [chr, setChr] = useCytoHandlersRules();

  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore();
  const oldElements = useRef([]);
  const deep = useDeep();
  const { data: HandleCyto } = useDeepId('@deep-foundation/handle-cyto', 'HandleCyto');
  
  const links = _links;
  
  // console.time('useCytoElements');
  
  const elementsById: { [key: string]: any } = {};
  const cytoHandled: { [key: string]: any } = {};
  let elements = [];
  const reactElements = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    const cyHandle = deep.minilinks?.byType[HandleCyto]?.find(l => l.from_id === link.type_id);

    if (cyh.drawedCytoHandlers.current[link.id] && (!cytoHandlers || !chr[cyHandle?.id])) {
      continue;
    }
    if (cytoHandlers && cyHandle && !!chr[cyHandle?.id]) {
      cytoHandled[link.id] = cyHandle?.to_id;
      continue;
    }

    const focus = link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Focus')]?.find(f => f.from_id === spaceId);
    const isFocusSpace = (link.type_id === deep.idLocal('@deep-foundation/core', 'Focus') && link._applies.includes('space')) || (link?.to?.type_id === deep.idLocal('@deep-foundation/core', 'Focus') && link._applies.includes('space'));

    let _value = '';
    let _name = '';
    let _type = '';
    let _symbol = '';
    if (/*labelsConfig?.values && */typeof link?.value?.value !== 'undefined') {
      let json;
      try { json = json5.stringify(link?.value.value); } catch(error) {}
      _value = (
        typeof(link?.value.value) === 'object' && json
        ? json : link?.value.value
      );
      if (typeof(_value) === 'string') _value = _value.split('\n')[0];
      if (_value.length > 20) _value = _value.slice(0, 11)+'...'+_value.slice(-9, _value.length);
    }
    if (link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value) {
      _name = `name:${link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value}`;
    }
    if (ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idLocal('@deep-foundation/core', 'Contain'))?.value?.value) {
      _type = `type:${ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idLocal('@deep-foundation/core', 'Contain'))?.value?.value}`;
    }
    if (ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idLocal('@deep-foundation/core', 'Symbol'))?.value?.value) {
      _symbol = ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idLocal('@deep-foundation/core', 'Symbol'))?.value?.value;
    }

    function isValidValue(value) {
      return value !== null && typeof value !== 'undefined' && !Number.isNaN(value) && value !== '';
    }

    const has_focus = !!focus?.value?.value?.x;
    const existed = !!oldElements.current.find((oldLink) => oldLink.id === link.id)


    // const parent = link?._applies?.find(q => q.includes('query-'));

    const element = {
      id: link.id,
      data: {
        id: `${link.id}`,
        label: (
          `${link.id}`
          +(_type ? '\n'+`${_type}` : '')
          +(_name ? '\n'+`${_name}` : '')
          +(isValidValue(_value) ? '\n'+`${_value}` : '')
          +`\n\n ${_symbol || '📍'}`
        ),
        // parent,
        link,
      },
      selectable: false,
      classes: [
        'link-node',
        ...(focus ? ['focused'] : ['unfocused']),
      ].join(' '),
      
      ...(has_focus ? {
        position: !existed ? focus?.value?.value : {},
        locked: !!focus,
      } : {}),
      focused: !!focus,
      // locked: true,
      // focused: true,
    };

    if ((isFocusSpace && showFocus) || !isFocusSpace) {
      elementsById[link?.id] = element;
      elements.push(element);
    }
    // if (elements.length > 200) {
    //   break;
    // }
    // if (link.type_id === deep.idLocal('@deep-foundation/core', 'Query')) {
    //   const id = `query-${link.id}`;
    //   {
    //     const element = {
    //       id,
    //       data: {
    //         id,
    //       },
    //       pannable: false,
    //       events: false,
    //     };
    //     elementsById[id] = element;
    //     elements.push(element);
    //   }
    //   {
    //     const _id = `${id}-connector`;
    //     const element = {
    //       id: _id,
    //       data: {
    //         id: _id,
    //         source: link.id,
    //         target: id,
    //       },
    //       classes: ['query-compound-connector'],
    //     };
    //     elementsById[_id] = element;
    //     elements.push(element);
    //   }
    // }
  }
  for (let i = 0; i < links.length; i++) {
    const link = links[i];

    if (cytoHandled[link?.id]) continue;
    if (cyh.drawedCytoHandlers.current[link.id] && !cytoHandlers) {
      continue;
    }

    const focus = link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Focus')]?.find(f => f.from_id === spaceId);
    const isFocusSpace = (link.type_id === deep.idLocal('@deep-foundation/core', 'Focus') && link._applies.includes('space')) || (link?.to?.type_id === deep.idLocal('@deep-foundation/core', 'Focus') && link._applies.includes('space'));

    let _value = '';
    let _name = '';
    let _type = '';
    let _symbol = '';
    if (/*labelsConfig?.values && */link?.value?.value) {
      let json;
      try { json = json5.stringify(link?.value.value); } catch(error) {}
      _value = (
        typeof(link?.value.value) === 'object' && json
        ? json : link?.value.value
      );
    }
    if (link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value) {
      _name = `name:${link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value}`;
    }
    if (link?.type?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value) {
      _type = `type:${link?.type?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value}`;
    }
    if (link?.type?.inByType?.[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value) {
      _symbol = link?.type?.inByType?.[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value;
    }
    if (!!cy && (!cyh.drawedCytoHandlers.current[link.id] || !cytoHandlers)) {
      if ((isFocusSpace && showFocus) || !isFocusSpace) {
        if (link.from_id) {
          if (ml?.byId?.[link.from_id] && elementsById[link.from_id]) {
            elements.push({
              data: { id: `${link.id}-from`, source: `${link.id}`, target: `${link.from_id}`, link },
              selectable: false,
              classes: [
                'link-from',
                ...(focus ? ['focused'] : ['unfocused'])
              ].join(' '),
            });
          }
        }
        if (link.to_id) {
          if (ml?.byId?.[link.to_id] && elementsById[link.to_id]) {
            elements.push({
              data: { id: `${link.id}-to`, source: `${link.id}`, target: `${link.to_id}`, link },
              selectable: false,
              classes: [
                'link-to',
                ...(focus ? ['focused'] : ['unfocused'])
              ].join(' '),
            });
          }
        }
        if (showTypes) {
          if (link.type_id) {
            if (ml?.byId?.[link.type_id] && elementsById[link.type_id]) {
              elements.push({
                data: { id: `${link.id}-type`, source: `${link.id}`, target: `${link.type_id}`, link },
                selectable: false,
                classes: [
                  'link-type',
                  ...(focus ? ['focused'] : ['unfocused'])
                ].join(' '),
              });
            }
          }
        }
      }
    }
  }
  for (let i = 0; i < elements.length; i++) {
    const el = elements[i];
    if (el?.data?.source && !elementsById[el?.data?.source] && !cytoHandled[el?.data?.source] && !cyh.drawedCytoHandlers.current[el?.data?.source]) {
      const id = el?.data?.source;
      const element = {
        id: id,
        data: {
          id: `${id}`,
          label: (
            `${id}\n\n `
          ),
        },
        selectable: false,
        classes: [
          'link-node',
        ].join(' '),
        // locked: true,
        // focused: true,
      };
      elementsById[id] = element;
      elements.push(element);
    }
    if (el?.data?.target && !elementsById[el?.data?.target] && !cytoHandled[el?.data?.target] && !cyh.drawedCytoHandlers.current[el?.data?.target]) {
      const id = el?.data?.target;
      const element = {
        id: id,
        data: {
          id: `${id}`,
          label: (
            `${id}\n\n `
          ),
        },
        selectable: false,
        classes: [
          'link-node',
        ].join(' '),
        // locked: true,
        // focused: true,
      };
      elementsById[id] = element;
      elements.push(element);
    }
  }

  oldElements.current = elements;
  // console.timeEnd('useCytoElements');

  // useEffect(() => {
  //   setTimeout(() => {
  //     if (!_.isEmpty(cyh.drawedCytoHandlers.current)) cyh.setIterator(i => i + 1);
  //   }, 3000);
  // });

  return {
    elementsById, elements, reactElements, cytoHandled,
  };
}
