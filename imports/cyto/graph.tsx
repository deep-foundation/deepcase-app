import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
// import klay from 'cytoscape-klay';
import dagre from 'cytoscape-dagre';
// import elk from 'cytoscape-elk';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { useDebounceCallback } from '@react-hook/debounce';
import cola from 'cytoscape-cola';
import COSEBilkent from 'cytoscape-cose-bilkent';
import cxtmenu from 'cytoscape-cxtmenu';
import edgehandles from 'cytoscape-edgehandles';
import d3Force from 'cytoscape-d3-force';
import fcose from 'cytoscape-fcose';
import euler from 'cytoscape-euler';
import elk from 'cytoscape-elk';
import cytoscapeLasso from 'cytoscape-lasso';
import { useCytoElements } from './elements';
import { useInsertedLink, useLinkReactElements, useCytoEditor } from './hooks';
import { CytoGraphProps } from './types';
import { layoutCosePreset, layoutColaPreset } from './layouts';
import { CytoReactLayout } from './react';
import { useColorModeValue, useToast, Spinner } from '../framework';
import { useChackraColor, useChackraGlobal } from '../get-color';
import { useBaseTypes, useContainer, useFocusMethods, useInserting, useLayout, useRefAutofill, useShowExtra, useShowTypes, useSpaceId } from '../hooks';
import { useRerenderer } from '../rerenderer-hook';
import { CytoEditor, useEditorTabs } from './editor';
import { useMinilinksHandle } from '@deep-foundation/deeplinks/imports/minilinks';
import { CytoDropZone } from './drop-zone';
import { useCytoStylesheets } from './stylesheets';

cytoscape.use(dagre);
cytoscape.use(cola);
cytoscape.use(COSEBilkent);
// cytoscape.use(klay);
cytoscape.use(elk);
cytoscape.use(euler);
cytoscape.use(d3Force);
cytoscape.use(fcose);
cytoscape.use(cxtmenu);
cytoscape.use(edgeConnections);
cytoscape.use(edgehandles);
cytoscape.use(cytoscapeLasso);

function useCytoFocusMethods(cy, relayoutDebounced) {
  const { focus, unfocus } = useFocusMethods();
  const lockingRef = useRef<any>({});
  return {
    lockingRef,
    focus: async (elOrEl, position) => {
      if (typeof(elOrEl) === 'number') {
        return await focus(elOrEl, position);
      } else {
        const el = elOrEl;
        const id = el?.data('link')?.id;
        const locking = lockingRef.current;
        if (id) {
          locking[id] = true;
          el.position(position);
          el.lock();
          const focused = await focus(id, position);
          relayoutDebounced();
          return focused;
        }
      }
    },
    unfocus: async (elOrEl) => {
      if (typeof(elOrEl) === 'number') {
        return await unfocus(elOrEl);
      } else {
        const el = elOrEl;
        const locking = lockingRef.current;
        const id = el?.data('link')?.id;
        if (id) {
          el._locked = false;
          el.unlock();
          locking[id] = false;
          unfocus(id);
          relayoutDebounced();
        }
      }
    }
  };
}

