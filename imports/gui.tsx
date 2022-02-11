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
import { AuthPanel, useOperation, useSelectedLinks, useSelectedLinksMethods } from '../pages';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { EnginePanel, useEngineConnected } from './engine';
import { LinkCard } from './link-card/index';
import { Button, ButtonGroup, Grid, IconButton, makeStyles, Paper, TextField } from './ui';
import { ScreenFind } from './screen-find';

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

const defaultCardWidth = 300;

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
    overflowX: 'scroll',
    width: defaultCardWidth,
    height: '100%',
    pointerEvents: 'all',
    boxSizing: 'border-box',
    '& > table': {
      display: 'block',
      position: 'absolute',
      top: 0, left: 0,
      height: '100%',
    },
    '& > table > tr > td': {
      padding: theme.spacing(1),
      overflowY: 'scroll',
      maxHeight: '100%',
      minHeight: '100%',
      // position: 'relative',
    },
  }),
  columnPaper: {
    height: '100%',
    width: '100%',
    overflowX: 'scroll',
    padding: theme.spacing(1),
    boxSizing: 'border-box',
  },
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
export function useActiveMethods() {
  const [baseTypes] = useBaseTypes();
  const [spaceId] = useSpaceId();
  const deep = useDeep();
  return useMemo(() => {
    return {
      deactive: async function(id: number) {
        console.log(await deep.delete({ type_id: baseTypes.Active, from_id: spaceId, to_id: id }));
      },
      find: async function(id: number) {
        const q = await deep.select({
          type_id: baseTypes.Active,
          from_id: spaceId,
          to_id: id,
        });
        return q?.data?.[0];
      },
      active: async function(id: number) {
        const active = await this.find(id);
        const { data: [{ id: newId }] } = await deep.insert({
          type_id: baseTypes.Active,
          from_id: spaceId,
          to_id: id,
          in: { data: {
            type_id: baseTypes.Contain,
            from_id: spaceId
          } },
        });
      },
      toggle: async function(id: number) {
        const active = await this.find(id);
        let oldId = active?.id;
        if (!oldId) await this.active(id);
        else await this.deactive(id);
      },
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
  // const [labelsConfig, setLabelsConfig] = useLabelsConfig();
  const [spaceId, setSpaceId] = useSpaceId();

  const [selectedLinks, setSelectedLinks] = useSelectedLinks();
  const selectedMethods = useSelectedLinksMethods();
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
                <Grid item>
                  <Button variant="outlined" onClick={() => setSelectedLinks([])}>clear</Button>
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
                <Grid item>
                  <Button href="http://localhost:3006/gql" target="_blank">gql</Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container spacing={1}>
                <Grid item>
                  <ScreenFind ml={ml}/>
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
                    selectedMethods.add(0, queryId);
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
                      selectedMethods.add(0, newSpaceId);
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
          <table style={{ width: defaultCardWidth * selectedLinks?.length }}>
            <tr>
              {selectedLinks.map((column, index) => {
                return <td style={{ width: defaultCardWidth }}>
                  <PaperPanel className={classes.columnPaper}>
                    <Button style={{ position: 'sticky', top: 0 }} disabled fullWidth size="small">
                      {index}
                    </Button>
                    {column.map((id, linkIndex) => {
                      const link = ml.byId[id];
                      return <LinkCard id={id} link={link} ml={ml} graphDataRef={graphDataRef} selectedColumnIndex={index} selectedLinkIndex={linkIndex}/>;
                    })}
                  </PaperPanel>
                </td>;
              })}
            </tr>
          </table>
          {/* <Grid container spacing={1}>
            {selectedLinks.map((column, index) => {
              return <>{column.map(id => {
                const link = ml.byId[id];
                return <Grid key={id} item xs={12} style={{ position: 'relative' }}>
                  <LinkCard id={id} link={link} ml={ml} graphDataRef={graphDataRef} selectedColumnIndex={index}/>
                </Grid>;
              })}</>;
            })}
          </Grid> */}
        </PaperPanel>
      </div>
    </div>;
};