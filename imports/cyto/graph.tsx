import cytoscape from 'cytoscape';
import edgeConnections from 'cytoscape-edge-connections';
import { useRef, useState } from 'react';
// import CytoscapeComponent from 'react-cytoscapejs';
// import klay from 'cytoscape-klay';
import dagre from 'cytoscape-dagre';
// import elk from 'cytoscape-elk';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import cola from 'cytoscape-cola';
// import COSEBilkent from 'cytoscape-cose-bilkent';
import d3Force from 'cytoscape-d3-force';
import deepd3Force from 'cytoscape-deep-d3-force';
// import fcose from 'cytoscape-fcose';
// import euler from 'cytoscape-euler';
// import elk from 'cytoscape-elk';
// import cxtmenu from 'cytoscape-cxtmenu';
import cxtmenu from './cxtmenu';
// import cxtmenu from '@lsvih/cytoscape-cxtmenu/src/index';
import edgehandles from 'cytoscape-edgehandles';
// import cytoscapeLasso from 'cytoscape-lasso';
import { Text, useToast } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import pckg from '../../package.json';
import { useContainer, useCytoViewport, useFocusMethods, useInsertingCytoStore, useLayout, useRefAutofill, useShowExtra, useShowTypes, useSpaceId, useLayoutAnimation } from '../hooks';
import { Refstater } from '../refstater';
import { CytoDropZone } from './drop-zone';
import { CytoEditor } from './editor';
import { useCytoElements } from './elements';
import { CytoReactLayout } from './react';
import { useCytoStylesheets } from './stylesheets';
import { CytoGraphProps } from './types';

import { useCyInitializer } from './hooks';

const CytoscapeComponent = dynamic<any>(
  () => import('react-cytoscapejs').then((m) => m.default),
  { ssr: false }
);

cytoscape.use(dagre);
cytoscape.use(cola);
// cytoscape.use(COSEBilkent);
// cytoscape.use(klay);
// cytoscape.use(elk);
// cytoscape.use(euler);
cytoscape.use(d3Force);
cytoscape.use(deepd3Force);
// cytoscape.use(fcose);
cytoscape.use(cxtmenu);
cytoscape.use(edgeConnections);
cytoscape.use(edgehandles);

export function useCytoFocusMethods(cy) {
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
          el.lock();
          const focused = await focus(id, position);
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
          el.unlock();
          locking[id] = false;
          const focused = await unfocus(id);
          return focused;
        }
      }
    }
  };
}

export default function CytoGraph({
  links = [],
  cytoViewportRef,
  cyRef,
  gqlPath,
  gqlSsl,
}: CytoGraphProps){
  // console.time('CytoGraph');
  const deep = useDeep();
  const [spaceId, setSpaceId] = useSpaceId();
  const [container, setContainer] = useContainer();
  const [extra, setExtra] = useShowExtra();
  const [showTypes, setShowTypes] = useShowTypes();
  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore();
  const insertingCytoRef = useRefAutofill(insertingCyto);
  const toast = useToast();

  const [cy, setCy] = useState<any>();
  cyRef.current = cy;
  const ehRef = useRef<any>();

  const { elements, reactElements } = useCytoElements(deep.minilinks, links, cy, spaceId);
  const elementsRef = useRefAutofill(elements);

  const { onLoaded } = useCyInitializer({
    elementsRef, elements, reactElements, cyRef, setCy, ehRef, cytoViewportRef
  });

  const { layout, setLayout } = useLayout();
  const [ layoutAnimation ] = useLayoutAnimation();
  const stylesheets = useCytoStylesheets();

  const returning = (<>
    <Refstater useHook={useCytoViewport as any} stateRef={cytoViewportRef}/>
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <CytoDropZone
        cy={cy}
        gqlPath={gqlPath}
        gqlSsl={gqlSsl}>
        <CytoscapeComponent
          cy={(_cy) => {
            if (!cy) onLoaded(_cy);
          }}
          elements={elements}
          layout={layout({elementsRef: elementsRef.current, cy, isAnimate: layoutAnimation, deep})}
          stylesheet={stylesheets}
          panningEnabled={true}
          pan={cytoViewportRef?.current?.value?.pan}
          zoom={cytoViewportRef?.current?.value?.zoom}
          style={ { width: '100%', height: '100vh' } }
        />
        {!!cy && <CytoReactLayout
          cy={cy}
          elements={reactElements}
        />}
        <CytoEditor/>
      </CytoDropZone>
      <Text position="fixed" left={0} bottom={0} p={4}>
        {pckg.version}
      </Text>
    </div>
  </>);

  // console.timeEnd('CytoGraph');

  return returning;
}
