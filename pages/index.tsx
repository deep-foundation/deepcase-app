import { Capacitor } from '@capacitor/core';
import { GLOBAL_ID_CONTAIN, GLOBAL_ID_PACKAGE, GLOBAL_ID_PROMISE, GLOBAL_ID_REJECTED, GLOBAL_ID_RESOLVED, GLOBAL_ID_THEN, useAuthNode, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { minilinks, MinilinkCollection, MinilinksGeneratorOptionsDefault, useMinilinksConstruct, MinilinksLink } from '@deep-foundation/deeplinks/imports/minilinks';
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
import { 
  useBackgroundTransparent, useBaseTypes, useClickSelect, useContainer, useFocusMethods, useForceGraph, useGraphiqlHeight, useInserting, useScreenFind, useSpaceId, useWindowSize,
  // useShowMP, useShowTypes, useContainerVisible, useLabelsConfig
} from '../imports/hooks';
import { 
  defaultCardWidth,
  GUI, PaperPanel
} from '../imports/gui';
import { LinkCard } from '../imports/link-card/index';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { Grid, Button, ButtonGroup, IconButton, makeStyles, Popover, Typography, Tooltip } from '../imports/ui';
import pckg from '../package.json';
import { useInterval } from 'usehooks-ts';
import isEqual from 'lodash/isEqual';
import remove from 'lodash/remove';
import isEqualWith from 'lodash/isEqualWith';
import copy from 'copy-to-clipboard';
import { useCheckAuth } from '../imports/use-check-auth';
import Debug from 'debug';
import jquery from 'jquery';
import { gql } from '@apollo/client';
import { CatchErrors } from '../imports/react-errors';

const debug = Debug('deepcase:index');
if (typeof(window) === 'object') localStorage.debug = 'deepcase:*,deeplinks:*,hasura:client';

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
    // body: ({ bgTransparent }: any) => ({
    //   backgroundColor: bgTransparent ? 'transparent' : theme?.palette?.background?.default,
    // }),
  },
  root: ({ bgTransparent }: any) => ({
    position: 'absolute',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    backgroundColor: bgTransparent ? 'transparent' : theme?.palette?.background?.default,
    overflow: 'hidden'
  }),
}));

export function useOperation() {
  return useLocalStore('dc-dg-operation', '');
}

export const AuthPanel = React.memo<any>(function AuthPanel({ ml }: { ml: any }) {
  const deep = useDeep();
  const [operation, setOperation] = useOperation();

  const [pastError, setPastError] = useState(false);
  const [valid, setValid] = useState<any>(undefined);
  const selectedMethods = useSelectedLinksMethods();
  const { focusLink } = useDeepGraph();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPastError(false);
      setValid(undefined);
    }, 3000);
    return () => clearTimeout(timer);
  }, [pastError, valid]);

  return <>
    <ButtonGroup variant="outlined">
      <Button onClick={() => {
        ml.byId[deep.linkId] && focusLink(deep.linkId);
        selectedMethods.add(0, deep.linkId);
        selectedMethods.scrollTo(0, deep.linkId);
      }}>user: {deep.linkId}</Button>
      <Button onClick={() => {
        copy(deep.token);
      }}>copy token</Button>
      <Tooltip open={!!valid || !!pastError} title={pastError ? 'Token invalid' : "Token valid, login?"} arrow>
        <Button color={pastError ? 'secondary' : valid ? 'primary' : 'default'} onClick={async () => {
          if (valid) await deep.login({ token: valid });
          else {
            setPastError(false);
            const token: string = await navigator?.clipboard?.readText();
            const { linkId, error } = await deep.jwt({ token });
            if (error && !linkId) setPastError(true);
            else if (linkId) setValid(token);
          }
        }}>{valid ? 'login token' : 'past token'}</Button>
      </Tooltip>
      <Button color={operation === 'auth' ? 'primary' : 'default'} onClick={() => setOperation(operation === 'auth' ? '' : 'auth')}>login</Button>
      <Button onClick={async () => {
        const g = await deep.guest({});
      }}>guest</Button>
      <Button onClick={async () => {
        const g = await deep.logout();
      }}>logout</Button>
    </ButtonGroup>
  </>;
});

