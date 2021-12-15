import { useSubscription } from '@apollo/client';
import { Capacitor } from '@capacitor/core';
import { minilinks } from '@deep-foundation/deeplinks/imports/minilinks';
import { useTokenController } from '@deep-foundation/deeplinks/imports/react-token';
import { useApolloClient } from '@deep-foundation/react-hasura/use-apollo-client';
import { useLocalStore } from '@deep-foundation/store/local';
import { useQueryStore } from '@deep-foundation/store/query';
import { Add, Clear, Colorize, LaptopChromebook, Visibility as VisibilityOn , VisibilityOff } from '@material-ui/icons';
import { useTheme } from '@material-ui/core/styles';
import { useDebounceCallback } from '@react-hook/debounce';
import axios from 'axios';
import cn from 'classnames';
import gql from 'graphql-tag';
import { random } from 'lodash';
import dynamic from 'next/dynamic';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import Draggable from 'react-draggable';
import ReactResizeDetector from 'react-resize-detector';
import { useAuth } from '../imports/auth';
import { useClickEmitter } from '../imports/click-emitter';
import { EnginePanel, EngineWindow, useEngineConnected } from '../imports/engine';
import { deleteLink, GUEST, insertLink, JWT, LINKS_string } from '../imports/gql';
import { ForceGraph, ForceGraph2D, ForceGraph3D, ForceGraphVR, SpriteText, Three } from '../imports/graph';
import { LinkCard } from '../imports/link-card/index';
import { Provider } from '../imports/provider';
import { Backdrop, Button, ButtonGroup, Grid, IconButton, makeStyles, Paper, Popover, TextField, Typography } from '../imports/ui';
import { GLOBAL_ID_CONTAIN, GLOBAL_ID_PACKAGE, GLOBAL_ID_PROMISE,  GLOBAL_ID_RESOLVED, GLOBAL_ID_REJECTED, GLOBAL_ID_THEN, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { flatten } from 'lodash';
import json5 from 'json5';

import pckg from '../package.json';
import { GUI, PaperPanel, useShowTypes, usePromises, useGraphiql, useShowMP, useClickSelect, useContainer, useContainerVisible, useForceGraph, useInserting, useScreenFind, useLabelsConfig, useWindowSize, useGraphiqlHeight, useBaseTypes } from '../imports/gui';
import { generateQuery, generateQueryData } from '@deep-foundation/deeplinks/imports/gql';
import { DeepLoader } from '../imports/loader';

// @ts-ignore
const Graphiql = dynamic(() => import('../imports/graphiql').then(m => m.Graphiql), { ssr: false });

type StyleProps = { connected: boolean; };
const connectedPosition = (style: any) => ({
  position: 'relative',
  transition: 'all 1s ease',
  ...style,
});

const useStyles = makeStyles((theme) => ({
  "@global": {
    body: {
      backgroundColor: theme?.palette?.background?.default,
    },
  },
  root: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: theme?.palette?.background?.default,
    overflow: 'hidden',
    animation: '5s $deeplinksBackground ease'
  },
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

export function useOperation() {
  return useLocalStore('dc-dg-operation', '');
}

export const AuthPanel = React.memo<any>(function AuthPanel() {
  const auth = useAuth();
  const [operation, setOperation] = useOperation();

  return <>
    <ButtonGroup variant="outlined">
      <Button disabled>{auth.linkId}</Button>
      <Button color={operation === 'auth' ? 'primary' : 'default'} onClick={() => setOperation(operation === 'auth' ? '' : 'auth')}>login</Button>
      <Button onClick={() => auth.guest()}>guest</Button>
      <Button onClick={() => auth.setLinkId(0)}>logout</Button>
    </ButtonGroup>
  </>;
});

export function useSelectedLinks() {
  return useQueryStore('dc-dg-sl', []);
}

const defaultGraphiqlHeight = 300;

type IFocusLink = (id: number) => any;
export const DeepGraphContext = createContext<{ focusLink: IFocusLink }>({ focusLink: (id: number) => {} });
export function DeepGraphProvider({ children, focusLink }: { children: any; focusLink: IFocusLink }) {
  return <DeepGraphContext.Provider value={{ focusLink }}>
    {children}
  </DeepGraphContext.Provider>;
}
export function useDeepGraph() {
  return useContext(DeepGraphContext);
}

export function useFlyPanel() {
  return useState<any>();
};

export function PageContent() {
  const auth = useAuth();
  const theme: any = useTheme();
  const [windowSize, setWindowSize] = useWindowSize();
  const [graphiqlHeight, setGraphiqlHeight] = useGraphiqlHeight();
  const [flyPanel, setFlyPanel] = useFlyPanel();

  const [showTypes, setShowTypes] = useShowTypes();
  const [promises, setPromises] = usePromises();
  const [graphiql, setGraphiql] = useGraphiql();
  const [showMP, setShowMP] = useShowMP();
  const [clickSelect, setClickSelect] = useClickSelect();
  const [container, setContainer] = useContainer();
  const [containerVisible, setContainerVisible] = useContainerVisible();
  const [forceGraph, setForceGraph] = useForceGraph();
  const [inserting, setInserting] = useInserting();
  const [screenFind, setScreenFind] = useScreenFind();
  const [labelsConfig, setLabelsConfig] = useLabelsConfig();

  const [selectedLinks, setSelectedLinks] = useSelectedLinks();
  const [operation, setOperation] = useOperation();
  const [connected, setConnected] = useEngineConnected();
  const [baseTypes, setBaseTypes] = useBaseTypes();

  useEffect(() => {(async () => {
    setBaseTypes({
      Focus: await deep.id('@deep-foundation/core', 'Focus'),
      Query: await deep.id('@deep-foundation/core', 'Query'),
    });
  })()}, []);
  
  const classes = useStyles({ connected });
  const deep = useDeep();

  useEffect(() => {
    // @ts-ignore
    global.axios = axios;
    const pl = Capacitor.getPlatform();
    if (pl === 'web') {
      console.log(`platform is web, connection to server to ${process.env.NEXT_PUBLIC_DEEPLINKS_SERVER}/api/deeplinks`);
      axios.post(`${process.env.NEXT_PUBLIC_DEEPLINKS_SERVER}/api/deeplinks`, { abc: 123 }).then(console.log, console.log);
    } else if (pl === 'electron') {
      console.log(`platform is electron, connection to server to ${process.env.NEXT_PUBLIC_DEEPLINKS_SERVER}/api/deeplinks`);
      axios.post(`${process.env.NEXT_PUBLIC_DEEPLINKS_SERVER}/api/deeplinks`, { def: 234 }).then(console.log, console.log);
    } else {
      console.log(`platform is not detected, connection to server lost`);
    }
  }, []);

  const [results, setResults] = useState({});
  const prevD = useRef<any>({ nodes: [], links: [] });
  const { ml, focuses } = useMemo(() => {
    const newResults = {};
    const focuses = [];
    const fks = Object.keys(results);
    for (let f = 0; f < fks.length; f++) {
      const fk = fks[f];
      for (let i = 0; i < results[fk].length; i++) {
        const link = results[fk][i];
        focuses.push({ from_id: +fk, to_id: +link.id });
        newResults[link.id] = link;
      }
    }
    const ml = minilinks(Object.values(newResults));
    return { ml, focuses };
  }, [results]);
  const outD = useMemo(() => {
    if (results) {
      const prev = prevD.current;
      var prevNodes = prev?.nodes?.reduce(function(map, node) {
        map[node.id] = node;
        return map;
      }, {});

      const nodes = [];
      const links = [];

      for (let l = 0; l < ml.links.length; l++) {
        const link = ml.links[l];
        const plainLink = { id: link.id, type_id: link.type_id, from_id: link.from_id, to_id: link.to_id, value: link.value };
        const isTransparent = link.type_id === GLOBAL_ID_CONTAIN && link?.from?.type_id === GLOBAL_ID_PACKAGE && !containerVisible;

        if (!promises && [GLOBAL_ID_PROMISE, GLOBAL_ID_THEN, GLOBAL_ID_RESOLVED, GLOBAL_ID_REJECTED].includes(link.type_id)) {
          continue;
        }

        const label: (string|number)[] = [];
        if (!isTransparent) {
          label.push(link.id);
          if (labelsConfig?.values && link?.value?.value) {
            let json;
            try { json = json5.stringify(link.value.value); } catch(error) {}
            label.push(`value:${
              typeof(link.value.value) === 'object' && json
              ? json : link.value.value
            }`);
          }
          if (labelsConfig?.contains) (link?.inByType?.[GLOBAL_ID_CONTAIN] || []).forEach(link => label.push(`name:${link?.value?.value}`));
          if (labelsConfig?.types) if (link?.type?.value?.value) label.push(`type:${link?.type?.value?.value}`);
        }

        nodes.push({ ...prevNodes?.[link.id], id: link.id, link: plainLink, label, textColor: baseTypes.Query === link.type_id ? '#03a9f4' : undefined });

        if ((showTypes) && (link.type_id && link.type)) links.push({ id: `type--${link.id}`, source: link.id, target: link.type_id, link: plainLink, type: 'type', color: isTransparent ? 'transparent' : '#ffffff' });

        if (showMP) for (let i = 0; i < link._by_item.length; i++) {
          const pos = link._by_item[i];
          links.push({ id: `by-item--${pos.id}`, source: link.id, target: pos.path_item_id, link: plainLink, pos, type: 'by-item', color: isTransparent ? 'transparent' : '#ffffff' });
        }
      }
      for (let f = 0; f < focuses.length; f++) {
        const focus = focuses[f];
        if (ml.byId[focus.from_id] && ml.byId[focus.to_id]) links.push({ id: `focus--${f}`, source: focus.from_id, target: focus.to_id, type: 'focus', color: 'transparent' });
      }
      for (let l = 0; l < ml.links.length; l++) {
        const link = ml.links[l];
        const plainLink = { id: link.id, type_id: link.type_id, from_id: link.from_id, to_id: link.to_id, value: link.value };
        const isTransparent = link.type_id === GLOBAL_ID_CONTAIN && link?.from?.type_id === GLOBAL_ID_PACKAGE && !containerVisible;

        if (!promises && [GLOBAL_ID_PROMISE, GLOBAL_ID_THEN, GLOBAL_ID_RESOLVED, GLOBAL_ID_REJECTED].includes(link.type_id)) {
          continue;
        }

        if (link.from) links.push({ id: `from--${link.id}`, source: link.id, target: link.from_id || link.id, link: plainLink, type: 'from', color: isTransparent ? 'transparent' : '#a83232' });
        if (link.to) links.push({ id: `to--${link.id}`, source: link.id, target: link.to_id || link.id, link: plainLink, type: 'to', color: isTransparent ? 'transparent' : '#32a848' });
      }

      return { nodes, links };
    }
    return prevD.current;
  }, [containerVisible, container, labelsConfig, selectedLinks, results ]);
  prevD.current = outD;
  
  const mouseMove = useRef<any>();
  const onNodeClickRef = useRef<any>();
  const clickEventEmitter = useClickEmitter();
  const onNodeClick = useDebounceCallback((node) => {
    if (operation === 'auth') {
      auth.setLinkId(+node.link.id);
      setOperation('');
    } else if (operation === 'delete') {
      deep.delete(node.link.id);
      setOperation('');
    } else if (operation === 'from') {
      setInserting({ ...inserting, from: node.link.id });
      setOperation('');
    } else if (operation === 'to') {
      setInserting({ ...inserting, to: node.link.id });
      setOperation('');
    } else if (operation === 'type') {
      setInserting({ ...inserting, type: node.link.id });
      setOperation('');
    } else if (operation === 'pipette') {
      setInserting({ ...inserting, from: node.link.from_id, to: node.link.to_id, type: node.link.type_id });
      setOperation('');
    } else if (operation === 'container') {
      setContainer(node.link.id);
      setOperation('');
    } else if (clickSelect) {
      setFlyPanel({
        top: (mouseMove?.current?.clientY),
        left: (mouseMove?.current?.clientX),
        link: node.link,
      });
    } else if (operation) {
      clickEventEmitter.emit(operation, node.link);
    } else {
      if (!selectedLinks.find(i => i === node.link.id)) setSelectedLinks([ ...selectedLinks, node.link.id ]);
    }
  }, 500);
  onNodeClickRef.current = onNodeClick;

  const rootRef = useRef<any>();

  const fgRef = useRef<any>();
  const focusLink = useCallback((id: number) => {
    const node = (outD.nodes || [])?.find(n => n.id === id);

    const distance = 40;
    const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);

    var dx = node.dx,
      dy = node.dy,
      x = node.x,
      y = node.y,
      scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / rootRef?.current.outerWidth, dy / rootRef?.current.outerHeight))),
      translate = [rootRef?.current.outerWidth / 2 - scale * x, rootRef?.current.outerHeight / 2 - scale * y];

    try {
      fgRef.current.centerAt(x, y)
    } catch(error) {}
    try {
      fgRef?.current?.cameraPosition(
        { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio }, // new position
        node, // lookAt ({ x, y, z })
        3000  // ms transition duration
      );
    } catch(error) {}
  }, [outD]);

  return <DeepGraphProvider focusLink={focusLink}>
    <DeepLoader onChange={results => setResults(results)}/>
    <div
      ref={rootRef}
      className={classes.root}
      onMouseMove={(e) => {
        mouseMove.current = { clientX: e.clientX, clientY: e.clientY };
      }}
    >
      <ReactResizeDetector
        handleWidth handleHeight
        onResize={(width, height) => setWindowSize({ width, height })}
      />
      <Popover
        open={!!flyPanel}
        anchorReference="anchorPosition"
        anchorPosition={flyPanel}
        onClose={() => setFlyPanel(null)}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'left',
        }}
      >
        {!!flyPanel && <div style={{ position: 'relative' }}>
          <LinkCard link={flyPanel.link}/>
          <IconButton
            size="small" style={{ position: 'absolute', top: 6, right: 6 }}
            onClick={() => {
              setSelectedLinks([ ...selectedLinks, flyPanel.link.id ]);
              setFlyPanel(null);
            }}
          ><Add/></IconButton>
        </div>}
      </Popover>
      {[<ForceGraph
        fgRef={fgRef}
        key={''+windowSize.width+windowSize.height}
        Component={forceGraph}
        graphData={outD}
        backgroundColor={theme?.palette?.background?.default}
        linkAutoColorBy={(l) => l.color || '#fff'}
        linkOpacity={1}
        linkWidth={0.5}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkLabel={l => (
          l.type === 'by-item'
          ? `${l?.pos?.item_id}/${l?.pos?.path_item_id}/${l?.pos?.path_item_depth}(${l?.pos?.root_id})`
          : ''
        )}
        linkCurvature={l => (
          l.type === 'from'
          ? 0.25
          : l.type === 'to'
          ? -0.25
          : 0
        )}
        linkLineDash={l => (
          l.type === 'by-item'
          ? [5, 5]
          : false
        )}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const _l = node.label || [];

          const isSelected = screenFind ? (
            node?.link?.id.toString() === screenFind || !!(_l?.join(' ')?.includes(screenFind))
          ) : selectedLinks?.find(id => id === node?.link?.id);

          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          let textWidth = 0;
          for (var i = 0; i < _l.length; i++)
            textWidth = ctx.measureText(node.label).width > textWidth ? ctx.measureText(node.label).width : textWidth;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

          ctx.fillStyle = 'rgba(0,0,0, 0)';
          ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, textWidth, fontSize * _l.length);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isSelected ? '#fff' : (node?.textColor || '#707070');

          for (var i = 0; i < _l.length; i++)
            ctx.fillText(_l[i], node.x, node.y + (i * 12/globalScale) );
        }}
        // nodeThreeObject={node => {
        //   return new Three.Mesh(
        //     [
        //       new Three.BoxGeometry(Math.random() * 20, Math.random() * 20, Math.random() * 20),
        //       new Three.ConeGeometry(Math.random() * 10, Math.random() * 20),
        //       new Three.CylinderGeometry(Math.random() * 10, Math.random() * 10, Math.random() * 20),
        //       new Three.DodecahedronGeometry(Math.random() * 10),
        //       new Three.SphereGeometry(Math.random() * 10),
        //       new Three.TorusGeometry(Math.random() * 10, Math.random() * 2),
        //       new Three.TorusKnotGeometry(Math.random() * 10, Math.random() * 2)
        //     ][node.id%7],
        //     new Three.MeshLambertMaterial({
        //       color: Math.round(Math.random() * Math.pow(2, 24)),
        //       transparent: true,
        //       opacity: 0.75
        //     })
        //   );
        // }}
        // nodeThreeObject={node => {
        //   const _l = node.label || [];

        //   const isSelected = screenFind ? (
        //     node?.link?.id.toString() === screenFind || !!(_l?.join(' ')?.includes(screenFind))
        //   ) : selectedLinks?.find(id => id === node?.link?.id);

        //   const sprite = new SpriteText(_l.join(' '));
        //   sprite.color = isSelected ? '#fff' : '#707070';
        //   sprite.textHeight = 8;
        //   return new Three.Mesh(sprite);
        // }}
        onNodeDragEnd={node => {
          if (node.fx) delete node.fx;
          else node.fx = node.x;
          if (node.fy) delete node.fy;
          else node.fy = node.y;
          if (node.fz) delete node.fz;
          else node.fz = node.z;
        }}
        onNodeClick={(node) => {
          onNodeClickRef.current(node);
        }}
        onNodeHover={(node) => {
          
        }}
      />]}
      <GUI ml={ml}/>
      {!!connected && graphiql && <Draggable
        axis="y"
        handle=".handle"
        defaultPosition={{x: 0, y: 0}}
        position={null}
        scale={1}
        onStart={(data) => {
        }}
        onDrag={(data) => {
        }}
        onStop={(data: any) => {
          setGraphiqlHeight((window.innerHeight - data?.pageY) - 10);
        }}
      >
        <div style={{
          position: 'fixed', zIndex: 10, bottom: defaultGraphiqlHeight, left: 0,
          width: '100%', height: 10,
          userSelect: 'none',
        }}>
          <div className="handle" style={{
            height: '100%', width: '100%', position: 'relative',
          }}>
            <div style={{
              position: 'absolute', left: 'calc(50% - 30px)', top: 'calc(50% - 3px)', 
              width: 60, height: 6, backgroundColor: 'grey', borderRadius: 7,
            }}></div>
          </div>
        </div>
      </Draggable>}
      <Backdrop className={classes.backdrop} open={!connected}>
        <PaperPanel flying>
          <EngineWindow/>
          <Typography align='center'><Button disabled>{pckg.version}</Button></Typography>
        </PaperPanel>
      </Backdrop>
    </div>
  </DeepGraphProvider>;
}

export function PageConnected() {
  const [token, setToken] = useTokenController();
  const client = useApolloClient();
  return <>
    {!!token && !!client.jwt_token && [<PageContent key={token}/>]}
  </>
}

export default function Page() {
  return (
    <Provider>
      <PageConnected/>
    </Provider>
  );
}
