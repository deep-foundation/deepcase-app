import json5 from 'json5';
import { useMemo } from 'react';

export function useCytoElements(ml, links, baseTypes, cy, spaceId) {
  const elements = [];
  const reactElements = [];

  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const focus = link?.inByType?.[baseTypes.Focus]?.find(f => f.from_id === spaceId);

    if (!!cy) {
      if (link.from_id) {
        if (ml?.byId?.[link.from_id] && !!cy.$(`#${link.from_id}`).length) {
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
        if (ml?.byId?.[link.to_id] && !!cy.$(`#${link.to_id}`).length) {
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
      if (link.type_id) {
        if (ml?.byId?.[link.type_id] && !!cy.$(`#${link.type_id}`).length) {
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

    let _value = '';
    let _name = '';
    let _type = '';
    if (/*labelsConfig?.values && */link?.value?.value) {
      let json;
      try { json = json5.stringify(link?.value.value); } catch(error) {}
      _value = (
        typeof(link?.value.value) === 'object' && json
        ? json : link?.value.value
      );
    }
    if (link?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value) {
      _name = `name:${link?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value}`;
    }
    if (link?.type?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value) {
      _type = `type:${link?.type?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value}`;
    }
    elements.push({
      id: link.id,
      data: {
        id: `${link.id}`,
        label: (
          `${link.id}`
          +(_type ? '\n'+`${_type}` : '')
          +(_name ? '\n'+`${_name}` : '')
          +(_value ? '\n'+`${_value}` : '')
        ),
        link,
      },
      selectable: false,
      classes: [
        'link-node',
        ...(focus ? ['focused'] : ['unfocused'])
      ].join(' '),
      
      ...(focus?.value?.value?.x ? {
        position: focus?.value?.value?.x ? focus?.value?.value : {},
        locked: !!focus,
      } : {}),
      focused: !!focus,
    });
  }

  return {
    elements, reactElements,
  };
}
