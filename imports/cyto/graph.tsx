import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
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
import { useInsertLinkCard, useLinkReactElements, useCytoEditor } from './hooks';
import { CytoGraphProps } from './types';
import { CytoReactLayout } from './react';
import { useColorModeValue, useToast, Spinner, Text } from '@chakra-ui/react';
import { useChackraColor, useChackraGlobal } from '../get-color';
import { useContainer, useCytoViewport, useFocusMethods, useInsertingCytoStore, useLayout, useRefAutofill, useShowExtra, useShowTypes, useSpaceId } from '../hooks';
import { useRerenderer } from '../rerenderer-hook';
import { CytoEditor, useEditorTabs } from './editor';
import { useMinilinksHandle } from '@deep-foundation/deeplinks/imports/minilinks';
import { CytoDropZone } from './drop-zone';
import { useCytoStylesheets } from './stylesheets';
import { Refstater, useRefstarter } from '../refstater';
import pckg from '../../package.json';

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
  const [spaceId, setSpaceId] = useSpaceId();
  const [container, setContainer] = useContainer();
  const [extra, setExtra] = useShowExtra();
  const [showTypes, setShowTypes] = useShowTypes();
  const cytoViewportRef = useRefstarter<{ pan: { x: number; y: number; }; zoom: number }>();
  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore();
  const insertingCytoRef = useRefAutofill(insertingCyto);
  const toast = useToast()

  const refCy = useRef<any>();

  // links visualization
  let cy = refCy.current?._cy;

  const { elements, reactElements } = useCytoElements(ml, links, cy, spaceId);
  const elementsRef = useRefAutofill(elements);

  const { layout, setLayout } = useLayout();

  const relayout = useCallback(() => {
    let cy = refCy.current?._cy;
    if (cy.elements) {
      const elements = cy.elements();
      elements.layout(layout(elementsRef.current, cy)).run();
    }
  }, [layout]);
  const relayoutDebounced = useDebounceCallback(relayout, 500);
  global.relayoutDebounced = relayoutDebounced;

  const { focus, unfocus, lockingRef } = useCytoFocusMethods(cy, relayoutDebounced);

  const ehRef = useRef<any>();

  const { startInsertingOfType, openInsertCard, insertLink, drawendInserting } = useInsertLinkCard(elements, reactElements, focus, refCy, ml, ehRef);

  const stylesheets = useCytoStylesheets();

  const refDragStartedEvent = useRef<any>();

  useEffect(() => {
    if (!refDragStartedEvent.current) {
      relayoutDebounced();
    }
  }, [extra, layout, showTypes]);
  useMinilinksHandle(ml, (event, oldLink, newLink) => {
    relayoutDebounced();
  });

  const { linkReactElements, toggleLinkReactElement } = useLinkReactElements(elements, reactElements, refCy, ml);
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const {
    addTab,
    activeTab,
  } = useEditorTabs();

  useEffect(() => {
    const locking = lockingRef.current;

    let ncy = refCy.current?._cy;

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
        ncy.$(`node, edge`).not(`#${id},#${id}-from,#${id}-to,#${id}-type`).removeClass('clicked');
        ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).toggleClass('clicked');
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
    const dragend = function(evt){
      var node = evt.target;
      const id = node?.data('link')?.id;
      if (id) {
        focus(node, dragendData?.position);
        dragendData = undefined;
        ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).addClass('focused');
      }
    };

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
          content: 'insert',
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              startInsertingOfType(id);
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
  
    ncy.cxtmenu({
      selector: 'core',
      outsideMenuCancel: 10,
      commands: [
        {
          content: 'insert',
          select: function(el, ev){
            openInsertCard({ position: ev.position, from: 0, to: 0 });
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
    };
  }, []);

  const returning = (<>
    <Refstater useHook={useCytoViewport as any} stateRef={cytoViewportRef}/>
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <CytoDropZone refCy={refCy}>
        <CytoscapeComponent
          ref={refCy}
          elements={elements} 
          layout={layout(elementsRef.current, refCy?.current?._cy)}
          stylesheet={stylesheets}
          panningEnabled={true}
          
          pan={cytoViewportRef?.current?.value?.pan}
          zoom={cytoViewportRef?.current?.value?.zoom}
          style={ { width: '100%', height: '100vh' } } 
        />
        <CytoReactLayout
          cytoRef={refCy}
          elements={reactElements}
        />
        <CytoEditor ml={ml}/>
      </CytoDropZone>
      <Text position="fixed" left={0} bottom={0} p={4}>
        {pckg.version}
      </Text>
    </div>
  </>);

  console.timeEnd('CytoGraph');

  return returning;
}
