import { DeepClient, GLOBAL_ID_NUMBER, GLOBAL_ID_OBJECT, GLOBAL_ID_STRING, useDeep, useDeepQuery } from '@deep-foundation/deeplinks/imports/client';
import { Packager } from '@deep-foundation/deeplinks/imports/packager';
import { useApolloClient } from '@deep-foundation/react-hasura/use-apollo-client';
import { Clear, LocationOnOutlined as Unfocused, LocationOn as Focused } from '@material-ui/icons';
import { Button, ButtonGroup, IconButton, InputAdornment, Link as MuiLink, TextField } from '@material-ui/core';
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
import { Link, MinilinksResult, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import { isString, isNumber, isObject } from 'lodash';
import { useBaseTypes, useFocusMethods, PaperPanel, useSpaceId, useActiveMethods, useInserting } from '../gui';
import LineTo from 'react-lineto';
import dynamic from 'next/dynamic';
import CodeIcon from '@material-ui/icons/Code';
import { Alert } from '@material-ui/lab';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });

const monacoEditorOptions = {
  wordWrap: true,
}

export function LinkCardCode({
  open, onClose, link, onChange, ml,
}: {
  open: boolean;
  onClose: () => void;
  link: Link<number>;
  onChange: (code: string, ...props) => void;
  ml: MinilinksResult<Link<number>>;
}) {
  const deep = useDeep();
  const [baseTypes] = useBaseTypes();

  // const Handler = useMinilinksFilter(ml, (l) => false, (l) => ml.links.find(l => l?.));
  // const handlers = useMinilinksFilter(ml, (l) => true, (l) => (link.in));
  // console.log('handlers', handlers);

  function handleEditorDidMount(editor, monaco) {
    editor.getModel().updateOptions({ tabSize: 2 });
  }

  return <Dialog
    fullWidth
    maxWidth={'md'}
    open={open}
    onClose={onClose}
    PaperProps={{
      style: {
        overflow: 'initial',
      },
    }}
  >
    <Grid container>
      <Grid item xs={12}>
        <Typography style={{
          position: 'absolute',
          left: 0, top: -32
        }}>opened tabs will be here soon...</Typography>
        <Typography style={{
          position: 'absolute',
          left: 0, bottom: -32
        }}>in next versions we try to support vsc ecosystem here</Typography>
        <Typography style={{
          position: 'absolute',
          writingMode: 'vertical-rl',
          textOrientation: 'mixed',
          right: -30,
          width: '100%'
        }}><MuiLink href="https://github.com/deep-foundation/deepcase/issues/17">activities</MuiLink> will be here soon...</Typography>
        <MonacoEditor
          options={monacoEditorOptions}
          height="80vh"
          width="100%"
          theme="vs-dark"
          defaultLanguage="javascript"
          defaultValue={deep.stringify(link?.value?.value)}
          onChange={onChange}
          onMount={handleEditorDidMount}
        />
      </Grid>
    </Grid>
  </Dialog>
}

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
  id: number,
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
  const [inserting, setInserting] = useInserting();
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
    console.log('onChangeObject', id, v);
    let json = {};
    try { json = json5.parse(v); } catch(error) {}
    update({ link_id: { _eq: id } }, { value: json }, { table: 'objects' });
  }, []);
  const onChangeObjectTextField = useCallback((e) => onChangeObject(e.target.value), []);
  const onChangeObjectMonacoEditor = useCallback((v, e) => onChangeObject(v), []);

  const onChangeString = useCallback((v) => {
    console.log('onChangeString', id, v);
    update({ link_id: { _eq: id } }, { value: v }, { table: 'strings' });
  }, []);
  const onChangeStringTextField = useCallback((e) => onChangeString(e.target.value), []);
  const onChangeStringMonacoEditor = useCallback((v, e) => onChangeString(v), []);

  const onChangeNumber = useCallback((v) => {
    console.log('onChangeNumber', id, v);
    update({ link_id: { _eq: id } }, { value: v }, { table: 'numbers' });
  }, []);
  const onChangeNumberTextField = useCallback((e) => onChangeNumber(e.target.value), []);
  const onChangeNumberMonacoEditor = useCallback((v, e) => onChangeNumber(v), []);

  const [counter, setCounter] = useState(0);

  const names = ml?.byId[id]?.inByType[baseTypes.Contain] || [];

  return <>
    <PaperPanel style={{
      padding: 6,
      // marginBottom: -15,
    }}>
      <Grid container spacing={1}>
        <Grid item xs={12}>
          <Grid container spacing={1} justifyContent="space-between" style={{
            overflow: 'hidden', position: 'relative',
            // top: -10,
          }}>
            <Grid item>
              <Button disabled={!link} variant="outlined" size="small" color={inserting?.type === link?.id ? 'primary' : 'default'} onClick={() => {
                setInserting({ ...inserting, type: link?.id });
              }}>use as type</Button>
            </Grid>
            <Grid item>
              <Button disabled={!link} variant="outlined" size="small" color={active ? 'primary' : 'default'} onClick={() => activeMethods.toggle(link.id)}>active</Button>
            </Grid>
            <Grid item>
              <Button variant="outlined" size="small" onClick={() => {
                selectedMethods.remove(selectedColumnIndex, id, selectedLinkIndex);
              }}>close</Button>
            </Grid>
          </Grid>
        </Grid>
        {!link && <Grid item xs={12}>
          <Alert severity="info">
            link {id} is deleted or unselectable
          </Alert>
          {/* <Button variant="outlined" color="secondary" style={{ pointerEvents: 'none' }}>
            deleted or unselectable
          </Button> */}
        </Grid>}
        {!!link && <>
          <Grid item xs={6}>
            <ButtonGroup variant="outlined" size="small" fullWidth>
              <Button disabled={!link?.id} fullWidth variant="outlined" size="small" onClick={() => ml.byId[link.id] && focusLink(link.id)}>id: {id}</Button>
              <Button disabled={!link} style={{ width: 0 }} color="secondary" onClick={() => {
                deep.delete({ id: link?.id });
              }}>
                {`x`}
              </Button>
            </ButtonGroup>
            <ButtonGroup variant="outlined" size="small" fullWidth>
              <Button disabled={!link?.type_id} onClick={() => {
                ml.byId[link.type_id] && focusLink(link.type_id);
              }}><div>
                <div>type: {link?.type_id || 0}</div>
                <Typography variant="caption" color="primary">{deep.stringify(link?.type?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value)}</Typography>
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
            {names.map(name => {
              const nameString = deep.stringify(name?.value?.value);
              return <Button fullWidth variant="outlined" size="small" onClick={() => {
                ml.byId[name?.id] && focusLink(name?.id);
                selectedMethods.add(selectedColumnIndex + 1, name?.id);
                selectedMethods.scrollTo(selectedColumnIndex + 1, name?.id);
              }}>{nameString || name?.id}</Button>;
            })}
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
                <Typography variant="caption" color="primary">{deep.stringify(link?.from?.type?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value)}</Typography>
              </div></Button>
            </ButtonGroup>
          </Grid>
          <Grid item xs={6}>
            <ButtonGroup variant="outlined" size="small" fullWidth>
              <Button disabled={!link?.to_id} onClick={() => ml.byId[link.to_id] && focusLink(link.to_id)}><div>
                <div>to: {link?.to_id || 0}</div>
                <Typography variant="caption" color="primary">{deep.stringify(link?.to?.type?.inByType?.[baseTypes?.Contain]?.[0]?.value?.value)}</Typography>
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
        </>}
        {!!link && <>
          {!!isString(link?.value?.value) && <Grid item xs={12}>
            {[<TextField key={counter}
              fullWidth variant="outlined" size="small" defaultValue={deep.stringify(link?.value?.value)}
              InputProps={textFieldProps}
              onChange={onChangeStringTextField}
            />]}
            <LinkCardCode
              open={!!codeEditor}
              onClose={() => setCodeEditor(false)}
              link={link}
              onChange={onChangeStringMonacoEditor}
              ml={ml}
            />
          </Grid>}
          {!!isNumber(link?.value?.value) && <Grid item xs={12}>
            {[<TextField key={counter} fullWidth variant="outlined" size="small" defaultValue={link?.value?.value}
              type="number"
              onChange={onChangeNumberTextField}
            />]}
          </Grid>}
          {!!isObject(link?.value?.value) && <Grid item xs={12}>
            {[<TextField key={counter}
              fullWidth variant="outlined" size="small" defaultValue={json5.stringify(link?.value?.value, null, 2)}
              InputProps={textFieldProps}
              onChange={onChangeObjectTextField}
            />]}
            <LinkCardCode
              open={!!codeEditor}
              onClose={() => setCodeEditor(false)}
              link={link}
              onChange={onChangeObjectMonacoEditor}
              ml={ml}
            />
          </Grid>}
          {!link?.value && <Grid item xs={12}>
            <Button
              fullWidth variant="outlined"
              onClick={async () => {
                const { data: [{ id }] } = await deep.select({
                  in: {
                    type_id: await deep.id('@deep-foundation/core', 'Value'),
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
                const value = (
                  GLOBAL_ID_STRING === id
                  ? ''
                  : GLOBAL_ID_NUMBER === id
                  ? 0
                  : GLOBAL_ID_OBJECT === id
                  ? {}
                  : ''
                );
                if (table) {
                  await deep.insert({
                    link_id: link?.id,
                    value
                  }, {
                    table
                  });
                }
              }}
            >+value</Button>
          </Grid>}
        </>}
      </Grid>
    </PaperPanel>
  </>;
}
