import { generateSerial, insertMutation } from '@deep-foundation/deeplinks/imports/gql';
import { Packager } from '@deep-foundation/deeplinks/imports/packager';
import { useApolloClient } from '@deep-foundation/react-hasura/use-apollo-client';
import React, { useEffect } from 'react';
import { useSelectedLinks } from '../../../pages';
import { Button, Grid } from '../../ui';

export function LinkCardPackage({
  link,
}: {
  link: any;
}) {
  const client = useApolloClient();
  const [selectedLinks, setSelectedLinks] = useSelectedLinks();

  return <>
    <Grid container spacing={1}>
    </Grid>
  </>;
}
