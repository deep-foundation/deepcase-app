import React, { useEffect, useMemo, useRef, useState } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import cola from 'cytoscape-cola';
import COSEBilkent from 'cytoscape-cose-bilkent';
import cxtmenu from 'cytoscape-cxtmenu';
import { CytoGraphProps } from './cyto-graph-props';

cytoscape.use(cxtmenu);
cytoscape.use(edgeConnections);
cytoscape.use(cola);
cytoscape.use(COSEBilkent);

export default function CytoGraphOld({
  ml,
}: CytoGraphProps){
  const refCyto = useRef();
  useEffect(() => {
    var cy = cytoscape({
      container: refCyto.current,
      style: [
        {
          selector: 'node',
          style: {
            color: '#fff',
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
            // 'target-arrow-shape': 'triangle',
            // 'source-arrow-shape': 'tee',
            'line-color': '#adadad',
            'target-arrow-color': '#adadad',
            'source-arrow-color': '#adadad',
            'target-distance-from-node': 8,
            'source-distance-from-node': 1,
          }
        }
      ],
    });
    const addedListener = (nl) => {
      // создание безопасных данных
      // if (nl.from_id && ml?.byId?.[nl.from_id]) cy.add({
      //   data: { id: `${nl.id}-from`, source: `${nl.id}`, target: `${nl.from_id}` }, classes: 'link-from',
      // });
      // if (nl.to_id && ml?.byId?.[nl.to_id]) cy.add({
      //   data: { id: `${nl.id}-to`, source: `${nl.id}`, target: `${nl.to_id}` }, classes: 'link-to',
      // });
      // if (nl.type_id && ml?.byId?.[nl.type_id]) cy.add({
      //   data: { id: `${nl.id}-type`, source: `${nl.id}`, target: `${nl.type_id}` }, classes: 'link-type',
      // });
      cy.add({
        data: { id: `${nl.id}`, label: nl.id }, classes: 'link-node',
      });
      // восстановление недосозданных ранее
      if (ml?.byTo?.[nl.id].length && !cy.getElementById(`${nl.from_id}`)) cy.add({
        data: { id: `${nl.id}-from`, source: `${nl.id}`, target: `${nl.from_id}` }, classes: 'link-from',
      });
      // if (nl.to_id && ml?.byId?.[nl.to_id]) cy.add({
      //   data: { id: `${nl.id}-to`, source: `${nl.id}`, target: `${nl.to_id}` }, classes: 'link-to',
      // });
      // if (nl.type_id && ml?.byId?.[nl.type_id]) cy.add({
      //   data: { id: `${nl.id}-type`, source: `${nl.id}`, target: `${nl.type_id}` }, classes: 'link-type',
      // });
    };
    const updatedListener = (ol, nl) => {
    };
    const removedListener = (ol) => {
    };
    ml.emitter.on('added', addedListener);
    ml.emitter.on('updated', updatedListener);
    ml.emitter.on('removed', removedListener);
    const releayoutInterval = setInterval(() => {
      cy.elements().layout({
        fit: false,
        name: 'cola',
      }).run();
    }, 1000);
    return () => {
      ml.emitter.removeListener('added', addedListener);
      ml.emitter.removeListener('updated', updatedListener);
      ml.emitter.removeListener('removed', removedListener);
      clearInterval(releayoutInterval);
    };
  }, []);
  return <div ref={refCyto} style={{ width: 800, height: 800 }}></div>;
}
