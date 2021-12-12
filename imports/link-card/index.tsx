import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { Packager } from '@deep-foundation/deeplinks/imports/packager';
import { useApolloClient } from '@deep-foundation/react-hasura/use-apollo-client';
import React, { useCallback, useEffect, useState } from 'react';
import { useDebouncedCallback } from 'use-debounce';
import { deleteBoolExp, insertBoolExp, updateBoolExp } from '../gql';
import { Card, CardActions, CardContent, Divider, Grid, Typography } from '../ui';
import { LinkCardPackage } from './types/package';
import { LinkCardRule } from './types/rule';
import { LinkCardSubject } from './types/subject';
import { LinkCardType } from './types/type';


export function LinkCard({
  link,
}: {
  link: any;
}) {
  const client = useApolloClient();
  const insertBoolExpD = useCallback(async () => (
    await client.mutate(insertBoolExp(link.id, ''))
  ), [link]);
  const updateBoolExpD = useDebouncedCallback(async (value) => (
    await client.mutate(updateBoolExp(link.bool_exp.id, value))
  ), 1000);
  const deleteBoolExpD = useCallback(async () => (
    await client.mutate(deleteBoolExp(link.bool_exp.id))
  ), [link?.bool_exp?.id]);

  const [valueInserted, setValueInserted] = useState(false);

  useEffect(() => {
    if (process.browser) {
      // @ts-ignore
      window.packager = new Packager(new DeepClient({ apolloClient: client }));
      // @ts-ignore
      console.log(window.packager);
    }
  }, []);

  // NeedPackerTypeNaming

  return <Card>
    <CardContent>
      <Typography>{link?.id} {link?.type?.string?.value}</Typography>
    </CardContent>
    <CardActions>
      <Grid container spacing={1}>
        {link?.id === 1 && <Grid item xs={12}>
          <LinkCardType link={link}/>
        </Grid>}
        {link?.type_id === 14 && <Grid item xs={12}>
          <LinkCardSubject link={link}/>
        </Grid>}
        {link?.type_id === 9 && <Grid item xs={12}>
          <LinkCardRule link={link}/>
        </Grid>}
        {link?.type?.value?.value === 'Package' && <Grid item xs={12}>
          <LinkCardPackage link={link}/>
        </Grid>}
        <Grid item xs={12}>
          <Divider/>
        </Grid>
      </Grid>
    </CardActions>
  </Card>;
}
