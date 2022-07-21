import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import { useCallback, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
// import klay from 'cytoscape-klay';
// import dagre from 'cytoscape-dagre';
// import elk from 'cytoscape-elk';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { useDebounceCallback } from '@react-hook/debounce';
import cola from 'cytoscape-cola';
import COSEBilkent from 'cytoscape-cose-bilkent';
import cxtmenu from 'cytoscape-cxtmenu';
import edgehandles from 'cytoscape-edgehandles';
import { useCytoElements } from './cyto-graph-elements';
import { useInsertedLink, useLinkReactElements, useCytoEditor } from './cyto-graph-hooks';
import { CytoGraphProps } from './cyto-graph-props';
import { layoutCosePreset, layoutColaPreset } from './cyto-layouts-presets';
import { CytoReactLayout } from './cyto-react-layout';
import { useColorModeValue } from './framework';
import { useChackraColor, useChackraGlobal } from './get-color';
import { useBaseTypes, useContainer, useFocusMethods, useShowExtra, useSpaceId } from './hooks';
import { useRerenderer } from './rerenderer-hook';
import { CytoEditor } from './cyto-editor';

// cytoscape.use(dagre);
cytoscape.use(cola);
cytoscape.use(COSEBilkent);
// cytoscape.use(klay);
// cytoscape.use(elk);
// cytoscape.use(euler);
cytoscape.use(cxtmenu);
cytoscape.use(edgeConnections);
cytoscape.use(edgehandles);

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
          unfocus(id);
          relayoutDebounced();
          locking[id] = false;
        }
      }
    }
  };
}

