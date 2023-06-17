import { Alert, AlertIcon, Box, Flex, HStack, IconButton, Popover, PopoverContent, PopoverTrigger, Spacer, Spinner, useDisclosure, useToast } from "@chakra-ui/react";
import { useDeep, useDeepQuery, useDeepSubscription } from "@deep-foundation/deeplinks/imports/client";
import { useMinilinksFilter, useMinilinksHandle, useMinilinksQuery } from "@deep-foundation/deeplinks/imports/minilinks";
import { useDebounceCallback } from "@react-hook/debounce";
import { useState, useMemo, useCallback, useEffect, useRef } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { TiArrowBackOutline } from "react-icons/ti";
import { VscChromeClose, VscVersions } from "react-icons/vsc";
import { BsArrowsFullscreen } from "react-icons/bs";
import { ClientHandler } from "../client-handler";
import { CytoReactLinksCard } from "../cyto-react-links-card";
import { useContainer, useInsertingCytoStore, useUpdatingCytoStore, useLayout, useRefAutofill, useShowExtra, useShowTypes, useSpaceId, useAutoFocusOnInsert } from "../hooks";
import { LinkClientHandlerDefault } from "../link-client-handlers/default";
import { CatchErrors } from "../react-errors";
import { useEditorTabs } from "./editor";
import { useCytoFocusMethods } from "./graph";
import { useRouter } from 'next/router';
import { useQueryStore } from '@deep-foundation/store/query';
import { initializeTraveler } from "./traveler";
import { MdFolderDelete } from 'react-icons/md';

export interface IInsertedLink {
  position: { x: number; y: number; };
  from: number; to: number;
};

export interface IUpdatedLink {
  position: { x: number; y: number; };
  from: number; to: number;
};

const delay = (time) => new Promise(res => setTimeout(res, time));

export interface IInsertedLinkProps {
  insertingLink?: IInsertedLink;
  setInsertingLink?: (insertingLink: IInsertedLink) => void;
  ml?: any;
  ehRef?: any;
  returningRef?: any;
  insertLinkRef?: any;
}

