import { Capacitor } from '@capacitor/core';
import { GLOBAL_ID_CONTAIN, GLOBAL_ID_PACKAGE, GLOBAL_ID_PROMISE, GLOBAL_ID_REJECTED, GLOBAL_ID_RESOLVED, GLOBAL_ID_THEN, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { minilinks } from '@deep-foundation/deeplinks/imports/minilinks';
import { useTokenController } from '@deep-foundation/deeplinks/imports/react-token';
import { useApolloClient } from '@deep-foundation/react-hasura/use-apollo-client';
import { useLocalStore } from '@deep-foundation/store/local';
import { useQueryStore } from '@deep-foundation/store/query';
import { useTheme } from '@material-ui/core/styles';
import { Add } from '@material-ui/icons';
import { useDebounceCallback } from '@react-hook/debounce';
import axios from 'axios';
import json5 from 'json5';
import dynamic from 'next/dynamic';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import ReactResizeDetector from 'react-resize-detector';
import { useClickEmitter } from '../imports/click-emitter';
import { EngineWindow, useEngineConnected } from '../imports/engine';
import { ForceGraph, ForceGraph2D, ForceGraph3D, ForceGraphVR, SpriteText } from '../imports/graph';
import { GUI, PaperPanel, useBackgroundTransparent, useBaseTypes, useClickSelect, useContainer, useContainerVisible, useForceGraph, useGraphiqlHeight, useInserting, useLabelsConfig, usePromises, useScreenFind, useShowMP, useShowTypes, useSpaceId, useWindowSize } from '../imports/gui';
import { LinkCard } from '../imports/link-card/index';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { Backdrop, Button, ButtonGroup, IconButton, makeStyles, Popover, Typography } from '../imports/ui';
import pckg from '../package.json';


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
    body: ({ bgTransparent }: any) => ({
      backgroundColor: bgTransparent ? 'transparent' : theme?.palette?.background?.default,
    }),
  },
  root: ({ bgTransparent }: any) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: bgTransparent ? 'transparent' : theme?.palette?.background?.default,
    overflow: 'hidden',
    animation: '5s $deeplinksBackground ease'
  }),
  backdrop: {
    zIndex: theme.zIndex.drawer + 1,
  },
}));

export function useOperation() {
  return useLocalStore('dc-dg-operation', '');
}

