import { useAuthNode, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { MinilinksResult } from '@deep-foundation/deeplinks/imports/minilinks';
import { useLocalStore } from '@deep-foundation/store/local';
import { useQueryStore } from '@deep-foundation/store/query';
import { useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Add, Clear, Colorize, Visibility as VisibilityOn, VisibilityOff, LocationOnOutlined as Unfocused, LocationOn as Focused } from '@material-ui/icons';
import cn from 'classnames';
import React, { useState } from 'react';
import { useMemo } from 'react';
import pckg from '../package.json';
import { AuthPanel, useOperation, useSelectedLinks } from '../pages';
import { EnginePanel, useEngineConnected } from './engine';
import { LinkCard } from './link-card/index';
import { Button, ButtonGroup, Grid, IconButton, makeStyles, Paper, TextField } from './ui';

type StyleProps = { connected: boolean; };
const connectedPosition = (style: any) => ({
  position: 'relative',
  transition: 'all 1s ease',
  ...style,
});

const transitionHoverScale = {
  transition: 'all 0.25s ease',
  transform: 'scale(1)',
  '&:hover': {
    transform: 'scale(1.01)',
  },
};

const useStyles = makeStyles((theme) => ({
  overlay: {
    zIndex: 1, position: 'absolute', top: 0, left: 0,
    width: '100%', height: '100%',
    maxWidth: '100%', maxHeight: '100%',
    display: 'grid',
    gridTemplateRows: 'max-content auto max-content',
    pointerEvents: 'none',
  },
  top: {
    margin: `16px 16px 0 16px`,
    boxSizing: 'border-box',
  },
  topPaper: ({ connected }: StyleProps) => ({
    pointerEvents: 'all',
    boxSizing: 'border-box',
    padding: theme.spacing(1),
    ...connectedPosition({ top: connected ? 0 : -500 }),
  }),
  right: {
    margin: `16px 0 16px 16px`,
    boxSizing: 'border-box',
    position: 'relative',
  },
  rightPaper: ({ connected }: StyleProps) => ({
    ...connectedPosition({ right: connected ? 0 : -1000 }),
    position: 'absolute',
    overflow: 'scroll',
    width: 300,
    height: '100%',
    padding: theme.spacing(1),
    pointerEvents: 'all',
    boxSizing: 'border-box',
  }),
  bottom: {
    width: '100%',
  },
  bottomPaper: ({ connected }: StyleProps) => ({
    width: '100%',
    height: '100%',
    pointerEvents: 'all',
    overflow: 'auto',
    boxSizing: 'border-box',
    ...connectedPosition({ bottom: connected ? 0 : -1000 }),
  }),
  transitionHoverScale,
}));

export function PaperPanel(props: any) {
  const [hover, setHover] = useState(false);
  const classes = useStyles({ connected: false });
  
  return <Paper onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} elevation={hover ? 3 : 1} className={props.flying ? classes.transitionHoverScale : null} {...props}/>;
}

const defaultGraphiqlHeight = 300;

// export function useShowTypes() {
//   return useQueryStore('show-types', false);
// }
// export function useShowMP() {
//   return useQueryStore('show-mp', false);
// }
export function useClickSelect() {
  return useLocalStore('click-select', false);
}
export function useContainer() {
  const [spaceId] = useSpaceId();
  const store = useQueryStore('container', 0);
  return useMemo(() => [store[0] || spaceId, store[1]], [spaceId, store[0]]);
}
// export function useContainerVisible() {
//   return useLocalStore('container-visible', true);
// }
export function useForceGraph() {
  return useQueryStore('force-graph-type', '2d');
}
export function useInserting() {
  return useQueryStore<any>('dc-dg-ins', {});
}
export function useScreenFind() {
  return useQueryStore<any>('screen-find', '');
}
export function useSpaceId() {
  const [linkId] = useAuthNode();
  const store = useQueryStore<any>('space-id', linkId);
  return useMemo(() => [store[0] || linkId, store[1]], [linkId, store[0]]);
}
// export function useLabelsConfig() {
//   return useQueryStore('labels-config', { types: true, contains: false, values: true, focuses: false });
// };
export function useWindowSize() {
  return useLocalStore('window-size', { width: 800, height: 500 });
};
export function useGraphiqlHeight() {
  return useLocalStore('graphiql-height', defaultGraphiqlHeight);
};
export function useBaseTypes() {
  return useLocalStore<any>('base-types', {});
};
export function useBackgroundTransparent() {
  return useQueryStore<any>('bg-transparent', false);
};
export function useFocusMethods() {
  const [baseTypes] = useBaseTypes();
  const [spaceId] = useSpaceId();
  const deep = useDeep();
  return useMemo(() => {
    return {
      unfocus: async (id) => {
        const where = { type_id: baseTypes.Focus, from_id: spaceId, to_id: id };
        await deep.delete(where);
      },
      focus: async (id, value: { x: number; y: number; z: number; }) => {
        const q = await deep.select({
          type_id: baseTypes.Focus,
          from_id: spaceId,
          to_id: id,
        });
        const focus = q?.data?.[0];
        let focusId = focus?.id;
        if (!focusId) {
          const { data: [{ id: newFocusId }] } = await deep.insert({
            type_id: baseTypes.Focus,
            from_id: spaceId,
            to_id: id,
            object: { data: { value } },
            in: { data: {
              type_id: baseTypes.Contain,
              from_id: spaceId
            } },
          });
          focusId = newFocusId;
        } else {
          if (focus.value) {
            await deep.update({
              link_id: { _eq: focusId },
            }, { value }, { table: 'objects' });
          } else {
            await deep.insert({
              link_id: focusId, value,
            }, { table: 'objects' });
          }
        }
      }
    };
  }, []);
};

