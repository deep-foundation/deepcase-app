import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import json5 from 'json5';
import { useMemo } from 'react';
import { useInsertingCytoStore, useShowFocus, useShowTypes } from '../hooks';
import _ from 'lodash';

export function useCytoElements(ml, _links, cy, spaceId) {
  const [showTypes, setShowTypes] = useShowTypes();
  const [showFocus, setShowFocus] = useShowFocus();
  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore();
  const deep = useDeep();

  const links = _links.slice(0, 200);

  console.time('useCytoElements');

  const _elements: { [key: string]: any } = {};
  const elements = [];
  const reactElements = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const focus = link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Focus')]?.find(f => f.from_id === spaceId);
    const isFocusSpace = (link.type_id === deep.idLocal('@deep-foundation/core', 'Focus') && link._applies.includes('space')) || (link?.to?.type_id === deep.idLocal('@deep-foundation/core', 'Focus') && link._applies.includes('space'));

    let _value = '';
    let _name = '';
    let _type = '';
    let _symbol = '';
    if (/*labelsConfig?.values && */link?.value?.value !== undefined) {
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

    // const parent = link?._applies?.find(q => q.includes('query-'));
    const element = {
      id: link.id,
      data: {
        id: `${link.id}`,
        label: (
          `${link.id}`
          +(_type ? '\n'+`${_type}` : '')
          +(_name ? '\n'+`${_name}` : '')
          +(_value !== null && _value !== undefined && !Number.isNaN(_value) && _value !== '' ? '\n'+`${_value}` : '')
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
      
      ...(focus?.value?.value?.x ? {
        position: focus?.value?.value?.x ? focus?.value?.value : {},
        locked: !!focus,
      } : {}),
      focused: !!focus,
      // locked: true,
      // focused: true,
    };

    if ((isFocusSpace && showFocus) || !isFocusSpace) {
      _elements[link?.id] = element;
      elements.push(element);
    }
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
    //     _elements[id] = element;
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
    //     _elements[_id] = element;
    //     elements.push(element);
    //   }
    // }
  }
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
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
    if (!!cy) {
      if ((isFocusSpace && showFocus) || !isFocusSpace) {
        if (link.from_id) {
          if (ml?.byId?.[link.from_id] && _elements[link.from_id]) {
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
          if (ml?.byId?.[link.to_id] && _elements[link.to_id]) {
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
            if (ml?.byId?.[link.type_id] && _elements[link.type_id]) {
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

  console.timeEnd('useCytoElements');

  return {
    elements, reactElements,
  };
}