export default function CytoGraph({
  links = [],
  ml,
}: CytoGraphProps){
  const deep = useDeep();
  const [baseTypes, setBaseTypes] = useBaseTypes();
  const [spaceId, setSpaceId] = useSpaceId();
  const [container, setContainer] = useContainer();
  const [extra, setExtra] = useShowExtra();

  useRerenderer(1000);

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
      });
    } catch(error) {}
  })()}, []);

  // links visualization
  let cy = refCy.current?._cy;

  const { elements, reactElements } = useCytoElements(ml, links, baseTypes, cy, spaceId);

  const relayout = useCallback(() => {
    let cy = refCy.current?._cy;
    const elements = cy.elements();
    elements.layout(layout).run();
  }, []);
  const relayoutDebounced = useDebounceCallback(relayout, 500);

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
  
  const globalStyle = useChackraGlobal();
  const textColor = useChackraColor(globalStyle.body.color);
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const colorClicked = useChackraColor('primary');
  const colorBgInsertNode = useColorModeValue(white, gray900);
  const colorFocus = useColorModeValue(gray900, white);

  const layout = layoutCosePreset;

  const refDragStartedEvent = useRef<any>();

  useEffect(() => {
    if (!refDragStartedEvent.current) {
      relayoutDebounced();
    }
  }, [links]);

  // has memory about locking of key=linkId
  // undefined - not locked
  // true - locked
  // false - unlocked
  const refHTMLNode = useRef<any>();
  
  const { linkReactElements, toggleLinkReactElement } = useLinkReactElements(elements, reactElements, refCy);
  const [cytoEditor, setCytoEditor] = useCytoEditor();

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
    ncy.on('ehcomplete', async (event, sourceNode, targetNode, addedEdge) => {
      let { position } = event;
      addedEdge.remove();
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
        console.log('mouseover ' + id, e, ml.byId[id]);
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
        console.log('mouseout ' + id, e, ml.byId[id]);
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
        console.log('click ' + id, e, ml.byId[id]);
        ncy.$(`node, edge`).not(`#${id},#${id}-from,#${id}-to,#${id}-type`).removeClass('clicked');
        ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).toggleClass('clicked');
      }
    });

    ncy.on('tapstart', 'node', function(evt){
      var node = evt.target;
      console.log( 'tapstart ' + node.id() , evt);
      refDragStartedEvent.current = evt;
    });
    let dragendData: any = undefined;
    ncy.on('tapend', 'node', function(evt){
      var node = evt.target;
      console.log('tapend ' + node.id(), evt);
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
        console.log('dragend ' + id, evt, dragendData);
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
    
    ncy.on('tap', function(event){
      if(event.target === ncy){
        setInsertingLink(undefined);
      }
    });

    // on update link or link value - unlock reposition lock
    const updatedListener = (oldLink, newLink) => {
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
          console.log('updated focus (unlock, pos, lock)', locking[newLink.to_id]);
        }
      }
    };
    ml.emitter.on('updated', updatedListener);
    return () => {
      ml.emitter.removeListener('updated', updatedListener);
    };
  }, []);

  return (<div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
    <CytoscapeComponent
        ref={refCy}
        elements={elements} 
        layout={layout}
        stylesheet={[
          {
            selector: 'node',
            style: {
              'background-opacity': 0,
            },
          },
          {
            selector: '.link-node',
            style: {
              color: textColor,
              width: 24,
              height: 24,
              'font-size': 16,
              'text-margin-y': -4,
              label: 'data(label)',
              "text-wrap": "wrap",
              // 'background-image': 'https://live.staticflickr.com/3063/2751740612_af11fb090b_b.jpg',
              'background-fit': 'cover',
              'background-opacity': 1,
            }
          },
          {
            selector: '.link-node.hover',
            style: {
              'z-compound-depth': 'top',
              'overlay-opacity': 0,
              // @ts-ignore
              'underlay-opacity': 0.8,
              'underlay-padding': 2,
              'underlay-color': '#0080ff',
              'underlay-shape': 'ellipse',
            }
          },
          {
            selector: '.link-to',
            style: {
              'target-arrow-shape': 'triangle',
            }
          },
          {
            selector: '.link-from',
            style: {
              'target-arrow-shape': 'tee',
            }
          },
          {
            selector: '.link-type',
            style: {
              'target-arrow-shape': 'triangle',
              'line-style': 'dashed',
              'line-dash-pattern': [5, 5]
            }
          },
          {
            selector: 'edge',
            style: {
              width: 1,
              'curve-style': 'bezier',
              'target-distance-from-node': 8,
              'source-distance-from-node': 1,
            }
          },
          {
            selector: '.eh-ghost-edge,edge.eh-preview',
            style: {
              'width': 2,
              'line-color': colorClicked,
              'target-arrow-color': colorClicked,
              'source-arrow-color': colorClicked,
            },
          },
          {
            selector: '.query-link-node',
            style: {
              color: textColor,
              'background-color': colorBgInsertNode,
              'border-color': textColor,
              'border-width': 1,
              'border-style': 'solid',
              width: 16,
              height: 16,
              'font-size': 16,
              'text-margin-y': -4,
            }
          },
          {
            selector: '.query-link-from-node',
            style: {
              color: textColor,
              'background-color': colorBgInsertNode,
              'border-color': textColor,
              'border-width': 1,
              'border-style': 'solid',
              width: 8,
              height: 8,
              'font-size': 16,
              'text-margin-y': -4,
            }
          },
          {
            selector: '.query-link-to-node',
            style: {
              color: textColor,
              'background-color': colorBgInsertNode,
              'border-color': textColor,
              'border-width': 1,
              'border-style': 'solid',
              width: 8,
              height: 8,
              'font-size': 16,
              'text-margin-y': -4,
            }
          },
          {
            selector: '.query-link-type-node',
            style: {
              color: textColor,
              'background-color': colorBgInsertNode,
              'border-color': textColor,
              'border-width': 1,
              'border-style': 'solid',
              width: 8,
              height: 8,
              'font-size': 16,
              'text-margin-y': -4,
            }
          },
          {
            selector: '.query-link-in-node',
            style: {
              color: textColor,
              'background-color': colorBgInsertNode,
              'border-color': textColor,
              'border-width': 1,
              'border-style': 'solid',
              width: 8,
              height: 8,
              'font-size': 16,
              'text-margin-y': -4,
            }
          },
          {
            selector: '.query-link-out-node',
            style: {
              color: textColor,
              'background-color': colorBgInsertNode,
              'border-color': textColor,
              'border-width': 1,
              'border-style': 'solid',
              width: 8,
              height: 8,
              'font-size': 16,
              'text-margin-y': -4,
            }
          },
          {
            selector: '.query-link-out-edge',
            style: {
              'target-arrow-shape': 'tee',
            }
          },
          {
            selector: '.query-link-from-edge',
            style: {
              'target-arrow-shape': 'tee',
            }
          },
          {
            selector: '.query-link-in-edge',
            style: {
              'target-arrow-shape': 'triangle',
            }
          },
          {
            selector: '.query-link-to-edge',
            style: {
              'target-arrow-shape': 'triangle',
            }
          },
          {
            selector: '.query-link-type-edge',
            style: {
              'target-arrow-shape': 'triangle',
              'line-style': 'dashed',
              'line-dash-pattern': [5, 5],
            }
          },
          {
            selector: '.link-from.focused, .link-to.focused, .link-type.focused',
            style: {
              'width': 2,
              'line-color': colorFocus,
            }
          },
          {
            selector: '.link-from.clicked, .link-to.clicked, .link-type.clicked',
            style: {
              'line-color': colorClicked,
              'target-arrow-color': colorClicked,
              width: 2,
            }
          },
          {
            selector: '.link-node.focused',
            style: {
              'border-width': 2,
              'border-color': colorFocus,
            }
          },
          {
            selector: '.link-node.clicked',
            style: {
              color: colorClicked,
              'background-color': colorClicked, 
            }
          },
        ]}
        panningEnabled={true}
        
        pan={ { x: 200, y: 200 } }
        style={ { width: '100%', height: '100vh' } } 
      />
      <CytoReactLayout
        cytoRef={refCy}
        elements={reactElements}
      />
      <CytoEditor/>
    </div>
  )
}
