import React, { useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import cola from 'cytoscape-cola';
import COSEBilkent from 'cytoscape-cose-bilkent';
import cxtmenu from 'cytoscape-cxtmenu';
import { CytoGraphProps } from './cyto-graph-props';
import { useTheme, useColorMode } from './framework';
import { useChackraColor, useChackraGlobal } from './get-color';


cytoscape.use( cxtmenu );
cytoscape.use(edgeConnections);
cytoscape.use( cola );
cytoscape.use( COSEBilkent );

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
  
  const globalStyle = useChackraGlobal();
  const textColor = useChackraColor(globalStyle.body.color);

  const ref = useRef<any>();

  useEffect(() => {
    let cy = ref.current?._cy;
    cy.elements().layout({
      fit: false,
      name: 'cola',
      // animate: false,
    }).run();
  }, [links]);

  useEffect(() => {
    let ncy = ref.current?._cy;
    ncy.cxtmenu({
      selector: 'node, edge',
      outsideMenuCancel: 10,
      commands: [
        {
          content: '<span class="fa fa-flash fa-2x"></span>',
          select: function(ele){
            console.log( ele.id() );
          }
        },
  
        {
          content: '<span class="fa fa-star fa-2x"></span>',
          select: function(ele){
            console.log( ele.data('name') );
          },
          enabled: false
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

    ncy.on('mouseover', 'node', function(e) {
      e.target.addClass('hover');
    });
    ncy.on('mouseout', 'node', function(e) {
      e.target.removeClass('hover');
    });

  }, []);


  const layout = { 
    name: 'cola', 
    animate: false,
    convergenceThreshold: 1000,
  };

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
          selector: '.foo',
          style: {
            'background-color': 'green',
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
            'underlay-color': '#008fcc',
            'underlay-shape': 'ellipse',
            
            // "border-width": 1,
            // "border-color": '#de12af',
            // "border-style": 'dashed',
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
            'line-color': '#adadad',
            'target-arrow-color': '#adadad',
            'source-arrow-color': '#adadad',
            'target-distance-from-node': 8,
            'source-distance-from-node': 1,
          }
        }
      ]}
      panningEnabled={true}
      
      pan={ { x: 200, y: 200 } }
      style={ { width: '1000px', height: '1000px' } } 
    />
  )
}
