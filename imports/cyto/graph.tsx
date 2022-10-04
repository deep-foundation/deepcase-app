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
// import d3Force from 'cytoscape-d3-force';
// import fcose from 'cytoscape-fcose';
// import euler from 'cytoscape-euler';
// import elk from 'cytoscape-elk';
import cxtmenu from 'cytoscape-cxtmenu';
import edgehandles from 'cytoscape-edgehandles';
// import cytoscapeLasso from 'cytoscape-lasso';
import { Text, useToast } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import pckg from '../../package.json';
import { useContainer, useCytoViewport, useFocusMethods, useInsertingCytoStore, useLayout, useRefAutofill, useShowExtra, useShowTypes, useSpaceId } from '../hooks';
import { Refstater } from '../refstater';
import { CytoDropZone } from './drop-zone';
import { CytoEditor } from './editor';
import { useCytoElements } from './elements';
import { useCyInitializer } from './hooks';
import { CytoReactLayout } from './react';
import { useCytoStylesheets } from './stylesheets';
import { CytoGraphProps } from './types';

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
// cytoscape.use(d3Force);
// cytoscape.use(fcose);
cytoscape.use(cxtmenu);
cytoscape.use(edgeConnections);
cytoscape.use(edgehandles);

export function useCytoFocusMethods(cy, relayoutDebounced) {
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
  cytoViewportRef,
}: CytoGraphProps){
  console.time('CytoGraph');
  const deep = useDeep();
  const [spaceId, setSpaceId] = useSpaceId();
  const [container, setContainer] = useContainer();
  const [extra, setExtra] = useShowExtra();
  const [showTypes, setShowTypes] = useShowTypes();
  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore();
  const insertingCytoRef = useRefAutofill(insertingCyto);
  const toast = useToast();

  const [cy, setCy] = useState<any>();
  const ehRef = useRef<any>();

  const { elements, reactElements } = useCytoElements(deep.minilinks, links, cy, spaceId);
  const elementsRef = useRefAutofill(elements);

  const { onLoaded, relayoutDebounced } = useCyInitializer({
    elementsRef, elements, reactElements, cy, setCy, ehRef, cytoViewportRef
  });

  const { layout, setLayout } = useLayout();

  const stylesheets = useCytoStylesheets();

  const returning = (<>
    <Refstater useHook={useCytoViewport as any} stateRef={cytoViewportRef}/>
    <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
      <CytoDropZone cy={cy}>
        <CytoscapeComponent
          cy={(_cy) => {
            if (!cy) onLoaded(_cy);
          }}
          elements={elements} 
          layout={layout(elementsRef.current, cy)}
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

  console.timeEnd('CytoGraph');

  return returning;
}
