import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import json5 from 'json5';
import { useMemo } from 'react';
import { useInsertingCytoStore, useShowTypes } from '../hooks';

export function useCytoElements(ml, links, cy, spaceId) {
  const [showTypes, setShowTypes] = useShowTypes();
  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore();
  const deep = useDeep();

  console.time('useCytoElements');

  const _elements: { [key: string]: any } = {};
  const elements = [];
  const reactElements = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const focus = link?.inByType?.[deep.idSync('@deep-foundation/core', 'Focus')]?.find(f => f.from_id === spaceId);

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
      _value = _value.split('\n')[0];
      if (_value.length > 15) _value = _value.slice(0, 15)+'...';
    }
    if (link?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value) {
      _name = `name:${link?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value}`;
    }
    if (ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idSync('@deep-foundation/core', 'Contain'))?.value?.value) {
      _type = `type:${ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idSync('@deep-foundation/core', 'Contain'))?.value?.value}`;
    }
    if (ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idSync('@deep-foundation/core', 'Symbol'))?.value?.value) {
      _symbol = ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idSync('@deep-foundation/core', 'Symbol'))?.value?.value;
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
          +(_value ? '\n'+`${_value}` : '')
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
    _elements[link?.id] = element;
    elements.push(element);
    // if (link.type_id === deep.idSync('@deep-foundation/core', 'Query')) {
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
    const focus = link?.inByType?.[deep.idSync('@deep-foundation/core', 'Focus')]?.find(f => f.from_id === spaceId);

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
    if (link?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value) {
      _name = `name:${link?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value}`;
    }
    if (link?.type?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value) {
      _type = `type:${link?.type?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value}`;
    }
    if (link?.type?.inByType?.[deep.idSync('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value) {
      _symbol = link?.type?.inByType?.[deep.idSync('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value;
    }
    if (!!cy) {
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

  console.timeEnd('useCytoElements');

  return {
    elements, reactElements,
  };
}
