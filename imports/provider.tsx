import { TokenProvider, useTokenController } from '@deep-foundation/deeplinks/imports/react-token';
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';
import { LocalStoreProvider } from '@deep-foundation/store/local';
import { QueryStoreProvider } from '@deep-foundation/store/query';
import { useLocalStore } from "@deep-foundation/store/local";
import { ChakraProvider } from '@chakra-ui/react';
import themeChakra from './theme/theme';
import { useMemo, useState } from 'react';

export function ProviderConnected({
  children,
}: {
  children: JSX.Element;
}) {
  const [token, setToken] = useTokenController();

  return <>{children}</>;
}

export const NEXT_PUBLIC_GQL_PATH = process.env.NEXT_PUBLIC_GQL_PATH;
export const NEXT_PUBLIC_GQL_SSL = !!+process.env.NEXT_PUBLIC_GQL_SSL;

export function Provider({
  children,
}: {
  children: JSX.Element;
}) {
  const ThemeProviderCustom = ChakraProvider;
  const themeCustom = themeChakra;


  return (
    // <Analitics
    //   yandexMetrikaAccounts={[84726091]}
    //   googleAnalyticsAccounts={['G-DC5RRWLRNV']}
    // >
      <ThemeProviderCustom theme={themeCustom}>
        <QueryStoreProvider>
          <LocalStoreProvider>
            <_Provider children={children} />
          </LocalStoreProvider>
        </QueryStoreProvider>
      </ThemeProviderCustom>
    // </Analitics>
  )
};

function _Provider({
  children,
}){
  const [activeDeep, setActiveDeep] = useLocalStore('activeDeep', { gqlPath: '', gqlSsl: '' });
  return (
      <TokenProvider>
        <ApolloClientTokenizedProvider options={useMemo(() => ({ client: 'deeplinks-app', path: activeDeep.gqlPath ? activeDeep.gqlPath : NEXT_PUBLIC_GQL_PATH, ssl: activeDeep.gqlSsl ? activeDeep.gqlSsl : NEXT_PUBLIC_GQL_SSL, ws: !!process?.browser }), [activeDeep.gqlPath, activeDeep.gqlSsl])}>
          <ProviderConnected>
            {children}
          </ProviderConnected>
        </ApolloClientTokenizedProvider>
      </TokenProvider>
  );
};