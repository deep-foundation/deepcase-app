import { TokenProvider, useTokenController } from '@deep-foundation/deeplinks/imports/react-token';
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';
import { LocalStoreProvider } from '@deep-foundation/store/local';
import { QueryStoreProvider } from '@deep-foundation/store/query';

import { ChakraProvider } from '@chakra-ui/react';
import themeChakra from './theme/theme';
import { useMemo } from 'react';

export function ProviderConnected({
  children,
}: {
  children: JSX.Element;
}) {
  const [token, setToken] = useTokenController();

  return <>{children}</>;
}

export function Provider({
  gqlPath,
  gqlSsl,
  children,
}: {
  gqlPath?: string;
  gqlSsl?: boolean;
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
            <TokenProvider>
              <ApolloClientTokenizedProvider options={useMemo(() => ({ client: 'deeplinks-app', path: gqlPath, ssl: gqlSsl, ws: !!process?.browser }), [gqlPath, gqlSsl])}>
                <ProviderConnected>
                  {children}
                </ProviderConnected>
              </ApolloClientTokenizedProvider>
            </TokenProvider>
          </LocalStoreProvider>
        </QueryStoreProvider>
      </ThemeProviderCustom>
    // </Analitics>
  )
};
