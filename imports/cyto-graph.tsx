import React, { useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import { CytoGraphProps } from './cyto-graph-props';

cytoscape.use(edgeConnections);

export default function CytoGraph({
  links = [],
  ml,
}: CytoGraphProps){
  const elements = [];
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    if (link.from_id && ml?.byId?.[link.from_id]) elements.push({
      data: { id: `${link.id}-from`, source: `${link.id}`, target: `${link.from_id}` }, classes: 'link-from',
    });
    if (link.to_id && ml?.byId?.[link.to_id]) elements.push({
      data: { id: `${link.id}-to`, source: `${link.id}`, target: `${link.to_id}` }, classes: 'link-to',
    });
    if (link.type_id && ml?.byId?.[link.type_id]) elements.push({
      data: { id: `${link.id}-type`, source: `${link.id}`, target: `${link.type_id}` }, classes: 'link-type',
    });
    elements.push({
      data: { id: `${link.id}`, label: link.id }, classes: 'link-node',
    });
  }
  console.log('links', links);
  console.log('elements', elements);
  // let elements = [
  //   { 
  //     data: { id: 'one', label: 'Node 1' }, 
  //     position: { x: 50, y: 100 },
  //     style: { 
  //       'background-color': 'red',
  //       'bounds-expansion': '120px',
  //     },
  //   },
  //   { data: { id: 'two', label: 'Node 2' }, position: { x: 300, y: 100 }, classes: 'foo' },
  //   { data: { id: 'three', label: 'Node 3' }, position: { x: 50, y: 250 } },
  //   { data: { id: 'type', label: 'Type' }, position: { x: 10, y: 50 } },
  //   { 
  //     data: { id: 'a', source: 'one', target: 'two', label: 'Edge from Node1 to Node2' },
  //     classes: 'from'
  //   },
  //   { 
  //     data: { id: 'b', source: 'one', target: 'three', label: 'Edge from Node1 to Node3' }, 
  //     classes: 'to'
  //   },
  //   { 
  //     data: { id: 'c', source: 'one', target: 'type', label: 'Edge from Node1 to Node3' }, 
  //     classes: 'to type'
  //   },
    
    
  // ];

  const ref = useRef<any>();
  useEffect(() => {
    let ncy = ref.current?._cy;
  }, [])
 
  return (<CytoscapeComponent
      ref={ref}
      elements={elements} 
      stylesheet={[
        {
          selector: 'node',
          style: {
            width: 16,
            height: 16,
            'font-size': 16,
            'text-margin-y': -4,
            // 'text-outline-color': '#ff225b',
            // 'text-outline-width': 5,
            label: 'data(label)',
          }
        },
        {
          selector: '.foo',
          style: {
            'background-color': 'green',
          }
        },
        {
          selector: '.to',
          style: {
            'target-arrow-shape': 'triangle',
          }
        },
        {
          selector: '.from',
          style: {
            'target-arrow-shape': 'tee',
          }
        },
        {
          selector: '.type',
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
            // 'target-arrow-shape': 'triangle',
            // 'source-arrow-shape': 'tee',
            'line-color': '#adadad',
            'target-arrow-color': '#adadad',
            'source-arrow-color': '#adadad',
            'target-distance-from-node': 8,
            'source-distance-from-node': 1,
          }
        }
      ]}
      style={ { width: '600px', height: '600px' } } 
    />
  )
}
