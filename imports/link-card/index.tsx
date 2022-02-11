import { DeepClient, GLOBAL_ID_NUMBER, GLOBAL_ID_OBJECT, GLOBAL_ID_STRING, useDeep, useDeepQuery } from '@deep-foundation/deeplinks/imports/client';
import { Packager } from '@deep-foundation/deeplinks/imports/packager';
import { useApolloClient } from '@deep-foundation/react-hasura/use-apollo-client';
import { Clear, LocationOnOutlined as Unfocused, LocationOn as Focused } from '@material-ui/icons';
import { Button, ButtonGroup, IconButton, InputAdornment, TextField } from '@material-ui/core';
import { useDebounceCallback } from '@react-hook/debounce';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebounce, useDebouncedCallback } from 'use-debounce';
import { useDeepGraph, useSelectedLinks, useSelectedLinksMethods } from '../../pages';
import { deleteBoolExp, insertBoolExp, updateBoolExp } from '../gql';
import { Card, CardActions, CardContent, Divider, Grid, Typography, Dialog } from '../ui';
import { LinkCardPackage } from './types/package';
import { LinkCardRule } from './types/rule';
import { LinkCardSubject } from './types/subject';
import json5 from 'json5';
import { MinilinksResult, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import { isString, isNumber, isObject } from 'lodash';
import { useBaseTypes, useFocusMethods, PaperPanel, useSpaceId, useActiveMethods } from '../gui';
import LineTo from 'react-lineto';
import dynamic from 'next/dynamic';
import CodeIcon from '@material-ui/icons/Code';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });

