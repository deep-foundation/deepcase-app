import { DeepClient, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Packager } from '@deep-foundation/deeplinks/imports/packager';
import { useApolloClient } from '@deep-foundation/react-hasura/use-apollo-client';
import { TextField } from '@material-ui/core';
import { useDebounceCallback } from '@react-hook/debounce';
import React, { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { useDeepGraph } from '../../pages';
import { deleteBoolExp, insertBoolExp, updateBoolExp } from '../gql';
import { Card, CardActions, CardContent, Divider, Grid, Typography } from '../ui';
import { LinkCardPackage } from './types/package';
import { LinkCardRule } from './types/rule';
import { LinkCardSubject } from './types/subject';
import { LinkCardType } from './types/type';
import json5 from 'json5';
import { MinilinksResult } from '@deep-foundation/deeplinks/imports/minilinks';

export function LinkCard({
  ml,
  link,
}: {
  ml?: MinilinksResult<any>,
  link: any;
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

  // NeedPackerTypeNaming

  return <Card>
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
        {!!link?.string && <Grid item xs={12}>
          <TextField fullWidth variant="outlined" size="small" defaultValue={link?.string?.value} onChange={(e) => update({ id: { _eq: link?.string?.id } }, { value: e.target.value}, { table: 'strings' })}/>
        </Grid>}
        {!!link?.number && <Grid item xs={12}>
          <TextField fullWidth variant="outlined" size="small" defaultValue={link?.number?.value} onChange={(e) => update({ id: { _eq: link?.number?.id } }, { value: e.target.value}, { table: 'numbers' })} type="number"/>
        </Grid>}
        {!!link?.object && <Grid item xs={12}>
          <TextField fullWidth variant="outlined" size="small" defaultValue={JSON.stringify(link?.object?.value)} onChange={(e) => {
            let json = {};
            try { json = json5.parse(e.target.value); } catch(error) {}
            update(link?.object?.id, { value: json }, { table: 'objects' });
          }}/>
        </Grid>}
      </Grid>
    </CardActions>
  </Card>;
}