export function CytoReactLinksCardInsertNode({
  insertingLink, setInsertingLink,
  ml, ehRef, returningRef, insertLinkRef,
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
    src:  t?.inByType[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value || t.id,
    linkName: t?.inByType[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || t.id,
    containerName: t?.inByType[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.from?.value?.value || '',
  }));
  console.log('elements-hooks', elements);
  return <CytoReactLinksCard
    elements={elements.filter(el => (!!el?.linkName?.includes && el?.linkName?.toLocaleLowerCase()?.includes(search) || el?.containerName?.includes && el?.containerName?.toLocaleLowerCase()?.includes(search)))}
    search={search}
    onSearch={e => setSearch(e.target.value)}
    onSubmit={async (id) => {
      const insertable = ml.links.filter(l => l._applies.includes('insertable-types'));
      const type = insertable?.find(t => t.id === id);
      const isNode = !type.from_id && !type.to_id;
      setInsertingCyto({});
      returningRef?.current.startInsertingOfType(id, type.from_id, type.to_id);
      setInsertingLink(undefined);
    }}
  />;
};

export function useLinkInserting(elements = [], reactElements = [], focus, cyRef, ehRef) {
  const [insertingLink, setInsertingLink] = useState<IInsertedLink>();
  const [updatingLink, setUpdatingLink] = useState<IInsertedLink>();
  const [container, setContainer] = useContainer();
  const containerRef = useRefAutofill(container);
  const [spaceId, setSpaceId] = useSpaceId();
  const spaceIdRef = useRefAutofill(spaceId);
  const deep = useDeep();
  const deepRef = useRefAutofill(deep);
  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore();
  const [updatingCyto, setUpdatingCyto] = useUpdatingCytoStore();
  const insertingCytoRef = useRefAutofill(insertingCyto);
  const updatingCytoRef = useRefAutofill(updatingCyto);
  const toast = useToast();
  const ml = deep.minilinks;

  useHotkeys('esc', e => {
    e.preventDefault();
    e.stopPropagation();
    if (insertingCyto?.type_id) {
      setInsertingCyto(undefined);
    }
  }, { enableOnFormTags: ["TEXTAREA", "INPUT"] });

  const types = useMinilinksFilter(
    ml,
    useCallback(() => true, []),
    useCallback((l, ml) => (ml.links.filter(l => l._applies.includes('insertable-types'))), []),
  ) || [];

  const [autoFocus, setAutoFocus] = useAutoFocusOnInsert();
  const autoFocusRef = useRefAutofill(autoFocus);

  const insertLink = useCallback(async (type_id, from, to, position: any) => {
    const loadedLink = types?.find(t => t.id === type_id);
    const valued = loadedLink?.valued?.[0]?.to_id;
    const inArray = [];
    if (position && autoFocusRef.current && !from && !to) {
      console.log('insertLink2', type_id, from, to, position, autoFocusRef.current);
      inArray.push({
        from_id: spaceIdRef.current,
        type_id: deep.idLocal('@deep-foundation/core', 'Focus'),
        object: { data: { value: position } },
        ...(containerRef.current ? { in: { data: {
          type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
          from_id: containerRef.current
        } } } : {}),
      });
    }
    if (container && type_id !== deep.idLocal('@deep-foundation/core', 'Contain')) {
      inArray.push({
        from_id: container,
        type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
      });
    }
    const { data: [{ id: linkId }] } = await deep.insert({
      type_id: type_id,
      ...(valued === deep.idLocal('@deep-foundation/core', 'String') ? { string: { data: { value: '' } } } :
        valued === deep.idLocal('@deep-foundation/core', 'Number') ? { number: { data: { value: 0 } } } :
        valued === deep.idLocal('@deep-foundation/core', 'Object') ? { object: { data: { value: {} } } } :
        {}),
      ...(!!inArray.length ? { in: { data: inArray } } : {}),
      from_id: from || 0,
      to_id: to || 0,
    });

    // setInsertingLink((insertLink) => {
    //   if (!from && !to && !!insertLink) focus(linkId, insertLink.position);
    //   return undefined;
    // })
  }, [cyRef.current, types, container, deep.linkId]);
  const insertLinkRef = useRefAutofill(insertLink);

  const updateLink = useCallback(async (id, from, to, position: any) => {
    const { data: [{ id: linkId }] } = await deep.update(id, {
      from_id: from || 0,
      to_id: to || 0,
    });
  }, [cyRef.current, types, container, deep.linkId]);
  const updateLinkRef = useRefAutofill(updateLink);

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

  useHotkeys('esc', () => {
    if (insertingCytoRef?.current?.type_id) setInsertingCyto({});
    ehRef?.current?.disableDrawMode();
    cyRef.current?.$('.eh-ghost,.eh-preview')?.remove();
  });

  const returning = {
    insertLink,
    openInsertCard: (insertedLink: IInsertedLink) => {
      if (insertedLink) {
        setInsertingLink(insertedLink);
        if (cyRef.current) {
          const el = cyRef.current.$('#insert-link-card');
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
    startUpdatingLink: (id: number) => {
      const link = ml.byId[id];
      const linkName = link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || link?.id;
      const Type = link.type;
      const TypeName = Type?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || Type?.id;
      const FromName = ml.byId[Type.from_id]?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || Type.from_id;
      const ToName = ml.byId[Type.to_id]?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || Type.to_id;
      const t = toast({
        title: `Updating link: ${linkName} type of: ${TypeName}`,
        position: 'bottom-left',
        duration: null,
        icon: <Spinner />,
        isClosable: true,
        onCloseComplete: () => {
          if (updatingCytoRef?.current?.id) setUpdatingCyto({});
          ehRef?.current?.disableDrawMode();
          cyRef.current?.$('.eh-ghost,.eh-preview')?.remove();
        },
      });
      ehRef?.current?.enableDrawMode();
      setUpdatingLink(undefined);
      setUpdatingCyto({ id, toast: t });
    },
    startInsertingOfType: (id: number, From: number, To: number) => {
      const link = ml.byId[id];
      const isNode = !link.from_id && !link.to_id;
      const isPossibleNode = isNode || (link.from_id === link.to_id && link.from_id === deep.idLocal('@deep-foundation/core', 'Any'));
      const TypeName = link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || link?.id;
      const FromName = ml.byId[link.from_id]?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || link.from_id;
      const ToName = ml.byId[link.to_id]?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || link.to_id;
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
          cyRef.current?.$('.eh-ghost,.eh-preview')?.remove();
        },
      });
      if (!isNode) {
        ehRef?.current?.enableDrawMode();
      }
      setInsertingLink(undefined);
      setInsertingCyto({ isNode, isPossibleNode, type_id: id, toast: t, From, To });
    },
    drawendInserting: (position, from, to) => {
      const ins = insertingCytoRef.current;
      setInsertingCyto({});
      toast.close(ins.toast);
      ehRef?.current?.disableDrawMode();
      cyRef.current.$('.eh-ghost,.eh-preview').remove();
      if (ins.type_id) {
        insertLinkRef.current(ins.type_id, +from, +to, position);
      } else {
        returning.openInsertCard({
          position, from, to
        });
      }
    },
    drawendUpdating: (position, from, to) => {
      const upd = updatingCytoRef.current;
      setUpdatingCyto({});
      toast.close(upd.toast);
      ehRef?.current?.disableDrawMode();
      cyRef.current.$('.eh-ghost,.eh-preview').remove();
      updateLinkRef.current(upd.id, +from, +to, position);
    },
  };
  const returningRef = useRefAutofill(returning);

  const cyHandledRef = useRef(false);
  useEffect(() => {
    if (!cyRef.current || cyHandledRef.current) return;
    cyHandledRef.current = true;
    const ehstop = async (event, sourceNode, targetNode, addedEdge) => {
      let { position } = event;
      addedEdge?.remove();
      ehRef?.current?.disableDrawMode();
      if (insertingCytoRef.current.type_id) {
        const ins = insertingCytoRef.current;
        if (sourceNode?.id() && !targetNode?.id() && ins._selfLink !== false) {
          ins.from = +sourceNode?.id();
          ins.to = +targetNode?.id();
          ins._selfLink = true;
          setInsertingCyto({ ...ins, from: +sourceNode?.id(), to: +sourceNode?.id(), _selfLink: true });
        } else {
          setInsertingCyto({});
        }
        toast.close(ins.toast);
      } else if (updatingCytoRef.current.id) {
        const upd = updatingCytoRef.current;
        if (sourceNode?.id() && !targetNode?.id() && upd._selfLink !== false) {
          upd.from = +sourceNode?.id();
          upd.to = +targetNode?.id();
          if (sourceNode?.id() === updatingCytoRef.current.id) {
            upd._selfLink = true;
            setUpdatingCyto({ ...upd, from: 0, to: 0, _selfLink: true });
          } else {
            returning.drawendUpdating(position, upd.from, upd.from);
          }
        }
        toast.close(upd.toast);
      }
    };
    const ehcomplete = async (event, sourceNode, targetNode, addedEdge) => {
      let { position } = event;
      if (insertingCytoRef.current.type_id) {
        insertingCytoRef.current._selfLink = false;
        addedEdge?.remove();
        const from = sourceNode?.data('link')?.id;
        const to = targetNode?.data('link')?.id;
        if (from && to) returning.drawendInserting(position, from, to);
      } else if (updatingCytoRef.current.id) {
        updatingCytoRef.current._selfLink = false;
        addedEdge?.remove();
        const from = sourceNode?.data('link')?.id;
        const to = targetNode?.data('link')?.id;
        if (from && to) returning.drawendUpdating(position, from, to);
      }
    };
    const tap = async function(event){
      ehRef?.current?.disableDrawMode();
      setInsertingLink(undefined);
      if (insertingCytoRef.current.type_id) {
        const ins = insertingCytoRef.current;
        setInsertingCyto({});
        toast.close(ins.toast);
        if(event.target === cyRef.current){
          if (ins.type_id) {
            if (ins.isPossibleNode) {
              await returningRef.current.insertLink(ins.type_id, 0, 0, event.position);
              // await deepRef.current.insert({
              //   type_id: ins.type_id,
              //   in: { data: [
              //     {
              //       from_id: containerRef.current,
              //       type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
              //     },
              //     {
              //       from_id: containerRef.current,
              //       type_id: deep.idLocal('@deep-foundation/core', 'Focus'),
              //       object: { data: { value: event.position } },
              //       in: { data: {
              //         type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
              //         from_id: containerRef.current
              //       } },
              //     },
              //   ] },
              // });
              toast.close(ins.toast);
              setInsertingCyto({});
            } else {
              const Any = deep.idLocal('@deep-foundation/core', 'Any');
              if (ins.From === Any && ins.To === Any) {
                // @ts-ignore
                await returningRef.current.insertLink(ins.type_id, 0, 0, ins?.position);
              }
              setInsertingCyto({});
            }
          }
          returningRef.current?.openInsertCard(undefined);
        }
      }
    };
    cyRef.current.on('ehstop', ehstop);
    cyRef.current.on('ehcomplete', ehcomplete);
    cyRef.current.on('tap', tap);
    return () => {
      cyRef.current.removeListener('ehstop', ehstop);
      cyRef.current.removeListener('ehcomplete', ehcomplete);
      cyRef.current.removeListener('tap', tap);
    };
  }, [cyRef.current]);

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

      const handlers = deep.useMinilinksQuery({
        type_id: deep.idLocal('@deep-foundation/core', 'Handler'),
        in: {
          type_id: deep.idLocal('@deep-foundation/core', 'HandleClient'),
          _or: types.map(type => ({ from_id: { _eq: type } })),
        },
      });

      useEffect(() => {
        if (!handlerId) {
          const handler: any = handlers?.[0];
          if (handler) {
            setHandlerId(handler.id);
          }
        }
      }, [handlers]);

      const handler = handlers.find(h => h.id === handlerId);
      const elements = handlers?.map(t => ({
        id: t?.id,
        src:  t?.inByType[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value || t.id,
        linkName: t?.inByType[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || t.id,
        containerName: t?.inByType[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.from?.value?.value || '',
      })) || [];

      const onCloseCard = useCallback(() => toggleLinkReactElement(id), [id]);
      return <div>
        <CatchErrors errorRenderer={(error, reset) => {
          return <div>{String(error)}</div>;
        }}>
          <Flex mb='0.25rem' minW='7rem'>
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
                  bg='whiteGray'
                  borderColor='borderColor'
                  borderWidth='thin'
                  size={'xs'}
                  sx={{
                    marginRight: '0.5rem',
                    _hover: {
                      transform: 'scale(1.2)',
                    }
                  }}
                  icon={<VscVersions />}
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
            <IconButton
              isRound
              aria-label='open new full tab'
              size={'xs'}
              as='a'
              bg='whiteGray'
              borderColor='borderColor'
              borderWidth='thin'
              target='_blank'
              href={`/client-handler?props=%7B"linkId"%3A${id}%2C"handlerId"%3A${handlerId}%7D`}
              sx={{
                _hover: {
                  transform: 'scale(1.2)',
                }
              }}
              icon={<BsArrowsFullscreen />}
            />
            <Spacer />
            <IconButton
              isRound
              aria-label='close client handler'
              size={'xs'}
              bg='whiteGray'
              borderColor='borderColor'
              borderWidth='thin'
              sx={{
                _hover: {
                  transform: 'scale(1.2)',
                }
              }}
              icon={<VscChromeClose />}
              onClick={onCloseCard}
            />
          </Flex>
          {!handler?.id && <Alert status='error'><AlertIcon />Compatible HandleClient not found.</Alert>}
          {!!handler?.id && <ClientHandler handlerId={handler?.id} linkId={id} ml={ml} onClose={onCloseCard}/>}
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
  return useQueryStore('cyto-editor', false);
}

export function useCyInitializer({
  elementsRef,
  elements,
  reactElements,
  cyRef,
  setCy,
  ehRef,
  cytoViewportRef,
}: {
  elementsRef: any;
  elements: any;
  reactElements: any;
  cyRef: any;
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
  const spaceIdRef = useRefAutofill(spaceId);
  const deepRef = useRefAutofill(deep);

  const {
    addTab,
    activeTab,
  } = useEditorTabs();

  const refDragStartedEvent = useRef<any>();

  const { linkReactElements, toggleLinkReactElement } = useLinkReactElements(elements, reactElements, cyRef.current, ml);


  // const relayout = useCallback(() => {
  //   if (cyRef.current && cyRef.current.elements) {
  //     const elements = cyRef.current.elements();
  //     try {
  //       elements.layout(layout(elementsRef.current, cyRef.current)).run();
  //     } catch(error) {
  //       console.log('relayout error', error);
  //     }
  //   }
  // }, [cyRef.current, layout]);
  // const relayoutDebounced = useDebounceCallback(relayout, 500);
  // const globalAny:any = global;
  // globalAny.relayoutDebounced = relayoutDebounced;


  // const globalAny:any = global;
  // globalAny.relayoutDebounced = relayoutDebounced;


  const { focus, unfocus, lockingRef } = useCytoFocusMethods(cyRef.current);
  const { startInsertingOfType, startUpdatingLink, openInsertCard, insertLink, drawendInserting, insertingCyto, insertingCytoRef } = useLinkInserting(elements, reactElements, focus, cyRef, ehRef);

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
      // console.time('layout');
    };
    const layoutstop = () => {
      // console.timeEnd('layout');
    };
    const mouseover = function(e) {
      var node = e.target;
      if (!node.is(':parent')) {
        const id = node?.data('link')?.id;
        if (id) {
          ncy.$(`node, edge`).not(`#${id},#${id}-from,#${id}-to,#${id}-type`).removeClass('hover');
          ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).not(`.unhoverable`).addClass('hover');
        }
        if (node.locked()) {
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
              type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
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
      menuRadius: function(ele){ return 108; },
      outsideMenuCancel: 10,
      openMenuEvents: 'cxttapstart taphold ctxmenu-nodeMenu-open',
      closeMenuEvents: 'ctxmenu-nodeMenu-close',
      activeFillColor: 'rgba(0, 128, 255, 0.75)', // the colour used to indicate the selected command
      activePadding: 2, // additional size in pixels for the active command
      indicatorSize: 16, // the size in pixels of the pointer to the active command, will default to the node size if the node size is smaller than the indicator size, 
      separatorWidth: 3, // the empty spacing in pixels between successive commands
      spotlightPadding: 3, // extra spacing in pixels between the element and the spotlight
      adaptativeNodeSpotlightRadius: true,
      commands: [
        {
          content: 'editor',
          contentStyle: { fontSize: '0.9rem', transform: 'rotate(70deg)' },
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
          contentStyle: { fontSize: '0.9rem', transform: 'rotate(35deg)' },
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
              if (confirm(`Are you shure whant to delete this link?`)) {
                await deep.delete(+id);
              }
            }
          }
        },
        {
          content: 'delete down',
          contentStyle: { fontSize: '0.7rem', transform: 'rotate(-35deg)' },
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              if (confirm(`Are you shure whant to delete all links down by contain tree?`)) {
                await deep.delete({
                  up: {
                    tree_id: { _eq: deep.idLocal('@deep-foundation/core', 'containTree') },
                    parent_id: { _eq: +id },
                  },
                });
              }
            }
          }
        },
        {
          ncy,
          setCy,
          content: 'insert',
          contentStyle: { fontSize: '0.9rem', transform: 'rotate(-70deg)' },
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              startInsertingOfType(id, 0, 0);
            }
          }
        },
        {
          content: 'update',
          contentStyle: { fontSize: '0.9rem', transform: 'rotate(70deg)' },
          select: async function(ele) {
            const id = ele.data('link')?.id;
            if (id) {
              startUpdatingLink(id);
            }
          },
        },
        {
          content: 'login',
          contentStyle: { fontSize: '0.9rem', transform: 'rotate(35deg)' },
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
          contentStyle: { fontSize: '0.9rem', transform: 'rotate(-35deg)' },
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              setContainer(+id);
            }
          }
        },
        {
          content: (ele) => `traveler (${traveler.findTravlers(undefined, ele.data('link')?.id)?.length})`,
          contentStyle: { fontSize: '0.6rem', transform: 'rotate(-70deg)', paddingLeft: '6px' },
          select: async function(ele){
            const id = ele.data('link')?.id;
            if (id) {
              await delay(60);
              ele.emit('ctxmenu-nodeMenu-close');
              await delay(60);
              ele.emit('ctxmenu-travelerMenu-open');
            }
          }
        },
      ]
    });

    const traveler = initializeTraveler(ncy, deepRef, spaceIdRef);
  
    const bodyMenu = ncy.cxtmenu({
      selector: 'core',
      outsideMenuCancel: 10,
      commands: [
        {
          content: 'insert',
          select: function(el, ev){
            setTimeout(()=>{
              openInsertCard({ position: ev.position, from: 0, to: 0 });
            },1);
          }
        },
        {
          content: 'center',
          select: function(el, ev){
            ncy.pan({ x: window.innerWidth / 2, y: window.innerHeight / 2 });
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
        newLink.type_id === deep.idLocal('@deep-foundation/core', 'Focus') && newLink?.value?.value?.x &&
        
        // if true - we remember how WE lock it, ok, we have updatefrom db...
        // if undefined - we not know lock/not lock... just update from db...
        // if false - we must stop update from db, we already unlock it on client, and not need to update focus from db... it mistake
        // this line - fix it
        locking[newLink.to_id] !== false
      ) {
        const node = ncy.$(`node#${newLink.to_id}`);
        if (!node.mouseHoverDragging) {
          node.unlock();
          // node.position(newLink?.value?.value);
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
      traveler.destroy();
    };
  };
  return {
    onLoaded,
  };
}