export function useSelectedLinksMethods() {
  const [selectedLinks, setSelectedLinks, selectedRef] = useSelectedLinks();
  return useMemo(() => {
    return {
      add: function(column: number, id: number) {
        if (!selectedRef?.current?.find((c,i) => i === column)?.find(l => l === id)) {
          setSelectedLinks((selectedLinks) => [
            ...selectedLinks.slice(0, column),
            [...(selectedLinks?.[column] || []), id],
            ...selectedLinks.slice(column + 1),
          ]);
        }
      },
      scrollTo: function(column: number, id: number) {
        setTimeout(() => {
          jquery(`.lineto-${column}-${id}`)?.[0]?.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
        }, 200);
      },
      remove: function(column: number, id?: number, selectedLinkIndex?: number) {
        setSelectedLinks(selectedRef.current.map((sl, index) => {
          return column === index
          ? sl.filter((l, i) => l !== id && selectedLinkIndex !== i)
          : sl;
        }).filter(col => col.length > 0));
      },
    };
  }, []);
};

export function useSelectedLinks(): [number[][], (selectedLinks: (number[][] | ((oldValue: number[][]) => number[][]))) => void, { current: number[][] }] {
  const store = useQueryStore('dc-dg-sl', [[]]);
  const ref = useRef<any>(store[0]);
  ref.current = store[0];
  return [store[0], store[1], ref];
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

  // const [showTypes, setShowTypes] = useShowTypes();
  // const [showMP, setShowMP] = useShowMP();
  const [clickSelect, setClickSelect] = useClickSelect();
  const [container, setContainer] = useContainer();
  // const [containerVisible, setContainerVisible] = useContainerVisible();
  const [forceGraph, setForceGraph] = useForceGraph();
  const [inserting, setInserting] = useInserting();
  const [screenFind, setScreenFind] = useScreenFind();
  // const [labelsConfig, setLabelsConfig] = useLabelsConfig();
  const [spaceId, setSpaceId] = useSpaceId();

  const [selectedLinks, setSelectedLinks, selectedRef] = useSelectedLinks();
  const selectedMethods = useSelectedLinksMethods();
  const [operation, setOperation] = useOperation();
  const [baseTypes, setBaseTypes] = useBaseTypes();
  const [bgTransparent] = useBackgroundTransparent();
  const [connected, setConnected] = useEngineConnected();

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
  
  const classes = useStyles({ connected, bgTransparent });
  const deep = useDeep();
  const prevD = useRef<any>({});
  
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;

  console.log({minilinks});

  const [graphData, setGraphData] = useState({ spaceId, nodes: [], links: [], _links: {}, _nodes: {}, });
  const graphDataRef = useRef(graphData);
  graphDataRef.current = graphData;

  const checkEdgesAroundLink = useCallback((gd, nl) => {
    // const isTransparent = (
    //   nl?.type_id === GLOBAL_ID_CONTAIN && nl?.from?.type_id === GLOBAL_ID_PACKAGE
    // );
    const isTransparent = false;

    
    if (gd._nodes[nl?.from_id] && gd._nodes[nl?.id] && !gd?._links?.[`from--${nl?.id}`]) {
      // gd.links.push({ id: `from--${nl?.id}`, source: gd._nodes[nl?.id], target: gd._nodes[nl?.from_id], link: nl, type: 'from', color: isTransparent ? 'transparent' : '#a83232' });
      gd.links.push({ id: `from--${nl?.id}`, source: nl?.id, target: nl?.from_id, link: nl, type: 'from', color: isTransparent ? 'transparent' : '#a83232' });
      gd._links[`from--${nl?.id}`] = true;
    }
    if (gd._nodes[nl?.to_id] && gd._nodes[nl?.id] && !gd?._links?.[`to--${nl?.id}`]) {
      // gd.links.push({ id: `to--${nl?.id}`, source: gd._nodes[nl?.id], target: gd._nodes[nl?.to_id], link: nl, type: 'to', color: isTransparent ? 'transparent' : '#32a848' });
      gd.links.push({ id: `to--${nl?.id}`, source: nl?.id, target: nl?.to_id, link: nl, type: 'to', color: isTransparent ? 'transparent' : '#32a848' });
      gd._links[`to--${nl?.id}`] = true;
    }
  }, []);

  const listenerRef = useRef<any>();
  const selectedLinkIdsInGraphRef = useRef<any>({});
  useEffect(() => {
    const temp: any = {};
    for (const colI in selectedLinks) {
      const column = selectedLinks[colI];
      for (const rowI in column) {
        const link = ml.byId?.[column?.[rowI]];
        if (link) {
          temp[link.id] = link;
          if (selectedLinkIdsInGraphRef.current[link.id] && link) listenerRef?.current?.updatedListener(link, link);
        }
      }
    }
    Object.keys(selectedLinkIdsInGraphRef.current).forEach((id:string) => {
      const link = ml.byId[+id];
      if (!temp[+id] && link) listenerRef?.current?.updatedListener(link, link);
    });
  }, [selectedLinks]);
  useEffect(() => {
    setGraphData({ spaceId, nodes: [], links: [], _links: {}, _nodes: {}, });
    const notifyDependencies = (link, history) => {
      if (history[link.id]) return;
      history[link.id] = true;
      if (link.type_id === baseTypes.Contain) {
        debug('this is contain, need to update focus.to visualization');
        if (link?.to) {
          updatedListener(link.to, link.to, false);
          for (let i = 0; i < link.to.typed.length; i++) {
            const instance = link.to.typed[i];
            if (instance.id != link.id) {
              updatedListener(instance, instance, false);
            }
          }
        }
      }
      if (link.type_id === baseTypes.Focus || link.type_id === baseTypes.Active) {
        debug('this is focus or active, need to update focus.to visualization');
        if (link.to) updatedListener(link.to, link.to);
      }
      if (link?.typed?.length) {
        debug('this is type, need to update focus.typed visualization');
        for (let i = 0; i < link.typed.length; i++) {
          const instance = link.typed[i];
          if (instance.id != link.id) updatedListener(instance, instance);
        }
      }
    };
    const addedListener = (ol, nl, recursive = true, history = {}) => {
      setGraphData((graphData) => {
        if (graphData._nodes[nl?.id]) {
          debug('!added', nl);
          return graphData;
        }

        debug('added', nl?.id, nl);

        const active = nl?.inByType?.[baseTypes.Active]?.find(f => f.from_id === spaceId);
        debug('active', active?.id, active);

        const focus = nl?.inByType?.[baseTypes.Focus]?.find(f => f.from_id === spaceId);
        debug('focus', focus?.id, focus);

        let optional = {};
        if (focus?.value?.value) {
          optional = {
            fx: focus?.value?.value?.x,
            fy: focus?.value?.value?.y,
            fz: focus?.value?.value?.z,
            x: focus?.value?.value?.x,
            y: focus?.value?.value?.y,
            z: focus?.value?.value?.z,
          };
        }

        const label: (string|number)[] = [];
        label.push(focus ? `[${nl?.id}]` : nl?.id);
        if (/*labelsConfig?.values && */nl?.value?.value) {
          let json;
          try { json = json5.stringify(nl?.value.value); } catch(error) {}
          label.push(`value:${
            typeof(nl?.value.value) === 'object' && json
            ? json : nl?.value.value
          }`);
        }
        // if (labelsConfig?.types)
        if (nl?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value) label.push(`name:${nl?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value}`);
        if (nl?.type?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value) {
          label.push(`type:${nl?.type?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value}`);
        }

        const labelArray = label.map((s: string) => (s?.length > 30 ? `${s.slice(0, 30).trim()}...` : s));
        const labelString = labelArray.join('\n');

        // <isSelected>
        const isSelected = !!selectedRef?.current?.find(col => !!col?.find(id => id === nl?.id));
        // </isSelected>

        if (isSelected) selectedLinkIdsInGraphRef.current[nl?.id] = true;

        graphData._nodes[nl?.id] = {
          id: nl?.id,
          link: nl,
          labelArray,
          labelString,
          textColor: active ? '#03a9f4': isSelected ? '#ffffff' : '#757575',
          ...optional,
        };
        graphData.nodes.push(graphData._nodes[nl?.id]);
        debug('node', graphData._nodes[nl?.id]);

        debug('around', nl);
        checkEdgesAroundLink(graphData, nl);
        debug('around in', nl);
        nl.in.forEach(inl => {
          debug('around in', inl);
          checkEdgesAroundLink(graphData, inl);
        });
        debug('around out', nl);
        nl.out.forEach(outl => {
          debug('around out', outl);
          checkEdgesAroundLink(graphData, outl);
        });

        debug('notify', nl);
        if (recursive) notifyDependencies(nl, history);

        return { spaceId, _nodes: graphData._nodes, _links: graphData._links, nodes: [...graphData.nodes], links: [...graphData.links], };
      });
    };
    const updatedListener = (ol, nl, recursive = true, history = {}) => {
      if (history[nl.id]) return;
      history[nl.id] = true;
      debug('updated', nl.id, nl);
      removedListener(ol, undefined, recursive, history);
      addedListener(undefined, nl, recursive, history);
      debug('notify', nl.id, nl);
      if (recursive) notifyDependencies(nl, history);
    };
    const removedListener = (ol, nl, recursive = true, history = {}) => {
      history[ol.id] = true;
      setGraphData((graphData) => {
        debug('removed', ol.id, graphData.links);
        const removedLinks = remove(graphData.links, n => {
          return n?.id == ol.id ||
          n?.target == ol.id || n?.target?.id == ol.id ||
          n?.source == ol.id || n?.source?.id == ol.id ||
          n?.id == `from--${ol.id}` ||
          n?.id == `to--${ol.id}` ||
          n?.id == `type--${ol.id}`
        });
        removedLinks.forEach((rl) => {
          delete graphData._links[rl.id];
        })
        const removedNodes = remove(graphData.nodes, n => +n.id === +ol.id);
        delete graphData._nodes[ol.id];
        return { ...graphData };
      });
      debug('notify', ol);
      if (recursive) notifyDependencies(ol, history);
    };
    ml.emitter.on('added', addedListener);
    ml.emitter.on('updated', updatedListener);
    ml.emitter.on('removed', removedListener);
    listenerRef.current = {
      addedListener,
      updatedListener,
      removedListener,
    };
    return () => {
      ml.emitter.removeListener('added', addedListener);
      ml.emitter.removeListener('updated', updatedListener);
      ml.emitter.removeListener('removed', removedListener);
    };
  }, [spaceId]);

  const mouseMove = useRef<any>();
  const onNodeClickRef = useRef<any>();
  const clickEventEmitter = useClickEmitter();
  const onNodeClick = useDebounceCallback((node) => {
    if (operation === 'auth') {
      deep.login({ linkId: +node.link?.id }).then(console.log, console.log);
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
      setInserting({ ...inserting, from: node?.link?.from_id, to: node?.link?.to_id, type: node?.link?.type_id });
      setOperation('');
    } else if (operation === 'container') {
      setContainer(node.link?.id);
      setOperation('');
    } else if (clickSelect) {
      setFlyPanel({
        top: (mouseMove?.current?.clientY - (defaultCardWidth / 3)),
        left: (mouseMove?.current?.clientX - (defaultCardWidth / 2)),
        link: node?.link,
      });
    } else if (operation) {
      clickEventEmitter.emit(operation, node?.link);
    } else {
      if (!selectedLinks.find(i => i === node.link?.id))
      selectedMethods.add(0, node.link?.id);
      selectedMethods.scrollTo(0, node.link?.id);
    }
  }, 500);
  onNodeClickRef.current = onNodeClick;

  const rootRef = useRef<any>();

  const fgRef = useRef<any>();
  const focusLink = useCallback((id: number) => {
    // с
    const node = (graphData.nodes || [])?.find(n => n.id === id);

    const distance = 80;
    const distRatio = 1 - distance/Math.hypot(node.x, node.y, node.z);

    var dx = node.dx,
      dy = node.dy,
      dz = node.dz,
      x = node.x,
      y = node.y,
      z = node.z,
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
  }, [graphData]);

  const holdRef = useRef<any>({});

  const forceGraph_linkAutoColorBy = useCallback((l) => l.color || '#fff', []);
  const forceGraph_linkLabel = useCallback(l => (
    l.type === 'by-item'
    ? `${l?.pos?.item_id}/${l?.pos?.path_item_id}/${l?.pos?.path_item_depth}(${l?.pos?.root_id})`
    : ''
  ), []);
  const forceGraph_linkCurvature = useCallback(l => (
    l.type === 'from'
    ? 0.25
    : l.type === 'to'
    ? -0.25
    : l.type === 'by-item'
    ? 0.1
    : 0
    ), []);
  const forceGraph_linkLineDash = useCallback(l => (
    l.type === 'by-item'
    ? [5, 5]
    : false
  ), []);
  const forceGraph_nodeCanvasObject = useCallback((node, ctx, globalScale) => {
    const fontSize = 12/globalScale;
    ctx.font = `${fontSize}px Sans-Serif`;

    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = (node?.textColor || '#707070');

    for (var i = 0; i < node.labelArray.length; i++)
      ctx.fillText(node.labelArray[i], node.x, node.y + (i * 12/globalScale) );
  }, []);
  const forceGraph_nodeThreeObject = useCallback(node => {
    const sprite = new SpriteText(node.labelString);
    sprite.color = (node?.textColor || '#707070');
    sprite.textHeight = 4;
    return sprite;
  } , []);

  const focusMethods = useFocusMethods();
  const forceGraph_onNodeDrag = useCallback((node) => {
    clearTimeout(holdRef.current.timeout);
    const { id, x, y, z, fx, fy, fz } = node;
    const focus = ml?.byId?.[id]?.inByType[baseTypes.Focus]?.find(f => f.from_id === spaceId);
    if (spaceId) {
      holdRef.current = {
        node,
        id, x, y, z, fx, fy, fz,
        fix: holdRef.current.id === id ? holdRef.current.fix : !!focus,
        needrehold: false,
        timeout: setTimeout(async () => {
          holdRef.current.needrehold = true;
          const focus = ml?.byId?.[id]?.inByType[baseTypes.Focus]?.find(f => f.from_id === spaceId);
          if (focus) {
            holdRef.current.fix = false;
            delete node.fx;
            delete node.fy;
            delete node.fz;
            focusMethods.unfocus(node?.link?.id);
          } else {
            holdRef.current.fix = true;
            node.fx = x;
            node.fy = y;
            node.fz = z;
            focusMethods.focus(node?.link?.id, { x, y, z });
          }
        }, 300),
      };
    }
  }, [ml]);
  const forceGraph_onNodeDragEnd = useCallback(async (node) => {
    clearTimeout(holdRef.current.timeout);
    const { id, x, y, z, fx, fy, fz } = node;
    if (spaceId) {
      holdRef.current.needrehold = false;
      const focus = ml?.byId?.[id]?.inByType[baseTypes.Focus]?.find(f => f.from_id === spaceId);
      if (focus) {
        node.fx = x;
        node.fy = y;
        node.fz = z;
      } else {
        delete node.fx;
        delete node.fy;
        delete node.fz;
      }
      if (!holdRef?.current?.needrehold && focus) {
        focusMethods.focus(node?.link?.id, { x, y, z });
      }
    }

    holdRef.current = {};
  }, [ml]);
  const forceGraph_onNodeClick = useCallback((node) => {
    onNodeClickRef.current(node);
  }, []);
  const forceGraph_onNodeRightClick = useCallback((node) => {
    setSpaceId(node.link?.id);
  }, []);

  useEffect(() => {
    if (typeof(window) === 'object') {
      window['deep'] = deep;
      window['ml'] = ml;
    }
  }, [deep, ml]);

  return <DeepGraphProvider focusLink={focusLink}>
    {[<DeepLoader
      key={spaceId}
      spaceId={spaceId}

      minilinks={minilinks}

      // onUpdateScreenQuery={query => console.log('updateScreenQuery', query)}
    />]}
    <div
      ref={rootRef}
      className={classes.root}
      onMouseUp={(e) => clearTimeout(holdRef.current)}
      onMouseMove={(e) => {
        mouseMove.current = e;
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
        style={{
          zIndex: 'initial',
        }}
        PaperProps={{
          style: { overflow: 'initial' },
        }}
      >
        {!!(flyPanel?.link?.id) && <div style={{ position: 'relative', width: defaultCardWidth }}>
          <LinkCard id={flyPanel?.link?.id} link={flyPanel?.link} ml={ml} graphDataRef={graphDataRef} selectedColumnIndex={-1} selectedLinkIndex={undefined}/>
          <IconButton
            size="small" style={{ position: 'absolute', top: -15, right: 6 }}
            onClick={() => {
              selectedMethods.add(0, flyPanel.link?.id);
              setFlyPanel(null);
            }}
          ><Add/></IconButton>
        </div>}
      </Popover>
      {[<ForceGraph
        fgRef={fgRef}
        key={`${windowSize.width}+${windowSize.height}+${spaceId}`}
        width={windowSize.width}
        height={windowSize.height}

        d3Force={'charge'}
        onDagError={() => {}}

        Component={
          forceGraph == '2d'
          ? ForceGraph2D
          : forceGraph == '3d'
          ? ForceGraph3D
          : ForceGraphVR
        }
        // graphData={spaceId === graphData?.spaceId ? graphData : { nodes: [], links: [] }}
        graphData={{ nodes: [], links: [] }}
        backgroundColor={bgTransparent ? 'transparent' : theme?.palette?.background?.default}
        // linkAutoColorBy={forceGraph_linkAutoColorBy}
        linkOpacity={1}
        linkWidth={0.5}
        linkDirectionalArrowLength={3.5}
        linkDirectionalArrowRelPos={1}
        linkLabel={forceGraph_linkLabel}
        linkCurvature={forceGraph_linkCurvature}
        linkLineDash={forceGraph_linkLineDash}
        nodeCanvasObject={forceGraph_nodeCanvasObject}
        nodeThreeObject={forceGraph != 'vr' ? forceGraph_nodeThreeObject : undefined}
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
        //     ][node.link?.id%7],
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
        //     node?.linkId.toString() === screenFind || !!(_l?.join(' ')?.includes(screenFind))
        //   ) : selectedLinks?.find(id => id === node?.linkId);

        //   const sprite = new SpriteText(_l.join(' '));
        //   sprite.color = isSelected ? '#fff' : '#707070';
        //   sprite.textHeight = 8;
        //   return new Three.Mesh(sprite);
        // }}
        onNodeDrag={forceGraph_onNodeDrag}
        onNodeDragEnd={forceGraph_onNodeDragEnd}
        onNodeClick={forceGraph_onNodeClick}
        onNodeRightClick={forceGraph_onNodeRightClick}
      />]}
      <GUI ml={ml} graphDataRef={graphDataRef}/>
    </div>
  </DeepGraphProvider>;
}

export function PageConnected() {
  const [spaceId, setSpaceId] = useSpaceId();
  const deep = useDeep();
  const [token] = useTokenController();
  const [linkId, setLinkId] = useAuthNode();
  useCheckAuth();
  return <>
    {!!token && [<PageContent key={`${linkId}`}/>]}
  </>
}

export function ConnectionController({ children }: { children: any }) {
  const [connected, setConnected] = useEngineConnected();
  const [bgTransparent] = useBackgroundTransparent();
  const classes = useStyles({ connected, bgTransparent });
  const apolloClient = useApolloClient();
  const deep = useDeep();
  useEffect(() => {
    const interval = setInterval(async () => {
      let isConnected = false;
      try {
        const result = await apolloClient.query({ query: gql`query { links(limit: 1) { id } }` });
        if (result?.data?.links?.[0]) {
          isConnected = true;
        }
      } catch(error) {
        console.log('!connected');
        isConnected = false;
      }
      setConnected((connected) => {
        console.log(`set ${isConnected ? '' : '!'}connected, against: `, connected);
        return isConnected;
      });
    }, 5000);
    return () => {
      return clearInterval(interval);
    };
  }, [apolloClient]);

  return <>
    <div
      className={classes.root}
    >
      {!connected && <Grid container justifyContent="center" alignItems="center" style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100%',
        height: '100%',
      }}>
        <Grid item>
          <PaperPanel flying>
            <EngineWindow/>
            <Typography align='center'><Button disabled>{pckg.version}</Button></Typography>
          </PaperPanel>
        </Grid>
      </Grid>}
      {!!connected && <CatchErrors
        errorRenderer={(error, reset) => {
          return <div style={{ padding: 6, boxSizing: 'border-box' }}><Button variant="outlined" color="secondary" fullWidth onClick={() => console.error(error)}><div style={{ textAlign: 'left' }}>
            <Typography variant='body2'>{String(error)}</Typography>
          </div></Button></div>;
        }}
      >{children}</CatchErrors>} 
    </div>
  </>;
}

export default function Page() {
  return (
    <Provider>
      <ConnectionController>
        {!!process?.browser && <PageConnected/>}
      </ConnectionController>
    </Provider>
  );
}
