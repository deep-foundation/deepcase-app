import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import cola from 'cytoscape-cola';
// import klay from 'cytoscape-klay';
// import dagre from 'cytoscape-dagre';
// import elk from 'cytoscape-elk';
import COSEBilkent from 'cytoscape-cose-bilkent';
import euler from 'cytoscape-euler';
import cxtmenu from 'cytoscape-cxtmenu';
import { CytoGraphProps } from './cyto-graph-props';
import { useTheme, useColorMode, useColorModeValue } from './framework';
import { useChackraColor, useChackraGlobal } from './get-color';
import { useBaseTypes, useFocusMethods, useSpaceId } from './gui';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';


// cytoscape.use(dagre);
// cytoscape.use(cola);
cytoscape.use(COSEBilkent);
// cytoscape.use(klay);
// cytoscape.use(elk);
// cytoscape.use(euler);
cytoscape.use(cxtmenu);
cytoscape.use(edgeConnections);

export default function CytoGraph({
  links = [],
  ml,
}: CytoGraphProps){
  const elements = [];
  const deep = useDeep();
  const [baseTypes, setBaseTypes] = useBaseTypes();
  const [spaceId, setSpaceId] = useSpaceId();
  const { focus, unfocus } = useFocusMethods();

  const ref = useRef<any>();

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
        User: await deep.id('@deep-foundation/core', 'User'),
      });
    } catch(error) {}
  })()}, []);

  // links visualization
  let cy = ref.current?._cy;
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const focus = link?.inByType?.[baseTypes.Focus]?.find(f => f.from_id === spaceId);

    if (!!cy) {
      if (link.from_id && ml?.byId?.[link.from_id] && !!cy.$(`#${link.from_id}`).length) elements.push({
        data: { id: `${link.id}-from`, source: `${link.id}`, target: `${link.from_id}`, link },
        selectable: false,
        classes: [
          'link-from',
          ...(focus ? ['focused'] : ['unfocused'])
        ].join(' '),
      });
      if (link.to_id && ml?.byId?.[link.to_id] && !!cy.$(`#${link.to_id}`).length) elements.push({
        data: { id: `${link.id}-to`, source: `${link.id}`, target: `${link.to_id}`, link },
        selectable: false,
        classes: [
          'link-to',
          ...(focus ? ['focused'] : ['unfocused'])
        ].join(' '),
      });
      if (link.type_id && ml?.byId?.[link.type_id] && !!cy.$(`#${link.type_id}`).length) elements.push({
        data: { id: `${link.id}-type`, source: `${link.id}`, target: `${link.type_id}`, link },
        selectable: false,
        classes: [
          'link-type',
          ...(focus ? ['focused'] : ['unfocused'])
        ].join(' '),
      });
    }

    elements.push({
      id: link.id,
      data: { id: `${link.id}`, label: link.id, link },
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
  
  const globalStyle = useChackraGlobal();
  const textColor = useChackraColor(globalStyle.body.color);
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const colorClicked = useChackraColor('primary');
  const colorFocus = useColorModeValue(gray900, white);
  console.log({colorFocus, textColor});
  console.log(gray900, white);

  const layout = { 
    fit: false,
    name: 'cose-bilkent', 
    animate: true,
    // convergenceThreshold: 1000,
    // animateFilter: (node) => {
    //   return !node.focused;
    // },
    // edgeWeight: (edge) => {
    //   return !edge.is('.link-type');
    // },
    // rankDir: 'TB',
  };

  const refDragStartedEvent = useRef<any>();

  const relayout = useCallback(() => {
    let cy = ref.current?._cy;
    cy.elements().layout(layout).run();
  }, []);

  useEffect(() => {
    if (!refDragStartedEvent.current) {
      relayout();
    }
  }, [links]);

  // has memory about locking of key=linkId
  // undefined - not locked
  // true - locked
  // false - unlocked
  const lockingRef = useRef<any>({});

  useEffect(() => {
    const locking = lockingRef.current;

    let ncy = ref.current?._cy;
   
    ncy.on('mouseover', '.link-from, .link-to, .link-type, .link-node', function(e) {
      var node = e.target;
      const id = node?.data('link')?.id;
      if (id) {
        console.log('hover ' + id, e);
        ncy.$(`node, edge`).not(`#${id},#${id}-from,#${id}-to,#${id}-type`).removeClass('hover');
        ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).addClass('hover');
      }
    });
    ncy.on('mouseout', '.link-from, .link-to, .link-type, .link-node', function(e) {
      var node = e.target;
      const id = node?.data('link')?.id;
      if (id) {
        console.log('hover ' + id, e);
        ncy.$(`node, edge`).removeClass('hover');
      }
    });
    ncy.on('click', '.link-from, .link-to, .link-type, .link-node', function(e) {
      var node = e.target;
      const id = node?.data('link')?.id;
      if (id) {
        console.log('click ' + id, e);
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
        locking[id] = true;
        node.position(dragendData.position);
        node.lock();
        focus(id, dragendData.position);
        dragendData = undefined;
        relayout();
        ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).addClass('focused');
      }
    });
    
    ncy.cxtmenu({
      selector: 'node, edge',
      outsideMenuCancel: 10,
      commands: [ 
        {
          content: '<span class="fa fa-star fa-2x"></span>',
          select: function(ele){
            console.log( ele.data('name') );
          },
          enabled: false
        },
        
        {
          content: 'Unlock',
          select: function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              ele.unlock();
              unfocus(id);
              relayout();
              locking[id] = false;
              ncy.$(`#${id},#${id}-from,#${id}-to,#${id}-type`).removeClass('focused');
            }
          }
        },

        {
          content: 'Text',
          select: function(ele){
            console.log( ele.position() );
          }
        }
      ]
    });
  
    ncy.cxtmenu({
      selector: 'core',
      outsideMenuCancel: 10,
      commands: [
        {
          content: 'bg1',
          select: function(){
            console.log( 'bg1' );
          }
        },
  
        {
          content: 'bg2',
          select: function(){
            console.log( 'bg2' );
          }
        }
      ]
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
        node.unlock();
        node.position(newLink?.value?.value);
        relayout();
        node.lock();
        console.log('updated focus (unlock, pos, lock)', locking[newLink.to_id]);
      }
    };
    ml.emitter.on('updated', updatedListener);
    return () => {
      ml.emitter.removeListener('updated', updatedListener);
    };
  }, []);

  return (<CytoscapeComponent
      ref={ref}
      elements={elements} 
      layout={layout}
      stylesheet={[
        {
          selector: 'node',
          style: {
            color: textColor,
            width: 16,
            height: 16,
            'font-size': 16,
            'text-margin-y': -4,
            label: 'data(label)',
          }
        },
        {
          selector: 'node.hover',
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
          selector: '.link-from.focused, .link-to.focused, .link-type.focused',
          style: {
            'width': 3,
            'line-color': colorFocus,
          }
        },
        {
          selector: '.link-from.clicked, .link-to.clicked, .link-type.clicked',
          style: {
            // 'width': 3,
            'line-color': colorClicked,
            'target-arrow-color': colorClicked,
          }
        },
        {
          selector: '.link-node.focused',
          style: {
            'border-width': 3,
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
  )
}
