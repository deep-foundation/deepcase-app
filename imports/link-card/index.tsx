import { DeepClient, GLOBAL_ID_NUMBER, GLOBAL_ID_OBJECT, GLOBAL_ID_STRING, useDeep, useDeepQuery } from '@deep-foundation/deeplinks/imports/client';
import { Packager } from '@deep-foundation/deeplinks/imports/packager';
import { useApolloClient } from '@deep-foundation/react-hasura/use-apollo-client';
import { Clear, LocationOnOutlined as Unfocused, LocationOn as Focused } from '@material-ui/icons';
import { Button, IconButton, TextField } from '@material-ui/core';
import { useDebounceCallback } from '@react-hook/debounce';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useDeepGraph, useSelectedLinks } from '../../pages';
import { deleteBoolExp, insertBoolExp, updateBoolExp } from '../gql';
import { Card, CardActions, CardContent, Divider, Grid, Typography } from '../ui';
import { LinkCardPackage } from './types/package';
import { LinkCardRule } from './types/rule';
import { LinkCardSubject } from './types/subject';
import { LinkCardType } from './types/type';
import json5 from 'json5';
import { MinilinksResult } from '@deep-foundation/deeplinks/imports/minilinks';
import { isString, isNumber, isObject } from 'lodash';
import { useBaseTypes, useFocusMethods } from '../gui';

export function LinkCard({
  ml,
  link,
  closable = true,
  graphDataRef,
}: {
  ml?: MinilinksResult<any>,
  link: any;
  closable?: boolean;
  graphDataRef: any;
}) {
  const client = useApolloClient();
  const deep = useDeep();
  const update = useDebounceCallback((...args: any[]) => deep.update.call(deep, ...args), 1000);

  useEffect(() => {
    if (process.browser) {
      // @ts-ignore
      window.packager = new Packager(new DeepClient({ apolloClient: client }));
      // @ts-ignore
      console.log(window.packager);
    }
  }, []);

  const { focusLink } = useDeepGraph();
  const [selectedLinks, setSelectedLinks] = useSelectedLinks();
  const [baseTypes] = useBaseTypes();
  const focusMethods = useFocusMethods();
  // const focusLinks = useMinilinksFilter(ml, useCallback((ol, nl) => !!(nl.type_id === baseTypes.Focus && nl.to_id === link.id), [baseTypes]));
  // const wq = useDeepQuery(useMemo(() => ({
  //   in: {
  //     type: ['@deep-foundation/core', 'Value'],
  //     from_id: link?.type_id
  //   },
  // }), []));

  // console.log(wq);

  // NeedPackerTypeNaming

  return <Card>
    {!!closable && <>
      {/* <IconButton
      style={{ position: 'absolute', top: 6, right: 36 }}
        onClick={() => {
          // if (focusLinks.length) {
          //   for (let i = 0; i < focusLinks.length; i++) {
          //     const focusLink = focusLinks[i];
          //     focusMethods.unfocus(focusLink.id);
          //   }
          // } else {
          //   const { x, y, z } = graphDataRef?.current?._nodes[link.id] || {};
          //   focusMethods.focus(link.id, { x, y, z });
          // }
        }}
      ><Focused/></IconButton> */}
      <IconButton
        style={{ position: 'absolute', top: 6, right: 6 }}
        onClick={() => setSelectedLinks(selectedLinks.filter(id => id !== link.id))}
      ><Clear/></IconButton>
    </>}
    <CardContent>
      <Typography style={{ display: 'block', cursor: 'pointer' }} onClick={() => ml.byId[link.id] && focusLink(link.id)}>id: {link?.id || 0}: {deep.stringify(link?.value?.value)}</Typography>
      <Typography style={{ display: 'block', cursor: 'pointer' }} onClick={() => ml.byId[link.type_id] && focusLink(link.type_id)} variant="caption">type_id: {link?.type_id || 0}: {deep.stringify(link?.type?.value?.value)}</Typography>
      <Typography style={{ display: 'block', cursor: 'pointer' }} onClick={() => ml.byId[link.from_id] && focusLink(link.from_id)} variant="caption">from_id: {link?.from_id || 0}</Typography>
      <Typography style={{ display: 'block', cursor: 'pointer' }} onClick={() => ml.byId[link.to_id] && focusLink(link.to_id)} variant="caption">to_id: {link?.to_id || 0}</Typography>
    </CardContent>
    <CardActions>
      <Grid container spacing={1}>
        {link?.id === 1 && <Grid item xs={12}>
          <LinkCardType link={link}/>
        </Grid>}
        {!!isString(link?.value?.value) && <Grid item xs={12}>
          <TextField fullWidth variant="outlined" size="small" defaultValue={link?.value?.value} onChange={(e) => update({ id: { _eq: link?.value?.id } }, { value: e.target.value}, { table: 'strings' })}/>
        </Grid>}
        {!!isNumber(link?.value?.value) && <Grid item xs={12}>
          <TextField fullWidth variant="outlined" size="small" defaultValue={link?.value?.value} onChange={(e) => update({ id: { _eq: link?.value?.id } }, { value: e.target.value}, { table: 'numbers' })} type="number"/>
        </Grid>}
        {!!isObject(link?.value?.value) && <Grid item xs={12}>
          <TextField fullWidth variant="outlined" size="small" defaultValue={JSON.stringify(link?.value?.value)} onChange={(e) => {
            let json = {};
            try { json = json5.parse(e.target.value); } catch(error) {}
            update(link?.value?.id, { value: json }, { table: 'objects' });
          }}/>
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
    </CardActions>
  </Card>;
}
