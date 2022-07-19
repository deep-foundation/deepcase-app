import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import { useCallback, useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
// import klay from 'cytoscape-klay';
// import dagre from 'cytoscape-dagre';
// import elk from 'cytoscape-elk';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import COSEBilkent from 'cytoscape-cose-bilkent';
import cxtmenu from 'cytoscape-cxtmenu';
import { CytoGraphProps } from './cyto-graph-props';
import { CytoReactLayout } from './cyto-react-layout';
import { useColorModeValue } from './framework';
import { useChackraColor, useChackraGlobal } from './get-color';
import { useBaseTypes, useFocusMethods, useSpaceId } from './gui';

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

  console.log(baseTypes, ml);

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

  elements.push({ 
    id: 'demo-query-link-node',
    data: { id: 'demo-query-link-node', label: 'Node big' }, 
    selectable: false,
    classes: 'query-link-node',
  });
  elements.push({ 
    id: 'demo-query-link-from-node',
    data: { id: 'demo-query-link-from-node', label: 'From' }, 
    selectable: false,
    classes: 'query-link-from-node',
  });
  elements.push({ 
    id: 'demo-query-link-to-node',
    data: { id: 'demo-query-link-to-node', label: 'To' }, 
    selectable: false,
    classes: 'query-link-to-node',
  });
  elements.push({ 
    id: 'demo-query-link-type-node',
    data: { id: 'demo-query-link-type-node', label: 'Type' }, 
    selectable: false,
    classes: 'query-link-type-node',
  });
  elements.push({ 
    id: 'demo-query-link-in-node',
    data: { id: 'demo-query-link-in-node', label: 'In' }, 
    selectable: false,
    classes: 'query-link-in-node',
  });
  elements.push({ 
    id: 'demo-query-link-out-node',
    data: { id: 'demo-query-link-out-node', label: 'Out' }, 
    selectable: false,
    classes: 'query-link-out-node',
  });
  elements.push({ 
    id: 'demo-query-link-out-edge',
    data: { id: 'demo-query-link-out-edge', source: 'demo-query-link-out-node', target: 'demo-query-link-node' }, 
    selectable: false,
    classes: 'query-link-out-edge',
  });
  elements.push({ 
    id: 'demo-query-link-in-edge',
    data: { id: 'demo-query-link-in-edge', source: 'demo-query-link-in-node', target: 'demo-query-link-node' }, 
    selectable: false,
    classes: 'query-link-in-edge',
  });
  elements.push({ 
    id: 'demo-query-link-type-edge',
    data: { id: 'demo-query-link-type-edge', source: 'demo-query-link-node', target: 'demo-query-link-type-node' }, 
    selectable: false,
    classes: 'query-link-type-edge',
  });
  elements.push({ 
    id: 'demo-query-link-from-edge',
    data: { id: 'demo-query-link-from-edge', source: 'demo-query-link-node', target: 'demo-query-link-from-node' }, 
    selectable: false,
    classes: 'query-link-from-edge',
  });
  elements.push({ 
    id: 'demo-query-link-to-edge',
    data: { id: 'demo-query-link-to-edge', source: 'demo-query-link-node', target: 'demo-query-link-to-node' }, 
    selectable: false,
    classes: 'query-link-to-edge',
  });
  
  const globalStyle = useChackraGlobal();
  const textColor = useChackraColor(globalStyle.body.color);
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const colorClicked = useChackraColor('primary');
  const colorBgInsertNode = useColorModeValue(white, gray900);
  const colorFocus = useColorModeValue(gray900, white);

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
  const refHTMLNode = useRef<any>();

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
      if (node.locked) {
        node.unlock();
        node._locked = true;
      }
    });
    ncy.on('mouseout', '.link-from, .link-to, .link-type, .link-node', function(e) {
      var node = e.target;
      const id = node?.data('link')?.id;
      if (id) {
        console.log('hover ' + id, e);
        ncy.$(`node, edge`).removeClass('hover');
      }
      if (node._locked) {
        node.lock();
        node._locked = false;
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

  return (<div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
    <CytoscapeComponent
        ref={ref}
        elements={elements} 
        layout={layout}
        stylesheet={[
          {
            selector: 'node',
            style: {
              color: textColor,
              width: 24,
              height: 24,
              'font-size': 16,
              'text-margin-y': -4,
              label: 'data(label)',
              'background-image': 'https://live.staticflickr.com/3063/2751740612_af11fb090b_b.jpg',
              'background-fit': 'cover',
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
              label: 'data(label)',
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
        cytoRef={ref}
        elementIds={elements.filter(e => !e?.data?.source && !e?.data?.target).map(e => e.id)}
      />
    </div>
  )
}
