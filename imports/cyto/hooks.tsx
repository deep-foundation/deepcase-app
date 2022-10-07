import { Alert, AlertIcon, Box, Flex, HStack, IconButton, Popover, PopoverContent, PopoverTrigger, Spacer, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import { useDeep, useDeepQuery } from "@deep-foundation/deeplinks/imports/client";
import { useMinilinksFilter, useMinilinksHandle } from "@deep-foundation/deeplinks/imports/minilinks";
import { useDebounceCallback } from "@react-hook/debounce";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { TiArrowBackOutline } from "react-icons/ti";
import { VscChromeClose, VscVersions } from "react-icons/vsc";
import { useLocalStorage } from "usehooks-ts";
import { ClientHandler } from "../client-handler";
import { CytoReactLinksCard } from "../cyto-react-links-card";
import { useContainer, useInsertingCytoStore, useLayout, useRefAutofill, useShowExtra, useShowTypes, useSpaceId } from "../hooks";
import { LinkClientHandlerDefault } from "../link-client-handlers/default";
import { CatchErrors } from "../react-errors";
import { useEditorTabs } from "./editor";
import { useCytoFocusMethods } from "./graph";

export interface IInsertedLink {
  position: { x: number; y: number; };
  from: number; to: number;
};

export interface IInsertedLinkProps {
  insertingLink?: IInsertedLink;
  setInsertingLink?: (insertingLink: IInsertedLink) => void;
  ml?: any;
  ehRef?: any;
  returningRef?: any;
  insertLinkRef?: any;
}

export function CytoReactLinksCardInsertNode({
  insertingLink, setInsertingLink, ml, ehRef, returningRef, insertLinkRef,
}: IInsertedLinkProps) {
  const [search, setSearch] = useState('');
  const deep = useDeep();
  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore();
  const [container, setContainer] = useContainer();

  const types = useMinilinksFilter(
    ml,
    useCallback(() => true, []),
    useCallback((l, ml) => (ml.links.filter(l => l._applies.includes('insertable-types'))), []),
  ) || [];

  const elements = (types || [])?.map(t => ({
    id: t.id,
    src:  t?.inByType[deep.idSync('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value || t.id,
    linkName: t?.inByType[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || t.id,
    containerName: t?.inByType[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.from?.value?.value || '',
  }));
  return <CytoReactLinksCard
    elements={elements.filter(el => (!!el?.linkName?.includes && el?.linkName?.toLocaleLowerCase()?.includes(search) || el?.containerName?.includes && el?.containerName?.toLocaleLowerCase()?.includes(search)))}
    search={search}
    onSearch={e => setSearch(e.target.value)}
    onSubmit={async (id) => {
      const insertable = ml.links.filter(l => l._applies.includes('insertable-types'));
      const type = insertable?.find(t => t.id === id);
      const isNode = !type.from_id && !type.to_id;
      setInsertingCyto({});
      if (isNode) {
        await deep.insert({
          type_id: id,
          in: { data: [
            {
              from_id: container,
              type_id: deep.idSync('@deep-foundation/core', 'Contain'),
            },
            {
              from_id: container,
              type_id: deep.idSync('@deep-foundation/core', 'Focus'),
              object: { data: { value: insertingLink.position } },
              in: { data: {
                type_id: deep.idSync('@deep-foundation/core', 'Contain'),
                from_id: container
              } },
            },
          ] },
        });
        setInsertingLink(undefined);
      } else {
        returningRef?.current.startInsertingOfType(id, type.from_id, type.to_id);
        setInsertingLink(undefined);
      }
    }}
  />;
};

export function useLinkInserting(elements = [], reactElements = [], focus, cy, ehRef) {
  const [insertingLink, setInsertingLink] = useState<IInsertedLink>();
  const [container, setContainer] = useContainer();
  const containerRef = useRefAutofill(container);
  const deep = useDeep();
  const deepRef = useRefAutofill(deep);
  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore();
  const insertingCytoRef = useRefAutofill(insertingCyto);
  const toast = useToast();
  const ml = deep.minilinks;

  useHotkeys('esc', e => {
    e.preventDefault();
    e.stopPropagation();
    if (insertingCyto?.type_id) {
      setInsertingCyto(undefined);
    }
  }, { enableOnTags: ["TEXTAREA", "INPUT"] });

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
      ...(valued === deep.idSync('@deep-foundation/core', 'String') ? { string: { data: { value: '' } } } :
        valued === deep.idSync('@deep-foundation/core', 'Number') ? { number: { data: { value: 0 } } } :
        valued === deep.idSync('@deep-foundation/core', 'Object') ? { object: { data: { value: {} } } } :
        {}),
      ...(container && type_id !== deep.idSync('@deep-foundation/core', 'Contain') ? {
        in: { data: {
          from_id: container,
          type_id: deep.idSync('@deep-foundation/core', 'Contain'),
        } },
      } : {}),
      from_id: from || 0,
      to_id: to || 0,
    });

    setInsertingLink((insertLink) => {
      if (!from && !to && !!insertLink) focus(linkId, insertLink.position);
      return undefined;
    })
  }, [cy, types, container, deep.linkId]);
  const insertLinkRef = useRefAutofill(insertLink);

  const TempComponent = useMemo(() => {
    return () => <CytoReactLinksCardInsertNode
      insertingLink={insertingLink}
      setInsertingLink={setInsertingLink}
      ml={ml}
      ehRef={ehRef}
      returningRef={returningRef}
      insertLinkRef={insertLinkRef}
    />;
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
        setInsertingLink(insertedLink);
        if (cy) {
          const el = cy.$('#insert-link-card');
          el.unlock();
          if (!insertedLink.from && !insertedLink.to) {
            el.position(insertedLink.position);
            el.lock();
          }
        }
      } else {
        setInsertingLink(undefined);
      }
    },
    insertingCytoRef,
    insertingCyto,
    startInsertingOfType: (id: number, From: number, To: number) => {
      const link = ml.byId[id];
      const isNode = !link.from_id && !link.to_id;
      const TypeName = link?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || link?.id;
      const FromName = ml.byId[link.from_id]?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || link.from_id;
      const ToName = ml.byId[link.to_id]?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || link.to_id;
      const t = toast({
        title: `Inserting link type of: ${TypeName}`,
        description: `This ${isNode ? `is node type, just click somewhere for insert.` : `is link type, connect two links from typeof ${FromName} to typeof ${ToName} for insert.`}`,
        position: 'bottom-left',
        duration: null,
        icon: <Spinner />,
        isClosable: true,
        onCloseComplete: () => {
          if (insertingCytoRef?.current?.type_id) setInsertingCyto({});
          ehRef?.current?.disableDrawMode();
          cy.$('.eh-ghost,.eh-preview').remove();
        },
      });
      if (!isNode) {
        ehRef?.current?.enableDrawMode();
      }
      setInsertingLink(undefined);
      setInsertingCyto({ isNode, type_id: id, toast: t, From, To });
    },
    drawendInserting: (position, from, to) => {
      const ins = insertingCytoRef.current;
      setInsertingCyto({});
      toast.close(ins.toast);
      ehRef?.current?.disableDrawMode();
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
  const returningRef = useRefAutofill(returning);

  const cyHandledRef = useRef(false);
  useEffect(() => {
    if (!cy || cyHandledRef.current) return;
    cyHandledRef.current = true;
    const ehstop = async (event, sourceNode, targetNode, addedEdge) => {
      let { position } = event;
      addedEdge?.remove();
      ehRef?.current?.disableDrawMode();
      const ins = insertingCytoRef.current;
      if (sourceNode?.id() && !targetNode?.id() && ins._selfLink !== false) {
        ins.from = +sourceNode?.id();
        ins.to = +targetNode?.id();
        ins._selfLink = true;
        setInsertingCyto({ ...ins, from: +sourceNode?.id(), to: +targetNode?.id(), _selfLink: true });
      } else {
        setInsertingCyto({});
      }
      toast.close(ins.toast);
    };
    const ehcomplete = async (event, sourceNode, targetNode, addedEdge) => {
      let { position } = event;
      insertingCytoRef.current._selfLink = false;
      addedEdge?.remove();
      const from = sourceNode?.data('link')?.id;
      const to = targetNode?.data('link')?.id;
      if (from && to) returning.drawendInserting(position, from, to);
    };
    const tap = async function(event){
      ehRef?.current?.disableDrawMode();
      const ins = insertingCytoRef.current;
      setInsertingCyto({});
      toast.close(ins.toast);
      if(event.target === cy){
        if (ins.type_id) {
          if (ins.isNode) {
            await deepRef.current.insert({
              type_id: ins.type_id,
              in: { data: [
                {
                  from_id: containerRef.current,
                  type_id: deep.idSync('@deep-foundation/core', 'Contain'),
                },
                {
                  from_id: containerRef.current,
                  type_id: deep.idSync('@deep-foundation/core', 'Focus'),
                  object: { data: { value: event.position } },
                  in: { data: {
                    type_id: deep.idSync('@deep-foundation/core', 'Contain'),
                    from_id: containerRef.current
                  } },
                },
              ] },
            });
            toast.close(ins.toast);
            setInsertingCyto({});
          } else {
            const Any = deep.idSync('@deep-foundation/core', 'Any');
            if (ins.From === Any && ins.To === Any) {
              await deepRef.current.insert({
                type_id: ins.type_id,
                in: { data: [
                  {
                    from_id: container,
                    type_id: deep.idSync('@deep-foundation/core', 'Contain'),
                  },
                  {
                    from_id: container,
                    type_id: deep.idSync('@deep-foundation/core', 'Focus'),
                    // @ts-ignore
                    object: { data: { value: ins?.position } },
                    in: { data: {
                      type_id: deep.idSync('@deep-foundation/core', 'Contain'),
                      from_id: container
                    } },
                  },
                ] },
              });
            }
            setInsertingCyto({});
          }
        }
        returningRef.current?.openInsertCard(undefined);
      }
    };
    cy.on('ehstop', ehstop);
    cy.on('ehcomplete', ehcomplete);
    cy.on('tap', tap);
    return () => {
      cy.removeListener('ehstop', ehstop);
      cy.removeListener('ehcomplete', ehcomplete);
      cy.removeListener('tap', tap);
    };
  }, [cy]);

  return returning;
}

export function useLinkReactElements(elements = [], reactElements = [], cy, ml) {
  const [linkReactElements, setLinkReactElements] = useState<{ [key: string]: boolean }>({});
  const linkReactElementsIds = useMemo(() => Object.keys(linkReactElements).filter(key => !!linkReactElements[key]), [linkReactElements]).map(key => parseInt(key), [linkReactElements]);

  reactElements.push(...linkReactElementsIds.map(id => (elements.find(e => e.id === id))));

  const cyRef = useRefAutofill(cy);

  const toggleLinkReactElement = (id: number) => {
    setLinkReactElements((linkReactElements) => {
      const cy = cyRef.current;
      const isEnabling = !linkReactElements[id];
      if (isEnabling) {
        cy?.$(`#${id}`).data('Component', AnyLinkComponent);
        cy?.$(`#${id}`).addClass('unhoverable').removeClass('hover');
        cy?.$(`#${id}`).style({
          'shape': 'rectangle',
          'background-opacity': '0',
        });
      } else {
        cy?.$(`#${id}`).data('Component', undefined);
        cy?.$(`#${id}`).removeClass('unhoverable');
        cy?.$(`#${id}`).style({
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
  };

  const AnyLinkComponent = useMemo(() => {
    return function AnyLinkComponent({ id }: { id: number }) {
      const deep = useDeep();
      const [handlerId, setHandlerId] = useState();
      const { onOpen, onClose, isOpen } = useDisclosure();
      const [search, setSearch] = useState('');

      const types = [];
      for(let cursor = deep.minilinks?.byId?.[id]; cursor && cursor.type != cursor; cursor = cursor.type) {
        types.push(cursor.id);
      }

      let handlers = useMinilinksFilter(
        ml,
        useCallback((l) => true, []),
        useCallback((l, ml) => {
          return ml.byType[deep.idSync('@deep-foundation/core', 'Handler')]?.filter(l => (
            !!l?.inByType?.[deep.idSync('@deep-foundation/core', 'HandleClient')]?.filter(l => (
              !!types.includes(l.from_id)
            ))?.length
          ));
        }, [id]),
      ) || [];
      console.log('handlers', handlers, types);

      useEffect(() => {
        if (!handlerId) {
          const handler = handlers?.[0];
          if (handler) {
            setHandlerId(handler.id);
          }
        }
      }, [handlers]);

      const handler = handlers?.find(h => h.id === handlerId);
      const elements = handlers.map(t => ({
        id: t?.id,
        src:  t?.inByType[deep.idSync('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value || t.id,
        linkName: t?.inByType[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || t.id,
        containerName: t?.inByType[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.from?.value?.value || '',
      }));

      return <div>
        <CatchErrors errorRenderer={(error, reset) => {
          return <div>{String(error)}</div>;
        }}>
          <Flex>
            <Popover
              isLazy
              isOpen={isOpen}
              onOpen={onOpen}
              onClose={onClose}
              placement='right-start'
            >
              <PopoverTrigger>
                <IconButton 
                  aria-label='replay to message button'
                  isRound
                  size={'xs'}
                  sx={{
                    _hover: {
                      transform: 'scale(1.2)',
                    }
                  }}
                  icon={<VscVersions />}
                  // onClick={() => console.log('replay')}
                />
              </PopoverTrigger>
              <PopoverContent h={72}>
                <CytoReactLinksCard
                  selectedLinkId={handlerId}
                  elements={elements.filter(el => (!!el?.linkName?.includes && el?.linkName?.toLocaleLowerCase()?.includes(search) || el?.containerName?.includes && el?.containerName?.toLocaleLowerCase()?.includes(search)))}
                  search={search}
                  onSearch={e => setSearch(e.target.value)}
                  onSubmit={async (id) => {
                    setHandlerId(id);
                    onClose();
                  }}
                  fillSize
                />
              </PopoverContent>
            </Popover>
            <Spacer />
            <IconButton
              isRound
              aria-label='close client handler'
              size={'xs'}
              sx={{
                _hover: {
                  transform: 'scale(1.2)',
                }
              }}
              icon={<VscChromeClose />}
              onClick={() => toggleLinkReactElement(id)}
            />
          </Flex>
          {!handler?.id && <Alert status='error'><AlertIcon />Compatable HandleClient not founded.</Alert>}
          {!!handler?.id && <ClientHandler handlerId={handler?.id} linkId={id} ml={ml}/>}
        </CatchErrors>
      </div>;
    };
  }, [cy]);

  return {
    toggleLinkReactElement,
    linkReactElements: linkReactElementsIds,
  };
}

export function useCytoEditor() {
  return useLocalStorage('cyto-editor', false);
}

export function useCyInitializer({
  elementsRef,
  elements,
  reactElements,
  cy,
  setCy,
  ehRef,
  cytoViewportRef,
}: {
  elementsRef: any;
  elements: any;
  reactElements: any;
  cy: any;
  setCy: any;
  ehRef: any;
  cytoViewportRef: any;
}) {
  const deep = useDeep();
  const { layout, setLayout } = useLayout();
  const [extra, setExtra] = useShowExtra();
  const [spaceId, setSpaceId] = useSpaceId();
  const [container, setContainer] = useContainer();
  const [showTypes, setShowTypes] = useShowTypes();
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const containerRef = useRefAutofill(container);
  const ml = deep.minilinks;

  const {
    addTab,
    activeTab,
  } = useEditorTabs();

  const refDragStartedEvent = useRef<any>();

  const { linkReactElements, toggleLinkReactElement } = useLinkReactElements(elements, reactElements, cy, ml);

  const relayout = useCallback(() => {
    if (cy && cy.elements) {
      const elements = cy.elements();
      try {
        elements.layout(layout(elementsRef.current, cy)).run();
      } catch(error) {
        console.log('relayout error', error);
      }
    }
  }, [cy, layout]);
  const relayoutDebounced = useDebounceCallback(relayout, 500);
  global.relayoutDebounced = relayoutDebounced;

  useEffect(() => {
    if (!refDragStartedEvent.current) {
      relayoutDebounced();
    }
  }, [extra, layout, showTypes]);
  useMinilinksHandle(ml, (event, oldLink, newLink) => {
    relayoutDebounced();
  });

  const { focus, unfocus, lockingRef } = useCytoFocusMethods(cy, relayoutDebounced);
  const { startInsertingOfType, openInsertCard, insertLink, drawendInserting, insertingCyto, insertingCytoRef } = useLinkInserting(elements, reactElements, focus, cy, ehRef);

  const onLoaded = (ncy) => {
    const locking = lockingRef.current;

    // ncy.use(cytoscapeLasso);

    let eh = ehRef.current = ncy.edgehandles({
      // canConnect: function( sourceNode, targetNode ){
      //   // whether an edge can be created between source and target
      //   return !sourceNode.same(targetNode); // e.g. disallow loops
      // },
      // edgeParams: function( sourceNode, targetNode ){
      //   // for edges between the specified source and target
      //   // return element object to be passed to cy.add() for edge
      //   return {};
      // },
      hoverDelay: 150, // time spent hovering over a target node before it is considered selected
      snap: true, // when enabled, the edge can be drawn by just moving close to a target node (can be confusing on compound graphs)
      snapThreshold: 0, // the target node must be less than or equal to this many pixels away from the cursor/finger
      snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
      noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
      disableBrowserGestures: true // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
    });
    const layoutstart = () => {
      console.time('layout');
    };
    const layoutstop = () => {
      console.timeEnd('layout');
    };
    const mouseover = function(e) {
      var node = e.target;
      if (!node.is(':parent')) {
        const id = node?.data('link')?.id;
        if (id) {
          ncy.$(`node, edge`).not(`#${id},#${id}-from,#${id}-to,#${id}-type`).removeClass('hover');
          ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).not(`.unhoverable`).addClass('hover');
        }
        if (node.locked) {
          node.unlock();
          node.mouseHoverDragging = true;
        }
      }
    };
    const mouseout = function(e) {
      var node = e.target;
      if (!node.is(':parent')) {
        const id = node?.data('link')?.id;
        if (id) {
          ncy.$(`node, edge`).removeClass('hover');
        }
        if (node.mouseHoverDragging) {
          node.lock();
          node.mouseHoverDragging = false;
        }
      }
    };
    const click = function(e) {
      var node = e.target;
      const id = node?.data('link')?.id;
      if (id) {
        toggleLinkReactElement(id);
      }
    };
    const tapstart = function(evt){
      var node = evt.target;
      refDragStartedEvent.current = evt;
    };
    let dragendData: any = undefined;
    const tapend = function(evt){
      var node = evt.target;
      refDragStartedEvent.current = undefined;
      dragendData = { position: evt.position };
      evt.target.emit('dragend');
    };
    const dragend = async function(evt){
      var node = evt.target;
      const id = node?.data('link')?.id;
      const ins = insertingCytoRef.current;
      if (ins?.from && !ins?.to && ins._selfLink) {
        await deep.insert({
          type_id: ins.type_id,
          from_id: ins?.from,
          to_id: ins?.from,
          in: { data: [
            {
              from_id: containerRef.current,
              type_id: deep.idSync('@deep-foundation/core', 'Contain'),
            },
          ] },
        });
      } else if (id) {
        focus(node, dragendData?.position);
        dragendData = undefined;
        ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).addClass('focused');
      }
    };

    const nodeMenu = ncy.cxtmenu({
      selector: '.link-node',
      outsideMenuCancel: 10,
      commands: [
        {
          content: 'editor',
          select: function(ele){
            const id = ele.data('link')?.id;
            if (id) {
              addTab({
                id, saved: true,
                initialValue: deep.stringify(ml.byId[id]?.value?.value),
              });
              activeTab(id);
              setCytoEditor(true);
            }
          }
        },
        {
          content: 'unlock',
          select: function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              unfocus(ele);
              ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).removeClass('focused');
            }
          }
        },
        {
          content: 'delete',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              await deep.delete(+id);
            }
          }
        },
        {
          content: 'delete down',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              await deep.delete({
                up: {
                  tree_id: { _eq: deep.idSync('@deep-foundation/core', 'containTree') },
                  parent_id: { _eq: +id },
                },
              });
            }
          }
        },
        {
          cy,
          setCy,
          content: 'insert',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              startInsertingOfType(id, 0, 0);
            }
          }
        },
        {
          content: 'login',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              const { linkId } = await deep.login({ linkId: +id });
              if (linkId) {
                setSpaceId(+id);
                setContainer(+id);
              }
            }
          }
        },
        {
          content: 'space',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              setSpaceId(+id);
              setContainer(+id);
            }
          }
        },
        {
          content: 'container',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              setContainer(+id);
            }
          }
        },
      ]
    });
  
    const bodyMenu = ncy.cxtmenu({
      selector: 'core',
      outsideMenuCancel: 10,
      commands: [
        {
          content: 'insert',
          select: function(el, ev){
            openInsertCard({ position: ev.position, from: 0, to: 0 });
          }
        },
        {
          content: 'center',
          select: function(el, ev){
            ncy.pan({ x: 0, y: 0 });
            ncy.zoom(1);
          }
        }
      ]
    });

    // edgehandles bug fix, clear previous edgehandles
    const cxttapstart = async function(event){
      ncy.$('.eh-ghost,.eh-preview').remove();
    };

    const updatedListener = (oldLink, newLink) => {
      // on update link or link value - unlock reposition lock
      if (
        newLink.type_id === deep.idSync('@deep-foundation/core', 'Focus') && newLink?.value?.value?.x &&
        
        // if true - we remember how WE lock it, ok, we have updatefrom db...
        // if undefined - we not know lock/not lock... just update from db...
        // if false - we must stop update from db, we already unlock it on client, and not need to update focus from db... it mistake
        // this line - fix it
        locking[newLink.to_id] !== false
      ) {
        const node = ncy.$(`node#${newLink.to_id}`);
        if (!node.mouseHoverDragging) {
          node.unlock();
          node.position(newLink?.value?.value);
          relayoutDebounced();
          node.lock();
        }
      }
    };

    const viewport = (event) => {
      cytoViewportRef?.current?.setValue({ pan: ncy.pan(), zoom: ncy.zoom() });
    }

    ncy.on('cxttapstart', cxttapstart);
    ncy.on('dragend', 'node', dragend);
    ncy.on('tapend', 'node', tapend);
    ncy.on('tapstart', 'node', tapstart);
    ncy.on('click', '.link-from, .link-to, .link-type, .link-node', click);
    ncy.on('mouseout', '.link-from, .link-to, .link-type, .link-node', mouseout);
    ncy.on('mouseover', '.link-from, .link-to, .link-type, .link-node', mouseover);
    ncy.on('layoutstart', layoutstart);
    ncy.on('layoutstop', layoutstop);
    ncy.on('viewport', viewport);

    ml.emitter.on('updated', updatedListener);
    // ncy.lassoSelectionEnabled(true);

    setCy(ncy);

    return () => {
      ncy.removeListener('cxttapstart', cxttapstart);
      ncy.removeListener('dragend', 'node', dragend);
      ncy.removeListener('tapend', 'node', tapend);
      ncy.removeListener('tapstart', 'node', tapstart);
      ncy.removeListener('click', '.link-from, .link-to, .link-type, .link-node', click);
      ncy.removeListener('mouseout', '.link-from, .link-to, .link-type, .link-node', mouseout);
      ncy.removeListener('mouseover', '.link-from, .link-to, .link-type, .link-node', mouseover);
      ncy.removeListener('layoutstart', layoutstart);
      ncy.removeListener('layoutstop', layoutstop);
      ncy.removeListener('viewport', viewport);
      
      ml.emitter.removeListener('updated', updatedListener);

      nodeMenu.destroy();
      bodyMenu.destroy();
    };
  };
  return {
    onLoaded,
    relayoutDebounced,
  };
}