export const AuthPanel = React.memo<any>(function AuthPanel() {
  const deep = useDeep();
  const [operation, setOperation] = useOperation();

  return <>
    <ButtonGroup variant="outlined">
      <Button disabled>{deep.linkId}</Button>
      <Button color={operation === 'auth' ? 'primary' : 'default'} onClick={() => setOperation(operation === 'auth' ? '' : 'auth')}>login</Button>
      <Button onClick={async () => {
        const g = await deep.guest({});
        console.log('gg', g);
      }}>guest</Button>
      <Button onClick={() => deep.logout()}>logout</Button>
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
  const theme: any = useTheme();
  const [windowSize, setWindowSize] = useWindowSize();
  const [flyPanel, setFlyPanel] = useFlyPanel();

  const [showTypes, setShowTypes] = useShowTypes();
  const [promises, setPromises] = usePromises();
  const [showMP, setShowMP] = useShowMP();
  const [clickSelect, setClickSelect] = useClickSelect();
  const [container, setContainer] = useContainer();
  const [containerVisible, setContainerVisible] = useContainerVisible();
  const [forceGraph, setForceGraph] = useForceGraph();
  const [inserting, setInserting] = useInserting();
  const [screenFind, setScreenFind] = useScreenFind();
  const [labelsConfig, setLabelsConfig] = useLabelsConfig();
  const [spaceId, setSpaceId] = useSpaceId();

  const [selectedLinks, setSelectedLinks] = useSelectedLinks();
  const [operation, setOperation] = useOperation();
  const [connected, setConnected] = useEngineConnected();
  const [baseTypes, setBaseTypes] = useBaseTypes();
  const [bgTransparent] = useBackgroundTransparent();

  useEffect(() => {(async () => {
    setBaseTypes({
      Contain: await deep.id('@deep-foundation/core', 'Contain'),
      Focus: await deep.id('@deep-foundation/core', 'Focus'),
      Query: await deep.id('@deep-foundation/core', 'Query'),
      Space: await deep.id('@deep-foundation/core', 'Space'),
      User: await deep.id('@deep-foundation/core', 'User'),
    });
  })()}, []);
  
  const classes = useStyles({ connected, bgTransparent });
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
  const { ml } = useMemo(() => {
    const newResults = {};
    const fks = Object.keys(results);
    for (let f = 0; f < fks.length; f++) {
      const fk = fks[f];
      for (let i = 0; i < results[fk].length; i++) {
        const link = results[fk][i];
        newResults[link?.id] = link;
      }
    }
    const ml = minilinks(Object.values(newResults));
    return { ml };
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
      const _tempHash = {};

      for (let l = 0; l < ml.links.length; l++) {
        const link = ml.links[l];
        // const link = { id: link?.id, type_id: link?.type_id, from_id: link?.from_id, to_id: link?.to_id, value: link?.value };
        const isTransparent = (
          (link?.type_id === GLOBAL_ID_CONTAIN && link?.from?.type_id === GLOBAL_ID_PACKAGE && !containerVisible)
        );
        
        const isVisible = (
          (link?.type_id === baseTypes.Focus && (labelsConfig.focuses)) ||
          (link?.type_id !== baseTypes.Focus)
        );

        if (!promises && [GLOBAL_ID_PROMISE, GLOBAL_ID_THEN, GLOBAL_ID_RESOLVED, GLOBAL_ID_REJECTED].includes(link?.type_id)) {
          continue;
        }

        const label: (string|number)[] = [];
        if (!isTransparent) {
          label.push(link?.id);
          if (labelsConfig?.contains) (link?.inByType?.[GLOBAL_ID_CONTAIN] || []).forEach(link => link?.value?.value && label.push(`${link?.value?.value}`));
          if (labelsConfig?.values && link?.value?.value) {
            let json;
            try { json = json5.stringify(link?.value.value); } catch(error) {}
            label.push(`value:${
              typeof(link?.value.value) === 'object' && json
              ? json : link?.value.value
            }`);
          }
          if (labelsConfig?.types) if (link?.type?.value?.value) label.push(`type:${link?.type?.value?.value}`);
        }

        const focus = link?.inByType[baseTypes.Focus]?.find(f => f.from_id === spaceId);

        if (isVisible) {
          let optional;
          if (prevNodes?.[link?.id]?._dragged) {
            optional = { _dragged: false };
           } else {
            optional = {
              fx: focus?.value?.value?.x,
              fy: focus?.value?.value?.y,
              fz: focus?.value?.value?.z,
              x: focus?.value?.value?.x,
              y: focus?.value?.value?.y,
              z: focus?.value?.value?.z,
            };
          }
          _tempHash[link?.id] = true;
          nodes.push({
            ...prevNodes?.[link?.id],
            id: link?.id,
            link: link,
            label,
            textColor: (
              [spaceId, deep.linkId].includes(link?.id) ||
              [baseTypes.Space, baseTypes.User].includes(link?.type_id) ? theme?.palette?.primary?.main : undefined
            ),
            _focusId: focus?.id,
            ...optional,
          });
        }

        if ((showTypes) && (link?.type_id && link?.type)) links.push({ id: `type--${link?.id}`, source: link?.id, target: link?.type_id, link: link, type: 'type', color: isTransparent ? 'transparent' : '#ffffff' });

        if (showMP) for (let i = 0; i < link?._by_item?.length; i++) {
          const pos = link?._by_item?.[i];
          if (_tempHash[pos.path_item_id]) links.push({ id: `by-item--${pos.id}`, source: link?.id, target: pos.path_item_id, link: link, pos, type: 'by-item', color: isTransparent ? 'transparent' : '#ffffff' });
        }
      }

      for (let l = 0; l < ml.links.length; l++) {
        const link = ml.links[l];
        // const link = { id: link?.id, type_id: link?.type_id, from_id: link?.from_id, to_id: link?.to_id, value: link?.value };
        const isTransparent = link?.type_id === GLOBAL_ID_CONTAIN && link?.from?.type_id === GLOBAL_ID_PACKAGE && !containerVisible;
        
        const isVisible = (
          (link?.type_id === baseTypes.Focus && (labelsConfig.focuses)) ||
          (link?.type_id !== baseTypes.Focus)
        );

        if (!promises && [GLOBAL_ID_PROMISE, GLOBAL_ID_THEN, GLOBAL_ID_RESOLVED, GLOBAL_ID_REJECTED].includes(link?.type_id)) {
          continue;
        }

        if (isVisible) {
          if (link?.from) links.push({ id: `from--${link?.id}`, source: link?.id, target: link?.from_id || link?.id, link: link, type: 'from', color: isTransparent ? 'transparent' : '#a83232' });
          if (link?.to) links.push({ id: `to--${link?.id}`, source: link?.id, target: link?.to_id || link?.id, link: link, type: 'to', color: isTransparent ? 'transparent' : '#32a848' });
        }
      }

      return { nodes, links };
    }
    return prevD.current;
  }, [containerVisible, container, labelsConfig, selectedLinks, results, spaceId]);
  prevD.current = outD;
  
  const mouseMove = useRef<any>();
  const onNodeClickRef = useRef<any>();
  const clickEventEmitter = useClickEmitter();
  const onNodeClick = useDebounceCallback((node) => {
    if (operation === 'auth') {
      console.log({ linkId: +node.link?.id })
      deep.login({ linkId: +node.link?.id });
      setOperation('');
    } else if (operation === 'delete') {
      deep.delete(node.link?.id);
      setOperation('');
    } else if (operation === 'from') {
      setInserting({ ...inserting, from: node.link?.id });
      setOperation('');
    } else if (operation === 'to') {
      setInserting({ ...inserting, to: node.link?.id });
      setOperation('');
    } else if (operation === 'type') {
      setInserting({ ...inserting, type: node.link?.id });
      setOperation('');
    } else if (operation === 'pipette') {
      setInserting({ ...inserting, from: node.link?.from_id, to: node.link?.to_id, type: node.link?.type_id });
      setOperation('');
    } else if (operation === 'container') {
      setContainer(node.link?.id);
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
      if (!selectedLinks.find(i => i === node.link?.id)) setSelectedLinks([ ...selectedLinks, node.link?.id ]);
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

  const holdRef = useRef<any>({});

  return <DeepGraphProvider focusLink={focusLink}>
    {[<DeepLoader key={spaceId} spaceId={spaceId} onChange={results => setResults(results)}/>]}
    <div
      ref={rootRef}
      className={classes.root}
      onMouseUp={(e) => clearTimeout(holdRef.current)}
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
          <LinkCard link={flyPanel.link} ml={ml}/>
          <IconButton
            size="small" style={{ position: 'absolute', top: 6, right: 6 }}
            onClick={() => {
              setSelectedLinks([ ...selectedLinks, flyPanel.link?.id ]);
              setFlyPanel(null);
            }}
          ><Add/></IconButton>
        </div>}
      </Popover>
      {[<ForceGraph
        fgRef={fgRef}
        key={''+windowSize.width+windowSize.height}
        Component={
          forceGraph == '2d'
          ? ForceGraph2D
          : forceGraph == '3d'
          ? ForceGraph3D
          : ForceGraphVR
        }
        graphData={outD}
        backgroundColor={bgTransparent ? 'transparent' : theme?.palette?.background?.default}
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
          : l.type === 'by-item'
          ? 0.1
          : 0
        )}
        linkLineDash={l => (
          l.type === 'by-item'
          ? [5, 5]
          : false
        )}
        nodeCanvasObject={(node, ctx, globalScale) => {
          const _l = [...(node.label || [])];
          _l[0] = node._focusId ? `[${_l[0]}]` : _l[0];

          // <isSelected>
          const isSelected = screenFind ? (
            node?.link?.id.toString() === screenFind || !!(_l?.join(' ')?.includes(screenFind))
            ) : selectedLinks?.find(id => id === node?.link?.id);
          // </isSelected>
            
          const fontSize = 12/globalScale;
          ctx.font = `${fontSize}px Sans-Serif`;
          let textWidth = 0;
          for (var i = 0; i < _l.length; i++)
            textWidth = ctx.measureText(node.label).width > textWidth ? ctx.measureText(node.label).width : textWidth;
          const bckgDimensions = [textWidth, fontSize].map(n => n + fontSize * 0.2); // some padding

          ctx.fillStyle = 'rgba(0,0,0,0)';
          ctx.fillRect(node.x - bckgDimensions[0] / 2, node.y - bckgDimensions[1] / 2, textWidth, fontSize * _l.length);

          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillStyle = isSelected ? '#fff' : (node?.textColor || '#707070');

          for (var i = 0; i < _l.length; i++)
            ctx.fillText(_l[i], node.x, node.y + (i * 12/globalScale) );
        }}
        nodeThreeObject={forceGraph != 'vr' ? node => {
          const _l = [...(node.label || [])];
          _l[0] = node._focusId ? `[${_l[0]}]` : _l[0];

          // <isSelected>
          const isSelected = screenFind ? (
            node?.link?.id.toString() === screenFind || !!(_l?.join(' ')?.includes(screenFind))
            ) : selectedLinks?.find(id => id === node?.link?.id);
          // </isSelected>

          const sprite = new SpriteText(_l.join('\n'));
          sprite.color = isSelected ? '#fff' : (node?.textColor || '#707070');
          sprite.textHeight = 4;
          return sprite;
        } : undefined}
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
        onNodeDrag={(node) => {
          clearTimeout(holdRef.current.timeout);
          const { id, x, y, z, fx, fy, fz } = node;
          const focus = ml.byId[id].inByType[baseTypes.Focus]?.find(f => f.from_id === spaceId);
          if (spaceId) {
            holdRef.current = {
              node,
              id, x, y, z, fx, fy, fz,
              fix: holdRef.current.id === id ? holdRef.current.fix : !!focus,
              needrehold: false,
              timeout: setTimeout(async () => {
                holdRef.current.needrehold = true;
                const focus = ml.byId[id].inByType[baseTypes.Focus]?.find(f => f.from_id === spaceId);
                if (focus) {
                  holdRef.current.fix = false;
                  console.log('unfocus', { id, x, y, z, fx, fy, fz });
                  const where = { type_id: await deep.id('@deep-foundation/core', 'Focus'), from_id: spaceId, to_id: node.id };
                  await deep.delete(where);
                  console.log('unfocused');
                } else {
                  holdRef.current.fix = true;
                  console.log('focus');
                  const q = await deep.select({
                    type_id: await deep.id('@deep-foundation/core', 'Focus'),
                    from_id: spaceId,
                    to_id: node.id,
                  });
                  const oldFocusId = q?.data?.[0]?.id;
                  let focusId = oldFocusId;
                  if (!focusId) {
                    const { data: [{ id: newFocusId }] } = await deep.insert({
                      type_id: await deep.id('@deep-foundation/core', 'Focus'),
                      from_id: spaceId,
                      to_id: node.id,
                    });
                    focusId = newFocusId;
                  }
                  node._focusId = focusId;
                  await deep.insert({ link_id: focusId, value: { x, y, z } }, { table: 'objects', variables: { on_conflict: { constraint: 'objects_pkey', update_columns: 'value' } } });
                  console.log('focused');
                }
              }, 500),
            };
          }
        }}
        onNodeDragEnd={async (node) => {
          clearTimeout(holdRef.current.timeout);
          const { id, x, y, z, fx, fy, fz } = node;
          if (spaceId) {
            holdRef.current.needrehold = false;
            const focus = ml.byId[id].inByType[baseTypes.Focus]?.find(f => f.from_id === spaceId);
            console.log('fix', holdRef?.current?.fix, 'focus', !!focus);
            if (focus || holdRef?.current?.fix) {
              node.fx = x;
              node.fy = y;
              node.fz = z;
            } else {
              delete node.fx;
              delete node.fy;
              delete node.fz;
            }
          }
          if (!holdRef?.current?.needrehold && node._focusId) {
            node._dragged = true;
            await deep.update({ link_id: node._focusId }, { value: { x, y, z } }, { table: 'objects' });
          }

          holdRef.current = {};
        }}
        onNodeClick={(node) => {
          onNodeClickRef.current(node);
        }}
        onNodeRightClick={(node) => {
          if (node?.link?.type_id === baseTypes.Space) setSpaceId(node.id);
        }}
        onNodeHover={(node) => {
          
        }}
      />]}
      <GUI ml={ml}/>
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
  const [spaceId, setSpaceId] = useSpaceId();
  const deep = useDeep();
  useEffect(() => {(async () => {
    if (!deep.token) {
      const { token, linkId } = await deep.guest({});
      setSpaceId(linkId);
    }
  })()}, [deep?.token]);
  return <>
    {!!deep.token && [<PageContent key={`${deep?.token || ''}-${deep?.linkId || ''}-${spaceId}`}/>]}
  </>
}

export default function Page() {
  return (
    <Provider>
      <PageConnected/>
    </Provider>
  );
}