export function GUI({ ml, graphDataRef }: { ml: MinilinksResult<any>, graphDataRef: any }) {
  const theme: any = useTheme();
  const [windowSize, setWindowSize] = useWindowSize();
  const [graphiqlHeight, setGraphiqlHeight] = useGraphiqlHeight();

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

  const [selectedLinks, setSelectedLinks] = useSelectedLinks();
  const [operation, setOperation] = useOperation();
  const [connected, setConnected] = useEngineConnected();

  const classes = useStyles({ connected });

  const deep = useDeep();

  const isSM = useMediaQuery(theme.breakpoints.down('sm'));

  return <div className={classes.overlay}>
      <div className={classes.top}>
        <PaperPanel className={cn(classes.topPaper, classes.transitionHoverScale)} style={isSM ? { overflowX: 'scroll' } : {}}>
          <Grid container justify="space-between" spacing={1} style={isSM ? { width: '300%' } : {}}>
            <Grid item>
              <Grid container spacing={1}>
                <Grid item>
                  <ButtonGroup variant="outlined">
                    {/* <Button color={showTypes ? 'primary' : 'default'} onClick={() => setShowTypes(!showTypes)}>types</Button>
                    <Button color={showMP ? 'primary' : 'default'} onClick={() => setShowMP(!showMP)}>mp</Button> */}
                    <Button color={clickSelect ? 'primary' : 'default'} onClick={() => setClickSelect(!clickSelect)}>select</Button>
                  </ButtonGroup>
                </Grid>
                {/* <Grid item>
                  <ButtonGroup variant="outlined">
                    <Button color={labelsConfig.types ? 'primary' : 'default'} onClick={() => setLabelsConfig({ ...labelsConfig, types: !labelsConfig.types })}>types</Button>
                    <Button color={labelsConfig.values ? 'primary' : 'default'} onClick={() => setLabelsConfig({ ...labelsConfig, values: !labelsConfig.values })}>values</Button>
                    <Button color={labelsConfig.contains ? 'primary' : 'default'} onClick={() => setLabelsConfig({ ...labelsConfig, contains: !labelsConfig.contains })}>contains</Button>
                    <Button color={labelsConfig.focuses ? 'primary' : 'default'} onClick={() => setLabelsConfig({ ...labelsConfig, focuses: !labelsConfig.focuses })}>focuses</Button>
                  </ButtonGroup>
                </Grid> */}
                <Grid item>
                  <ButtonGroup variant="outlined">
                    <Button color={forceGraph == '2d' ? 'primary' : 'default'} onClick={() => setForceGraph('2d')}>2d</Button>
                    <Button color={forceGraph == '3d' ? 'primary' : 'default'} onClick={() => setForceGraph('3d')}>3d</Button>
                    <Button color={forceGraph == 'vr' ? 'primary' : 'default'} onClick={() => setForceGraph('vr')}>vr</Button>
                  </ButtonGroup>
                </Grid>
                {/* <Grid item>
                  <ButtonGroup variant="outlined">
                    <Button
                      color={operation === 'container' ? 'primary' : 'default'}
                      onClick={() => setOperation(operation === 'container' ? '' : 'container')}
                    >
                      container: {container}
                    </Button>
                    <Button
                      onClick={() => setContainer(0)}
                    ><Clear/></Button>
                    <Button
                      color={containerVisible ? 'primary' : 'default'}
                      onClick={() => setContainerVisible(!containerVisible)}
                    >
                      {containerVisible ? <VisibilityOn/> : <VisibilityOff/>}
                    </Button>
                  </ButtonGroup>
                </Grid> */}
                <Grid item>
                  <ButtonGroup variant="outlined">
                    <Button
                      color={operation === 'pipette' ? 'primary' : 'default'}
                      onClick={() => setOperation(operation === 'pipette' ? '' : 'pipette')}
                    ><Colorize/></Button>
                    <Button
                      onClick={async () => {
                        const { data: [{ id }] } = await deep.insert({
                          from_id: inserting.from || 0,
                          to_id: inserting.to || 0,
                          type_id: inserting.type || 0,
                        });
                        if (container) await deep.insert({
                          from_id: container,
                          to_id: id,
                          type_id: await deep.id('@deep-foundation/core', 'Contain'),
                        });
                      }}
                    ><Add/></Button>
                    <Button
                      style={{ color: '#a83232' }}
                      color={operation === 'from' ? 'primary' : 'default'}
                      onClick={() => setOperation(operation === 'from' ? '' : 'from')}
                      >
                      from: {inserting?.from}
                    </Button>
                    <Button
                      style={{ color: '#32a848' }}
                      color={operation === 'to' ? 'primary' : 'default'}
                      onClick={() => setOperation(operation === 'to' ? '' : 'to')}
                    >
                      to: {inserting?.to}
                    </Button>
                    <Button
                      color={operation === 'type' ? 'primary' : 'default'}
                      onClick={() => setOperation(operation === 'type' ? '' : 'type')}
                    >
                      type: {inserting?.type}
                    </Button>
                    <Button onClick={() => setInserting({})}><Clear/></Button>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <ButtonGroup variant="outlined">
                    <Button
                      color={operation === 'delete' ? 'primary' : 'default'}
                      onClick={() => setOperation(operation === 'delete' ? '' : 'delete')}
                    >delete</Button>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <AuthPanel/>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container spacing={1}>
                <Grid item>
                  <TextField variant="outlined" size="small"
                    value={screenFind}
                    onChange={e => setScreenFind(e.target.value)}
                    placeholder="find..."
                  />
                </Grid>
                <Grid item>
                  <Button disabled>{pckg.version}</Button>
                </Grid>
                <Grid item>
                  <Button variant="outlined" disabled={!spaceId} onClick={async () => {
                    const { data: [{ id: queryId }] } = await deep.insert({
                      type_id: await deep.id('@deep-foundation/core', 'Query'),
                      object: { data: { value: {limit:0} } },
                    });
                    if (container) await deep.insert([{
                      from_id: container,
                      to_id: queryId,
                      type_id: await deep.id('@deep-foundation/core', 'Contain'),
                    }]);
                    setSelectedLinks([...selectedLinks, queryId]);
                  }}><Add/> query</Button>
                </Grid>
                <Grid item>
                  <ButtonGroup variant="outlined">
                    <Button onClick={async () => {
                      const { data: [{ id: newSpaceId }] } = await deep.insert({
                        type_id: await deep.id('@deep-foundation/core', 'Space'),
                      });
                      const { data: [{ id: newContainId }] } = await deep.insert({
                        from_id: spaceId,
                        to_id: newSpaceId,
                        type_id: await deep.id('@deep-foundation/core', 'Contain'),
                        string: { data: { value: '' } },
                      });
                      setSelectedLinks([...selectedLinks, newSpaceId]);
                      setSpaceId(newSpaceId);
                    }}><Add/> space</Button>
                    <Button disabled={spaceId === deep.linkId} onClick={async () => {
                      setSpaceId(deep.linkId);
                    }}>{spaceId} exit</Button>
                  </ButtonGroup>
                </Grid>
                <Grid item>
                  <EnginePanel/>
                </Grid>
              </Grid>
            </Grid>
          </Grid>
        </PaperPanel>
      </div>
      <div className={classes.right}>
        <PaperPanel className={cn(classes.rightPaper, classes.transitionHoverScale)}>
          <Grid container spacing={1}>
            <Grid item xs={12}>
              <Button variant="outlined" fullWidth onClick={() => setSelectedLinks([])}>
                clear
              </Button>
            </Grid>
            <Grid item xs={12}><LinkCard link={{ id: 1, type: 1 }} ml={ml} closable={false} graphDataRef={graphDataRef}/></Grid>
            {selectedLinks.map((id) => {
              const link = ml.byId[id];
              return <Grid key={id} item xs={12} style={{ position: 'relative' }}>
                <LinkCard link={link} ml={ml} graphDataRef={graphDataRef}/>
              </Grid>;
            })}
          </Grid>
        </PaperPanel>
      </div>
    </div>;
};