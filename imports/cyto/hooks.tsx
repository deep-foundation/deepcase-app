import { Spinner, useToast } from "@chakra-ui/react";
import { useDeep, useDeepQuery } from "@deep-foundation/deeplinks/imports/client";
import { useMinilinksFilter } from "@deep-foundation/deeplinks/imports/minilinks";
import { useState, useMemo, useCallback, useEffect } from "react";
import { useLocalStorage } from "usehooks-ts";
import { CytoReactLinksCard } from "../cyto-react-links-card";
import { useBaseTypes, useContainer, useInsertingCytoStore, useRefAutofill } from "../hooks";
import { LinkClientHandlerDefault } from "../link-client-handlers/default";
import { CatchErrors } from "../react-errors";

export interface IInsertedLink {
  position: { x: number; y: number; };
  from: number; to: number;
};

export function useInsertLinkCard(elements, reactElements, focus, refCy, baseTypes, ml, ehRef) {
  const [insertingLink, setInsertingLink] = useState<IInsertedLink>();
  const [container, setContainer] = useContainer();
  const deep = useDeep();
  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore<{
    isNode?: boolean;
    type_id?: number;
    toast?: any;
  }>();
  const insertingCytoRef = useRefAutofill(insertingCyto);
  const toast = useToast()

  const types = useMinilinksFilter(
    ml,
    useCallback(() => true, []),
    useCallback((l, ml) => (ml.links.filter(l => l._applies.includes('insertable-types'))), []),
  ) || [];

  const insertLink = useCallback(async (type_id, from, to) => {
    const loadedLink = types?.find(t => t.id === type_id);
    const valued = loadedLink?.valued?.[0]?.to_id;
    const { data: [{ id: linkId }] } = await deep.insert({
      type_id: type_id,
      ...(valued === baseTypes.String ? { string: { data: { value: '' } } } :
        valued === baseTypes.Number ? { number: { data: { value: 0 } } } :
        valued === baseTypes.Object ? { object: { data: { value: {} } } } :
        {}),
      ...(container && type_id !== baseTypes.Contain ? {
        in: { data: {
          from_id: container,
          type_id: baseTypes.Contain,
        } },
      } : {}),
      from_id: from || 0,
      to_id: to || 0,
    });
    setInsertingLink((insertLink) => {
      if (!from && !to && !!insertLink) focus(linkId, insertLink.position);
      return undefined;
    })
  }, [types, container, baseTypes]);
  const insertLinkRef = useRefAutofill(insertLink);

  const InsertLinkCardComponent = useMemo(() => {
    return function CytoReactLinksCardInsertNode({
      from, to
    }: IInsertedLink) {
      const [search, setSearch] = useState('');

      const types = useMinilinksFilter(
        ml,
        useCallback(() => true, []),
        useCallback((l, ml) => (ml.links.filter(l => l._applies.includes('insertable-types'))), []),
      ) || [];

      const elements = (types || [])?.map(t => ({
        id: t.id,
        src:  t?.inByType[baseTypes.Symbol]?.[0]?.value?.value || t.id,
        linkName: t?.inByType[baseTypes.Contain]?.[0]?.value?.value || t.id,
        containerName: t?.inByType[baseTypes.Contain]?.[0]?.from?.value?.value || '',
      }));
      return <CytoReactLinksCard
        elements={elements.filter(el => (el?.linkName?.includes(search) || el?.containerName?.includes(search)))}
        search={search}
        onSearch={e => setSearch(e.target.value)}
        onSubmit={async (id) => {
          const insertable = ml.links.filter(l => l._applies.includes('insertable-types'));
          const type = insertable?.find(t => t.id === id);
          const isNode = !type.from_id && !type.to_id;
          setInsertingCyto({});
          if (!from && !to && !isNode) {
            ehRef?.current?.enableDrawMode();
            returning.startInsertingOfType(id);
          } else {
            insertLinkRef.current(id, from, to);
          }
        }}
      />;
    };
  }, []);
  const TempComponent = useMemo(() => {
    return () => <InsertLinkCardComponent {...insertingLink}/>;
  }, [insertingLink]);
  if (insertingLink) {
    const element = {
      id: 'insert-link-card',
      position: insertingLink.position,
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

  const returning = {
    insertLink,
    openInsertCard: (insertedLink: IInsertedLink) => {
      if (insertedLink) {
        const cy = refCy.current._cy;
        setInsertingLink(insertedLink);
        const el = cy.$('#insert-link-card');
        el.unlock();
        if (!insertedLink.from && !insertedLink.to) {
          el.position(insertedLink.position);
          el.lock();
        }
      } else {
        setInsertingLink(undefined);
      }
    },
    insertingCyto,
    startInsertingOfType: (id: number) => {
      const link = ml.byId[id];
      const isNode = !link.from_id && !link.to_id;
      const TypeName = link?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value || link?.id;
      const FromName = ml.byId[link.from_id]?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value || link.from_id;
      const ToName = ml.byId[link.to_id]?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value || link.to_id;
      const t = toast({
        title: `Inserting link type of: ${TypeName}`,
        description: `This ${isNode ? `is node type, just click somewhere for insert.` : `is link type, connect two links from typeof ${FromName} to typeof ${ToName} for insert.`}`,
        position: 'bottom-left',
        duration: null,
        icon: <Spinner />,
        isClosable: true,
        onCloseComplete: () => {
          if (insertingCytoRef?.current?.type_id) setInsertingCyto({});
        },
      });
      if (!isNode) {
        ehRef?.current?.enableDrawMode();
      }
      setInsertingLink(undefined);
      setInsertingCyto({ isNode, type_id: id, toast: t });
    },
    drawendInserting: (position, from, to) => {
      const ins = insertingCytoRef.current;
      setInsertingCyto({});
      toast.close(ins.toast);
      ehRef?.current?.disableDrawMode();
      const cy = refCy.current._cy;
      cy.$('.eh-ghost,.eh-preview').remove();
      if (ins.type_id) {
        insertLinkRef.current(ins.type_id, +from, +to);
      } else {
        returning.openInsertCard({
          position, from, to
        });
      }
    },
  };

  useEffect(() => {
    const cy = refCy.current._cy;
    cy.on('ehstop', async (event, sourceNode, targetNode, addedEdge) => {
      let { position } = event;
      addedEdge?.remove();
      ehRef?.current?.disableDrawMode();
    });
    cy.on('ehcomplete', async (event, sourceNode, targetNode, addedEdge) => {
      let { position } = event;
      addedEdge?.remove();
      const from = sourceNode?.data('link')?.id;
      const to = targetNode?.data('link')?.id;
      returning.drawendInserting(position, from, to);
    });
    cy.on('tap', async function(event){
      ehRef?.current?.disableDrawMode();
      const ins = insertingCytoRef.current;
      setInsertingCyto({});
      toast.close(ins.toast);
    });
  }, []);

  return returning;
}

export function useLinkReactElements(elements, reactElements, refCy, ml) {
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
          'background-opacity': '0',
        });
      } else {
        cy.$(`#${id}`).data('Component', undefined);
        cy.$(`#${id}`).removeClass('unhoverable');
        cy.$(`#${id}`).style({
          'shape': null,
          width: null,
          height: null,
          'background-opacity': null,
          'border-width': 0,
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
        style={{}}
        onClick={() => {
          toggleLinkReactElement(id)
        }}
      >
        <CatchErrors errorRenderer={(error, reset) => {
          return <div>{String(error)}</div>;
        }}>
          <LinkClientHandlerDefault id={id} ml={ml}/>
        </CatchErrors>
      </div>;
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