export function LinkCard({
  ml,
  id,
  link,
  graphDataRef,
  selectedLinkIndex,
  selectedColumnIndex,

  linetoPrefix = '',
}: {
  ml?: MinilinksResult<any>,
  id?: number,
  link: any;
  graphDataRef: any;

  selectedLinkIndex: number;
  selectedColumnIndex: number;

  linetoPrefix?: string;
}) {
  const client = useApolloClient();
  const deep = useDeep();
  const update = useDebounceCallback((...args: any[]) => deep.update.call(deep, ...args), 1000);

  const { focusLink } = useDeepGraph();
  const [selectedLinks, setSelectedLinks] = useSelectedLinks();
  const selectedMethods = useSelectedLinksMethods();
  const [baseTypes] = useBaseTypes();
  const focusMethods = useFocusMethods();
  const activeMethods = useActiveMethods();
  const [spaceId, setSpaceId] = useSpaceId();
  // const focusLinks = useMinilinksFilter(ml, useCallback((ol, nl) => !!(nl.type_id === baseTypes.Focus && nl.to_id === link.id), [baseTypes]));
  // const wq = useDeepQuery(useMemo(() => ({
  //   in: {
  //     type: ['@deep-foundation/core', 'Value'],
  //     from_id: link?.type_id
  //   },
  // }), []));

  // console.log(wq);

  // NeedPackerTypeNaming

  const active = useMinilinksFilter(ml, (l) => l?.type_id === baseTypes?.Activelink, l => link?.inByType?.[baseTypes?.Active]?.find(f => f?.from_id === spaceId));

  const [codeEditor, setCodeEditor] = useState(false);

  const textFieldProps = useMemo(() => ({
    endAdornment: <InputAdornment position="end">
      <IconButton
        onClick={() => setCodeEditor(true)}
      >
        <CodeIcon/>
      </IconButton>
    </InputAdornment>,
  }), []);
  const onChangeObject = useCallback((v) => {
    let json = {};
    try { json = json5.parse(v); } catch(error) {}
    update(link?.value?.id, { value: json }, { table: 'objects' });
  }, []);
  const onChangeObjectTextField = useCallback((e) => onChangeObject(e.target.value), []);
  const onChangeObjectMonacoEditor = useCallback((v, e) => onChangeObject(v), []);

  const [counter, setCounter] = useState(0);

  const names = ml?.byId[id]?.inByType[baseTypes.Contain] || [];

  return <>
    <PaperPanel style={{ padding: 6, marginTop: 10 }} className={`lineto${linetoPrefix}-${selectedColumnIndex}-${id}`}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Grid container spacing={1} justifyContent="space-between" style={{
            overflow: 'hidden', position: 'relative',
            top: -10,
            marginBottom: -15,
          }}>
            <Grid item>
              <Button disabled size="small">

              </Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" size="small" color={active ? 'primary' : 'default'} onClick={() => activeMethods.toggle(link.id)}>active</Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" size="small" onClick={() => {
                selectedMethods.remove(selectedColumnIndex, link?.id, selectedLinkIndex);
              }}>close</Button>
            </Grid>
          </Grid>
        </Grid>
        <Grid item xs={6}>
          <Button disabled={!link?.id} fullWidth variant="outlined" size="small" onClick={() => ml.byId[link.id] && focusLink(link.id)}>id: {link?.id || 0}</Button>
          <ButtonGroup variant="outlined" size="small" fullWidth>
            <Button disabled={!link?.type_id} onClick={() => {
              ml.byId[link.type_id] && focusLink(link.type_id);
            }}><div>
              <div>type: {link?.type_id || 0}</div>
              <Typography variant="caption" color="primary">{link?.type?.value?.value}</Typography>
            </div></Button>
            <Button style={{ width: 0 }} disabled={!link?.type_id} onClick={() => {
              ml.byId[link.type_id] && focusLink(link.type_id);
              selectedMethods.add(selectedColumnIndex + 1, link.type_id);
              selectedMethods.scrollTo(selectedColumnIndex + 1, link.type_id);
            }}>
              {`=`}
            </Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={6}>
          <Button disabled fullWidth size="small">contains</Button>
          {names.map(name => <Button fullWidth variant="outlined" size="small" onClick={() => {
            ml.byId[name?.id] && focusLink(name?.id);
            selectedMethods.add(selectedColumnIndex + 1, name?.id);
            selectedMethods.scrollTo(selectedColumnIndex + 1, name?.id);
          }}>{name?.value?.value || name?.id}</Button>)}
        </Grid>
        <Grid item xs={6}>
          <ButtonGroup variant="outlined" size="small" fullWidth>
            <Button style={{ width: 0 }} disabled={!link?.from_id} onClick={() => {
              ml.byId[link.from_id] && focusLink(link.from_id);
              selectedMethods.add(selectedColumnIndex + 1, link.from_id);
              selectedMethods.scrollTo(selectedColumnIndex + 1, link.from_id);
            }}>
              {`<`}
            </Button>
            <Button disabled={!link?.from_id} onClick={() => {
              ml.byId[link.from_id] && focusLink(link.from_id);
            }}><div>
              <div>from: {link?.from_id || 0}</div>
              <Typography variant="caption" color="primary">{link?.from?.type?.value?.value}</Typography>
            </div></Button>
          </ButtonGroup>
        </Grid>
        <Grid item xs={6}>
          <ButtonGroup variant="outlined" size="small" fullWidth>
            <Button disabled={!link?.to_id} onClick={() => ml.byId[link.to_id] && focusLink(link.to_id)}><div>
              <div>to: {link?.to_id || 0}</div>
              <Typography variant="caption" color="primary">{link?.to?.type?.value?.value}</Typography>
            </div></Button>
            <Button style={{ width: 0 }} disabled={!link?.to_id} onClick={() => {
              ml.byId[link.to_id] && focusLink(link.to_id);
              selectedMethods.add(selectedColumnIndex + 1, link.to_id);
              selectedMethods.scrollTo(selectedColumnIndex + 1, link.to_id);
            }}>
              {`>`}
            </Button>
          </ButtonGroup>
        </Grid>
        {!!isString(link?.value?.value) && <Grid item xs={12}>
          {[<TextField key={counter}
            fullWidth variant="outlined" size="small" defaultValue={link?.value?.value} onChange={(e) => {
              update({ id: { _eq: link?.value?.id } }, { value: e.target.value}, { table: 'strings' });
            }}
            InputProps={textFieldProps}
          />]}
          <Dialog
            open={codeEditor}
            onClose={() => {
              setCodeEditor(false);
              setCounter(counter => counter + 1);
            }}
          >
            <MonacoEditor
              height="80vh"
              width="90vw"
              theme="vs-dark"
              defaultLanguage="javascript"
              defaultValue={link?.value?.value}
            />
          </Dialog>
        </Grid>}
        {!!isNumber(link?.value?.value) && <Grid item xs={12}>
          {[<TextField key={counter} fullWidth variant="outlined" size="small" defaultValue={link?.value?.value} onChange={(e) => {
            update({ id: { _eq: link?.value?.id } }, { value: e.target.value}, { table: 'numbers' });
          }} type="number"/>]}
        </Grid>}
        {!!isObject(link?.value?.value) && <Grid item xs={12}>
          {[<TextField key={counter}
            fullWidth variant="outlined" size="small" defaultValue={json5.stringify(link?.value?.value, null, 2)}
            onChange={onChangeObjectTextField}
            InputProps={textFieldProps}
          />]}
          <Dialog
            open={codeEditor}
            onClose={() => {
              setCodeEditor(false);
              setCounter(counter => counter + 1);
            }}
          >
            <MonacoEditor
              height="80vh"
              width="90vw"
              theme="vs-dark"
              defaultLanguage="javascript"
              defaultValue={json5.stringify(link?.value?.value, null, 2)}
              onChange={onChangeObjectMonacoEditor}
            />
          </Dialog>
        </Grid>}
        {!link?.value && <Grid item xs={12}>
          <Button
            fullWidth variant="outlined"
            onClick={async () => {
              const { data: [{ id }] } = await deep.select({
                in: {
                  type: ['@deep-foundation/core', 'Value'],
                  from_id: link?.type_id
                },
              });
              const table = (
                GLOBAL_ID_STRING === id
                ? 'strings'
                : GLOBAL_ID_NUMBER === id
                ? 'numbers'
                : GLOBAL_ID_OBJECT === id
                ? 'objects'
                : ''
              );
              if (table) {
                await deep.insert({
                  link_id: link?.id
                }, {
                  table
                });
              }
            }}
          >+value</Button>
        </Grid>}
      </Grid>
    </PaperPanel>
  </>;
}
