import { useAuthNode, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { useLocalStore } from '@deep-foundation/store/local';
import { useQueryStore } from '@deep-foundation/store/query';
import React, { useEffect, useRef, useState } from 'react';
import { useMemo } from 'react';
import { layouts } from './cyto/layouts';
import { useMediaQuery as useMediaQueryChakra } from '@chakra-ui/react';

export const defaultLeftWidth = 10;
export const defaultCardWidth = 300;

const defaultGraphiqlHeight = 300;

// export function useShowTypes() {
//   return useQueryStore('show-types', false);
// }
// export function useShowMP() {
//   return useQueryStore('show-mp', false);
// }
export function useClickSelect() {
  return useLocalStore('click-select', true);
}
export function usePromiseLoader() {
  return useQueryStore('promise-loader', false);
}
export function useTraveler() {
  return useQueryStore('traveler', true);
}
export function useContainer() {
  const [spaceId] = useSpaceId();
  const store = useQueryStore('container', 0);
  return useMemo(() => [store[0] || spaceId, store[1]], [spaceId, store[0]]);
}
// export function useContainerVisible() {
//   return useLocalStore('container-visible', true);
// }
export function useForceGraph() {
  return useQueryStore('force-graph-type', '2d');
}

export interface IInsertingCytoStore{
  isNode?: boolean;
  isPossibleNode?: boolean;
  type_id?: number;
  toast?: any;
  From?: number;
  To?: number;
  from?: number;
  to?: number;
  _selfLink?: boolean;
}

export function useInsertingCytoStore() {
  return useQueryStore<IInsertingCytoStore>(
    'dc-dg-ins',
    {},
  );
}
export function useScreenFind() {
  return useQueryStore<any>('screen-find', '');
}
export function useSpaceId() {
  const [linkId] = useAuthNode();
  const store = useQueryStore<any>('space-id', linkId);
  return useMemo(() => [store[0] || linkId, store[1]], [linkId, store[0]]);
}
// export function useLabelsConfig() {
//   return useQueryStore('labels-config', { types: true, contains: false, values: true, focuses: false });
// };
export function useWindowSize() {
  return useLocalStore('window-size', { width: 800, height: 500 });
};
export function useGraphiqlHeight() {
  return useLocalStore('graphiql-height', defaultGraphiqlHeight);
};
export function useShowExtra() {
  return useQueryStore<any>('show-extra', false);
};
export function useCytoViewport<S extends { pan: { x: number; y: number; }; zoom: number }>() {
  return useLocalStore<S>('cyto-viewport', { pan: { x: 0, y: 0 }, zoom: 1 } as S);
};
export function useShowFocus() {
  return useQueryStore<any>('show-focus', false);
};
export function useShowTypes() {
  return useQueryStore('show-types', true);
}
export function useBackgroundTransparent() {
  return useQueryStore<any>('bg-transparent', false);
};
export function useFocusMethods() {
  const [spaceId] = useSpaceId();
  const deep = useDeep();
  return useMemo(() => {
    return {
      unfocus: async (id) => {
        console.log('unfocus', { spaceId, id });
        const where = { type_id: deep.idSync('@deep-foundation/core', 'Focus'), from_id: spaceId, to_id: id };
        console.log('unfocused', await deep.delete(where));
      },
      focus: async (id, value: { x: number; y: number; z: number; }) => {
        console.log('focus', { spaceId, id, value });
        const q = await deep.select({
          type_id: deep.idSync('@deep-foundation/core', 'Focus'),
          from_id: spaceId,
          to_id: id,
        });
        const focus = q?.data?.[0];
        let focusId = focus?.id;
        if (!focusId) {
          const { data: [{ id: newFocusId }] } = await deep.insert({
            type_id: deep.idSync('@deep-foundation/core', 'Focus'),
            from_id: spaceId,
            to_id: id,
            object: { data: { value } },
            in: { data: {
              type_id: deep.idSync('@deep-foundation/core', 'Contain'),
              from_id: spaceId
            } },
          });
          focusId = newFocusId;
        } else {
          if (focus.value) {
            await deep.update({
              link_id: { _eq: focusId },
            }, { value }, { table: 'objects' });
          } else {
            await deep.insert({
              link_id: focusId, value,
            }, { table: 'objects' });
          }
        }
        console.log('focused', { spaceId, id, value, focusId });
      }
    };
  }, [spaceId]);
};
export function useActiveMethods() {
  const [spaceId] = useSpaceId();
  const deep = useDeep();
  return useMemo(() => {
    return {
      deactive: async function(id: number) {
        console.log(await deep.delete({ type_id: deep.idSync('@deep-foundation/core', 'Active'), from_id: spaceId, to_id: id }));
      },
      find: async function(id: number) {
        const q = await deep.select({
          type_id: deep.idSync('@deep-foundation/core', 'Active'),
          from_id: spaceId,
          to_id: id,
        });
        return q?.data?.[0];
      },
      active: async function(id: number) {
        const active = await this.find(id);
        const { data: [{ id: newId }] } = await deep.insert({
          type_id: deep.idSync('@deep-foundation/core', 'Active'),
          from_id: spaceId,
          to_id: id,
          in: { data: {
            type_id: deep.idSync('@deep-foundation/core', 'Contain'),
            from_id: spaceId
          } },
        });
      },
      toggle: async function(id: number) {
        const active = await this.find(id);
        let oldId = active?.id;
        if (!oldId) await this.active(id);
        else await this.deactive(id);
      },
    };
  }, []);
};

export function useLayout() {
  const [layoutName, setLayoutName] = useLocalStore('layout', 'cola');
  return {
    setLayout(name: 'cola') {
      setLayoutName(name);
    },
    layout: layouts[layoutName],
    layoutName,
  };
};

export function useRefAutofill<T>(value: T) {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}


export const useMediaQuery = function useMediaQuery(arg) {
  const [actualValue, isBrowser] = useMediaQueryChakra(arg);
  const [value, setValue] = useState(false);
  useEffect(() => setValue(actualValue), [actualValue, isBrowser]);
  return [value, isBrowser];
}
