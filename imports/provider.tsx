import { TokenProvider, useTokenController } from '@deep-foundation/deeplinks/imports/react-token';
import { ApolloClientTokenizedProvider } from '@deep-foundation/react-hasura/apollo-client-tokenized-provider';
import { LocalStoreProvider } from '@deep-foundation/store/local';
import { QueryStoreProvider } from '@deep-foundation/store/query';
import { colors, createTheme, ThemeProvider } from './ui';
import React, { useEffect } from 'react';
import { Analitics } from './analitics';

import { ChakraProvider } from './framework'
import themeChakra from './theme/theme';

const temp = createTheme({});
const { breakpoints } = temp;

export const theme = createTheme({
  typography: {
    fontFamily: ['Comfortaa', 'sans-serif'].join(','),
  },
  palette: {
    type: 'dark',
    background: {
      default: '#111720',
      paper: '#00000030',
    },
    primary: colors.lightBlue,
    secondary: colors.red,
  },
  shape: {
    borderRadius: 0,
  },
  overrides: {
    MuiButton: {
      label: {
        textTransform: 'none',
      },
    },
    MuiPaper: {
      elevation1: {
        border: '1px dashed #ffffff40',
      },
      elevation2: {
        border: '1px dashed #ffffff60',
      },
      elevation3: {
        border: '1px dashed #ffffff80',
      },
      elevation4: {
        border: '1px dashed #ffffff100',
      },
    },
    MuiOutlinedInput: {
      inputMarginDense: {
        paddingTop: 8,
        paddingBottom: 8,
      },
    }
  },
  shadows: ['none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none','none'],
});

export function ProviderConnected({
  children,
}: {
  children: JSX.Element;
}) {
  const [token, setToken] = useTokenController();

  return <>{children}</>;
}

export const GRAPHQL_PATH = process.env.NEXT_PUBLIC_GQL_PATH;
export const GRAPHQL_SSL = !!+process.env.NEXT_PUBLIC_GQL_SSL;

export function Provider({
  children,
  chakra=false,
}: {
  children: JSX.Element;
  chakra?: boolean;
}) {
  const ThemeProviderCustom = chakra ? ChakraProvider : ThemeProvider;
  const themeCustom = chakra ? themeChakra : theme;
  return (
    <Analitics
      yandexMetrikaAccounts={[84726091]}
      googleAnalyticsAccounts={['G-DC5RRWLRNV']}
    >
      <ThemeProviderCustom theme={themeCustom}>
        <QueryStoreProvider>
          <LocalStoreProvider>
            <TokenProvider>
              <ApolloClientTokenizedProvider options={{ client: 'deeplinks-app', path: GRAPHQL_PATH, ssl: GRAPHQL_SSL, ws: !!process?.browser }}>
                <ProviderConnected>
                  {children}
                </ProviderConnected>
              </ApolloClientTokenizedProvider>
            </TokenProvider>
          </LocalStoreProvider>
        </QueryStoreProvider>
      </ThemeProviderCustom>
    </Analitics>
  )
};
