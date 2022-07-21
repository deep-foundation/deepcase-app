import { useDeep, useDeepQuery } from "@deep-foundation/deeplinks/imports/client";
import { useState, useMemo } from "react";
import { useLocalStorage } from "usehooks-ts";
import { CytoReactLinksCard } from "./cyto-react-links-card";
import { useContainer } from "./hooks";

export interface IInsertedLink {
  position: { x: number; y: number; };
  from: number; to: number;
};

export function useInsertedLink(elements, reactElements, focus, refCy, baseTypes, ml) {
  const [insertLink, setInsertLink] = useState<IInsertedLink>();
  const [container, setContainer] = useContainer();
  const deep = useDeep();

  const InsertLinkCardComponent = useMemo(() => {
    return function CytoReactLinksCardInsertNode({
      from, to
    }: IInsertedLink) {
      const fromType = ml.byId[from].type_id;
      const toType = ml.byId[to].type_id;
      const { data: types } = useDeepQuery(
        useMemo(() => ({
          _or: (!from && !to) ? [
            { type_id: { _type_of: 1 }, from_id: 0, to_id: 0 },
            { id: 1, },
          ] : [
            { type_id: { _type_of: 1 }, from_id: { _in: [fromType, baseTypes.Any] }, to_id: { _in: [toType, baseTypes.Any] } },
            { id: 1, },
          ],
          can_object: {
            subject_id: { _eq: 352 },
            action_id: { _eq: 121 },
          },
        }), []),
        useMemo(() => ({
          returning: `
            id
            valued: out(where: {
              type_id: { _eq: ${baseTypes.Value} },
            }) {
              id
              to_id
            }
            contains: in(where: {
              type_id: { _eq: ${baseTypes.Contain} },
            }) {
              id
              value
              from {
                id
                value
              }
            }
          `,
        }), [baseTypes]),
      );
      const elements = (types || [])?.map(t => ({
        id: t.id,
        src: t.id,
        linkName: t?.contains?.[0]?.value?.value || t.id,
        containerName: t?.contains?.[0]?.from?.value?.value || '',
      }));
      return <CytoReactLinksCard
        elements={elements}
        onSubmit={async (id) => {
          const loadedLink = types?.find(t => t.id === id);
          const valued = loadedLink?.valued?.[0]?.to_id;
          const { data: [{ id: linkId }] } = await deep.insert({
            type_id: id,
            ...(valued === baseTypes.String ? { string: { data: { value: '' } } } :
              valued === baseTypes.Number ? { number: { data: { value: 0 } } } :
              valued === baseTypes.Object ? { object: { data: { value: {} } } } :
              {}),
            ...(container ? {
              in: { data: {
                from_id: container,
                type_id: await deep.id('@deep-foundation/core', 'Contain'),
              } },
            } : {}),
            from_id: from || 0,
            to_id: to || 0,
          });
          setInsertLink((insertLink) => {
            focus(linkId, insertLink);
            return undefined;
          })
        }}
      />;
    };
  }, []);
  const TempComponent = useMemo(() => {
    return () => <InsertLinkCardComponent {...insertLink}/>;
  }, [insertLink]);
  if (insertLink) {
    const element = {
      id: 'insert-link-card',
      position: insertLink.position,
      locked: true,
      classes: 'insert-link-card',
      data: {
        id: 'insert-link-card',
        Component: TempComponent,
      },
    };
    elements.push(element);
    reactElements.push(element);
  }

  return useMemo(() => ({
    setInsertingLink: (insertedLink: IInsertedLink) => {
      if (insertedLink) {
        const cy = refCy.current._cy;
        setInsertLink(insertedLink);
        const el = cy.$('#insert-link-card');
        el.unlock();
        el.position(insertedLink.position);
        el.lock();
      } else {
        setInsertLink(undefined);
      }
    }
  }), []);
}

export function useLinkReactElements(elements, reactElements, refCy) {
  const [linkReactElements, setLinkReactElements] = useState<{ [key: string]: boolean }>({});
  const linkReactElementsIds = useMemo(() => Object.keys(linkReactElements).filter(key => !!linkReactElements[key]), [linkReactElements]).map(key => parseInt(key), [linkReactElements]);

  reactElements.push(...linkReactElementsIds.map(id => (elements.find(e => e.id === id))));

  const toggleLinkReactElement = useMemo(() => (id: number) => {
    console.log('useLinkReactElements', 'toggleLinkReactElement', id);
    setLinkReactElements((linkReactElements) => {
      const cy = refCy.current._cy;
      const isEnabling = !linkReactElements[id];
      if (isEnabling) {
        cy.$(`#${id}`).data('Component', AnyLinkComponent);
        cy.$(`#${id}`).addClass('unhoverable').removeClass('hover');
        cy.$(`#${id}`).style({
          'shape': 'rectangle',
        });
      } else {
        cy.$(`#${id}`).data('Component', undefined);
        cy.$(`#${id}`).removeClass('unhoverable');
        cy.$(`#${id}`).style({
          'shape': null,
          width: null,
          height: null,
        });
      }
      return {
        ...linkReactElements,
        [id]: !linkReactElements[id],
      };
    });
  }, []);

  const AnyLinkComponent = useMemo(() => {
    return function AnyLinkComponent({ id }: { id: number }) {
      return <div
        style={{
          width: 50, height: 50, background: 'red',
          opacity: 0.5,
        }}
        onClick={() => toggleLinkReactElement(id)}
      >{id}</div>;
    };
  }, []);

  return {
    toggleLinkReactElement,
    linkReactElements: linkReactElementsIds,
  };
}

export function useCytoEditor() {
  return useLocalStorage('cyto-editor', false);
}