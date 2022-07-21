import { useAuthNode, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { MinilinksResult } from '@deep-foundation/deeplinks/imports/minilinks';
import { useLocalStore } from '@deep-foundation/store/local';
import { useQueryStore } from '@deep-foundation/store/query';
import { Link, Typography, useMediaQuery } from '@material-ui/core';
import { useTheme } from '@material-ui/core/styles';
import { Add, Clear, Colorize, Visibility as VisibilityOn, VisibilityOff, LocationOnOutlined as Unfocused, LocationOn as Focused } from '@material-ui/icons';
import cn from 'classnames';
import React, { useState } from 'react';
import { useMemo } from 'react';
import pckg from '../package.json';
import { AuthPanel, useDeepGraph, useOperation, useSelectedLinks, useSelectedLinksMethods } from '../pages';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { EnginePanel, useEngineConnected } from './engine';
import { LinkCard } from './link-card/index';
import { Button, ButtonGroup, Grid, IconButton, makeStyles, Paper, TextField } from './ui';
import { ScreenFind } from './screen-find';
import { CatchErrors } from './react-errors';
import { useBaseTypes, useFocusMethods, useSpaceId, useActiveMethods, useInserting, useWindowSize, useGraphiqlHeight, useClickSelect, useContainer, useForceGraph } from './hooks';

const NEXT_PUBLIC_GQL_PATH = process.env.NEXT_PUBLIC_GQL_PATH || 'localhost:3006/gql';
const NEXT_PUBLIC_GQL_SSL = process.env.NEXT_PUBLIC_GQL_SSL || '0';

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

export const defaultLeftWidth = 10;
export const defaultCardWidth = 300;

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
  content: {
    margin: `16px 0 16px 0`,
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
  leftPaper: ({ connected }: StyleProps) => ({
    ...connectedPosition({ left: connected ? 0 : -1000 }),
    position: 'absolute',
    width: defaultLeftWidth,
    height: '100%',
    pointerEvents: 'all',
    boxSizing: 'border-box',
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

export function PaperPanel({
  flying = false,
  ...props
}: {
  flying?: boolean;
  [key: string]: any;
}) {
  const [hover, setHover] = useState(false);
  const classes = useStyles({ connected: false });
  
  return <Paper onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} elevation={hover ? 3 : 1} className={flying ? classes.transitionHoverScale : null} {...props}/>;
}

const defaultGraphiqlHeight = 300;

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
  const { focusLink } = useDeepGraph();

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
                <Grid item>
                  <ButtonGroup variant="outlined">
                    <Button
                      color={operation === 'container' ? 'primary' : 'default'}
                      onClick={() => setOperation(operation === 'container' ? '' : 'container')}
                    >
                      auto contain: {container}
                    </Button>
                    <Button
                      onClick={() => setContainer(0)}
                    ><Clear/></Button>
                  </ButtonGroup>
                </Grid>
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
                        selectedMethods.add(0, id);
                        selectedMethods.scrollTo(0, id);
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
                  <AuthPanel ml={ml}/>
                </Grid>
                <Grid item>
                  <Button href={`http${+NEXT_PUBLIC_GQL_SSL ? 's' : ''}://${NEXT_PUBLIC_GQL_PATH}`} target="_blank">gql</Button>
                </Grid>
              </Grid>
            </Grid>
            <Grid item>
              <Grid container spacing={1}>
                <Grid item>
                  <ScreenFind ml={ml}/>
                </Grid>
                <Grid item>
                  <Button variant="outlined" disabled={!spaceId} onClick={async () => {
                    const { data: [{ id: queryId }] } = await deep.insert({
                      type_id: await deep.id('@deep-foundation/core', 'Query'),
                      object: { data: { value: {} } },
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
                    <Button disabled={!spaceId} onClick={async () => {
                      ml.byId[deep.linkId] && focusLink(deep.linkId);
                      selectedMethods.add(0, deep.linkId);
                      selectedMethods.scrollTo(0, deep.linkId);
                    }}>space: {spaceId}</Button>
                    <Button disabled={spaceId === deep.linkId} onClick={async () => {
                      setSpaceId(deep.linkId);
                    }}>exit</Button>
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
      <div className={classes.content}>
        <PaperPanel className={cn(classes.leftPaper, classes.transitionHoverScale)}>
          <Typography style={{
            position: 'relative',
            writingMode: 'vertical-rl',
            textOrientation: 'mixed',
            right: -30,
            width: '100%'
          }}><Link href="https://github.com/deep-foundation/deepcase/issues/1">notebook</Link> will be here soon...</Typography>
        </PaperPanel>
        <Button style={{
          position: 'absolute',
          bottom: 0, right: defaultCardWidth + 16,
          pointerEvents: 'all',
        }} variant="outlined" onClick={() => setSelectedLinks([])}>clear</Button>
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
                      return <CatchErrors
                        errorRenderer={(error, reset) => {
                          return <div style={{ padding: 6, boxSizing: 'border-box' }}><Button variant="outlined" color="secondary" fullWidth onClick={() => console.error(error)}><div style={{ textAlign: 'left' }}>
                            <Typography variant='body2'>{String(error)}</Typography>
                          </div></Button></div>;
                        }}
                      >
                        <LinkCard id={id} link={link} ml={ml} graphDataRef={graphDataRef} selectedColumnIndex={index} selectedLinkIndex={linkIndex}/>
                      </CatchErrors>;
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
        <div style={{
          position: 'fixed',
          bottom: 10, left: defaultLeftWidth + 8,
        }}>
          <Typography variant="caption" color="primary">{pckg.version}</Typography>
        </div>
      </div>
    </div>;
};