export default function CytoGraph({
  links = [],
  ml,
}: CytoGraphProps){
  console.time('CytoGraph');
  const deep = useDeep();
  const [baseTypes, setBaseTypes] = useBaseTypes();
  const [spaceId, setSpaceId] = useSpaceId();
  const [container, setContainer] = useContainer();
  const [extra, setExtra] = useShowExtra();
  const [showTypes, setShowTypes] = useShowTypes();
  const [inserting, setInserting] = useInserting();
  const insertingRef = useRefAutofill(inserting);
  const toast = useToast()

  const refCy = useRef<any>();

  useEffect(() => {(async () => {
    try {
      setBaseTypes({
        Package: await deep.id('@deep-foundation/core', 'Package'),
        containTree: await deep.id('@deep-foundation/core', 'containTree'),
        Contain: await deep.id('@deep-foundation/core', 'Contain'),
        Focus: await deep.id('@deep-foundation/core', 'Focus'),
        Active: await deep.id('@deep-foundation/core', 'Active'),
        Query: await deep.id('@deep-foundation/core', 'Query'),
        Space: await deep.id('@deep-foundation/core', 'Space'),
        Value: await deep.id('@deep-foundation/core', 'Value'),
        String: await deep.id('@deep-foundation/core', 'String'),
        Number: await deep.id('@deep-foundation/core', 'Number'),
        Object: await deep.id('@deep-foundation/core', 'Object'),
        User: await deep.id('@deep-foundation/core', 'User'),
        Any: await deep.id('@deep-foundation/core', 'Any'),
        Symbol: await deep.id('@deep-foundation/core', 'Symbol'),
        GeneratedFrom: await deep.id('@deep-foundation/core', 'GeneratedFrom'),
      });
    } catch(error) {}
  })()}, []);

  // links visualization
  let cy = refCy.current?._cy;

  const { elements, reactElements } = useCytoElements(ml, links, baseTypes, cy, spaceId);
  const elementsRef = useRefAutofill(elements);

  const { layout, setLayout } = useLayout();

  const relayout = useCallback(() => {
    let cy = refCy.current?._cy;
    const elements = cy.elements();
    elements.layout(layout(elementsRef.current, cy)).run();
  }, [layout]);
  const relayoutDebounced = useDebounceCallback(relayout, 500);
  global.relayoutDebounced = relayoutDebounced;

  const { focus, unfocus, lockingRef } = useCytoFocusMethods(cy, relayoutDebounced);

  // elements.push({ 
  //   id: 'demo-query-link-node',
  //   data: { id: 'demo-query-link-node', label: 'Node big' }, 
  //   selectable: false,
  //   classes: 'query-link-node',
  // });
  // elements.push({ 
  //   id: 'demo-query-link-from-node',
  //   data: { id: 'demo-query-link-from-node', label: 'From' }, 
  //   selectable: false,
  //   classes: 'query-link-from-node',
  // });
  // elements.push({ 
  //   id: 'demo-query-link-to-node',
  //   data: { id: 'demo-query-link-to-node', label: 'To' }, 
  //   selectable: false,
  //   classes: 'query-link-to-node',
  // });
  // elements.push({ 
  //   id: 'demo-query-link-type-node',
  //   data: { id: 'demo-query-link-type-node', label: 'Type' }, 
  //   selectable: false,
  //   classes: 'query-link-type-node',
  // });
  // elements.push({ 
  //   id: 'demo-query-link-in-node',
  //   data: { id: 'demo-query-link-in-node', label: 'In' }, 
  //   selectable: false,
  //   classes: 'query-link-in-node',
  // });
  // elements.push({ 
  //   id: 'demo-query-link-out-node',
  //   data: { id: 'demo-query-link-out-node', label: 'Out' }, 
  //   selectable: false,
  //   classes: 'query-link-out-node',
  // });
  // elements.push({ 
  //   id: 'demo-query-link-out-edge',
  //   data: { id: 'demo-query-link-out-edge', source: 'demo-query-link-out-node', target: 'demo-query-link-node' }, 
  //   selectable: false,
  //   classes: 'query-link-out-edge',
  // });
  // elements.push({ 
  //   id: 'demo-query-link-in-edge',
  //   data: { id: 'demo-query-link-in-edge', source: 'demo-query-link-in-node', target: 'demo-query-link-node' }, 
  //   selectable: false,
  //   classes: 'query-link-in-edge',
  // });
  // elements.push({ 
  //   id: 'demo-query-link-type-edge',
  //   data: { id: 'demo-query-link-type-edge', source: 'demo-query-link-node', target: 'demo-query-link-type-node' }, 
  //   selectable: false,
  //   classes: 'query-link-type-edge',
  // });
  // elements.push({ 
  //   id: 'demo-query-link-from-edge',
  //   data: { id: 'demo-query-link-from-edge', source: 'demo-query-link-node', target: 'demo-query-link-from-node' }, 
  //   selectable: false,
  //   classes: 'query-link-from-edge',
  // });
  // elements.push({ 
  //   id: 'demo-query-link-to-edge',
  //   data: { id: 'demo-query-link-to-edge', source: 'demo-query-link-node', target: 'demo-query-link-to-node' }, 
  //   selectable: false,
  //   classes: 'query-link-to-edge',
  // });

  const { setInsertingLink } = useInsertedLink(elements, reactElements, focus, refCy, baseTypes, ml);

  const stylesheets = useCytoStylesheets();

  const refDragStartedEvent = useRef<any>();

  useEffect(() => {
    if (!refDragStartedEvent.current) {
      relayoutDebounced();
    }
  }, [extra, layout, showTypes]);

  // has memory about locking of key=linkId
  // undefined - not locked
  // true - locked
  // false - unlocked
  const refHTMLNode = useRef<any>();
  
  const { linkReactElements, toggleLinkReactElement } = useLinkReactElements(elements, reactElements, refCy, ml);
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const {
    addTab,
    activeTab,
  } = useEditorTabs();

  const ehDirectionRef = useRef<any>();

  useEffect(() => {
    const locking = lockingRef.current;

    let ncy = refCy.current?._cy;

    let eh = ncy.edgehandles({
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
      snapThreshold: 50, // the target node must be less than or equal to this many pixels away from the cursor/finger
      snapFrequency: 15, // the number of times per second (Hz) that snap checks done (lower is less expensive)
      noEdgeEventsInDraw: true, // set events:no to edges during draws, prevents mouseouts on compounds
      disableBrowserGestures: true // during an edge drawing gesture, disable browser gestures such as two-finger trackpad swipe and pinch-to-zoom
    });
    ncy.on('layoutstart', () => {
      console.time('layout');
    })
    ncy.on('layoutstop', () => {
      console.timeEnd('layout');
    })
    ncy.on('ehstop', async (event, sourceNode, targetNode, addedEdge) => {
      let { position } = event;
      addedEdge?.remove();
    });
    ncy.on('ehcomplete', async (event, sourceNode, targetNode, addedEdge) => {
      let { position } = event;
      addedEdge?.remove();
      const sid = sourceNode?.data('link')?.id;
      const tid = targetNode?.data('link')?.id;
      if (sid && tid && ehDirectionRef.current) {
        let from, to;
        if (ehDirectionRef.current === 'out') {
          from = sid; to = tid;
        } else if (ehDirectionRef.current === 'in') {
          from = tid; to = sid;
        }
        setInsertingLink({ position: targetNode.position(), from, to });
      }
    });
    ncy.on('mouseover', '.link-from, .link-to, .link-type, .link-node', function(e) {
      var node = e.target;
      const id = node?.data('link')?.id;
      if (id) {
        ncy.$(`node, edge`).not(`#${id},#${id}-from,#${id}-to,#${id}-type`).removeClass('hover');
        ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).not(`.unhoverable`).addClass('hover');
      }
      if (node.locked) {
        node.unlock();
        node.mouseHoverDragging = true;
      }
    });
    ncy.on('mouseout', '.link-from, .link-to, .link-type, .link-node', function(e) {
      var node = e.target;
      const id = node?.data('link')?.id;
      if (id) {
        ncy.$(`node, edge`).removeClass('hover');
      }
      if (node.mouseHoverDragging) {
        node.lock();
        node.mouseHoverDragging = false;
      }
    });
    ncy.on('click', '.link-from, .link-to, .link-type, .link-node', function(e) {
      var node = e.target;
      const id = node?.data('link')?.id;
      if (id) {
        ncy.$(`node, edge`).not(`#${id},#${id}-from,#${id}-to,#${id}-type`).removeClass('clicked');
        ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).toggleClass('clicked');
      }
    });

    ncy.on('tapstart', 'node', function(evt){
      var node = evt.target;
      refDragStartedEvent.current = evt;
    });
    let dragendData: any = undefined;
    ncy.on('tapend', 'node', function(evt){
      var node = evt.target;
      if (refDragStartedEvent?.current?.position?.x !== evt.position?.x && refDragStartedEvent?.current?.position?.y !== evt.position?.y) {
        refDragStartedEvent.current = undefined;
        dragendData = { position: evt.position };
        evt.target.emit('dragend');
      }
    });
    ncy.on('dragend', 'node', function(evt){
      var node = evt.target;
      const id = node?.data('link')?.id;
      if (id) {
        focus(node, dragendData?.position);
        dragendData = undefined;
        ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).addClass('focused');
      }
    });
    
    ncy.cxtmenu({
      selector: '.link-node',
      outsideMenuCancel: 10,
      commands: [
        {
          content: 'client handler',
          select: function(ele){
            const id = ele.data('link')?.id;
            if (id) {
              toggleLinkReactElement(id);
            }
          }
        },
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
          content: 'Unlock',
          select: function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              unfocus(ele);
              ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).removeClass('focused');
            }
          }
        },
        {
          content: 'Delete',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              await deep.delete(+id);
            }
          }
        },
        {
          content: 'Insert',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              const link = ml.byId[id];
              const isNode = !link.from_id && !link.to_id;
              //   let insert = {};
              //   if (!link.from_id && !link.to_id) insert = { type_id: +id };
              
              //   setInserting(insert);
              const TypeName = link?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value || id;
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
                  if (insertingRef?.current?.type_id) setInserting({});
                },
              });
              setInserting({
                isNode,
                type_id: id,
                toast: t,
              });
            }
          }
        },
        {
          content: '+out',
          select: function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              ehDirectionRef.current = 'out';
              eh.start(ele);
            }
          }
        },
        {
          content: '+in',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              ehDirectionRef.current = 'in';
              eh.start(ele);
            }
          }
        },
        {
          content: 'login',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              deep.login({ linkId: +id });
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
      ]
    });
  
    ncy.cxtmenu({
      selector: 'core',
      outsideMenuCancel: 10,
      commands: [
        {
          content: '+query',
          select: async function(){
            const { data: [{ id: queryId }] } = await deep.insert({
              type_id: await deep.id('@deep-foundation/core', 'Query'),
              object: { data: { value: {} } },
            });
            if (container) await deep.insert([{
              from_id: container,
              to_id: queryId,
              type_id: await deep.id('@deep-foundation/core', 'Contain'),
            }]);
          }
        },
  
        {
          content: '+link',
          select: function(el, ev){
            setInsertingLink({ position: ev.position, from: 0, to: 0 });
          }
        }
      ]
    });
    
    ncy.on('tap', async function(event){
      if(event.target === ncy){
        if (insertingRef.current.type_id) {
          if (insertingRef.current.isNode) {
            await deep.insert({
              type_id: insertingRef.current.type_id,
              in: { data: [
                {
                  from_id: container,
                  type_id: baseTypes?.Contain,
                },
                {
                  from_id: container,
                  type_id: baseTypes?.Focus,
                  object: { data: { value: event.position } },
                  in: { data: {
                    type_id: baseTypes.Contain,
                    from_id: container
                  } },
                },
              ] },
            });
            toast.close(insertingRef.current.toast);
            setInserting({});
          } else {
            setInserting({});
          }
        }
        setInsertingLink(undefined);
      }
    });

    const updatedListener = (oldLink, newLink) => {
      // on update link or link value - unlock reposition lock
      if (
        newLink.type_id === baseTypes.Focus && newLink?.value?.value?.x &&
        
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
    ml.emitter.on('updated', updatedListener);
    // ncy.lassoSelectionEnabled(true);
    return () => {
      ml.emitter.removeListener('updated', updatedListener);
    };
  }, []);

  // useMinilinksHandle(ml, (event, oldLink, newLink) => {
  //   relayoutDebounced();
  // });

  const returning = (
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <CytoDropZone refCy={refCy}>
        <CytoscapeComponent
          ref={refCy}
          elements={elements} 
          layout={layout(elementsRef.current, refCy?.current?._cy)}
          stylesheet={stylesheets}
          panningEnabled={true}
          
          pan={ { x: 200, y: 200 } }
          style={ { width: '100%', height: '100vh' } } 
        />
        <CytoReactLayout
          cytoRef={refCy}
          elements={reactElements}
        />
        <CytoEditor ml={ml}/>
      </CytoDropZone>
    </div>
  );

  console.timeEnd('CytoGraph');

  return returning;
}
