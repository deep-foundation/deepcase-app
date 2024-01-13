
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AutoGuest } from '@deep-foundation/deepcase/imports/auto-guest';
import { ColorModeSwitcher } from '@deep-foundation/deepcase/imports/color-mode-toggle';
import { Switch } from '@deep-foundation/deepcase/imports/switch-mode';
import CytoGraph from '@deep-foundation/deepcase/imports/cyto/graph';
import { AframeGraph } from '@deep-foundation/deepcase/imports/aframe/aframe-graph';
import { useBreadcrumbs, useCytoViewport, useRefAutofill, useShowExtra, useSpaceId, useTraveler } from '@deep-foundation/deepcase/imports/hooks';
import { DeepLoader } from '@deep-foundation/deepcase/imports/loader';
import { Provider } from '@deep-foundation/deepcase/imports/provider';
import { useRefstarter } from '@deep-foundation/deepcase/imports/refstater';
import { Connector, parseUrl } from '@deep-foundation/deepcase/imports/connector/connector';
import { PackagerInterface } from '@deep-foundation/deepcase/imports/packager-interface/packager-interface';
import getConfig from 'next/config'
import { CatchErrors } from '@deep-foundation/deepcase/imports/react-errors';
import { Box, Button, Text } from '@chakra-ui/react';
import pckg from '../package.json';
import dpckg from '@deep-foundation/deepcase/package.json';
import { CytoEditor } from '@deep-foundation/deepcase/imports/cyto/editor';
import SigningClientProvider from '@deep-foundation/deeplinks/imports/cyber/signerClient'
import SdkQueryClientProvider from '@deep-foundation/deeplinks/imports/cyber/queryClient'
import NetworksProvider from '@deep-foundation/deeplinks/imports/cyber/network'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';

const { publicRuntimeConfig } = getConfig();

// const CytoGraph = dynamic<CytoGraphProps>(
//   () => import('@deep-foundation/deepcase/imports/cyto/graph').then((m) => m.default),
//   { ssr: false }
// );
const CytoMenu = dynamic<any>(
  () => import('@deep-foundation/deepcase/imports/cyto/menu').then((m) => m.CytoMenu),
  { ssr: false }
);

export function Content({
  openPortal,
  gqlPath,
  gqlSsl,
  appVersion,
}: {
  openPortal?: () => any;
  gqlPath: string;
  gqlSsl: boolean;
  appVersion: string;
}) {
  const cytoViewportRef = useRefstarter<{ pan: { x: number; y: number; }; zoom: number }>();
  const cyRef = useRef();
  const [spaceId, setSpaceId] = useSpaceId();
  const [traveler, setTraveler] = useTraveler();
  const deep = useDeep();
  const globalAny: any = global;
  globalAny.deep = deep;
  globalAny.ml = deep.minilinks;
  const [extra, setExtra] = useShowExtra();
  const [breadcrumbs, setBreadcrumbs] = useBreadcrumbs();
  const travelerRef = useRefAutofill(traveler);

  const TravelerRef = useRef(0);
  useEffect(() => {
    (async () => {
      TravelerRef.current = await deep.id('@deep-foundation/deepcase', 'Traveler');
    })();
  }, []);

  const links: Link[] = useMinilinksFilter(
    deep.minilinks,
    useCallback((l) => true, []),
    useCallback((l, ml) => {
      const Traveler = TravelerRef.current;
      const traveler = travelerRef.current;
      let result = (
        extra
          ? ml.links
          : ml.links.filter(l => (
            !!l._applies.find((a: string) => !!~a.indexOf('query-') || a === 'space' || a === 'breadcrumbs' || a === 'not-loaded-ends')
          ))
      )
      if (Traveler && !traveler) {
        result = result.filter(l => (
          !(l.type_id === Traveler) // Traveler
          &&
          !(l.type_id === deep.idLocal('@deep-foundation/core', 'Contain') && l?.to?.type_id === Traveler) // Traveler Contain
          &&
          !(l.inByType?.[Traveler]?.length) // Traveler Query
          &&
          !(l.type_id === deep.idLocal('@deep-foundation/core', 'Contain') && l?.to?.inByType?.[Traveler]?.length) // Traveler Query Contain
          &&
          !(l.type_id === deep.idLocal('@deep-foundation/core', 'Active') && l?.to?.inByType?.[Traveler]?.length) // Traveler Query Active
          &&
          !(l.type_id === deep.idLocal('@deep-foundation/core', 'Contain') && l?.to?.type_id === deep.idLocal('@deep-foundation/core', 'Active') && l?.to?.to?.inByType?.[Traveler]?.length) // Traveler Query Active Contain
        ));
      }
      return result;
    }, [deep, extra, breadcrumbs, traveler]),
    1000,
  ) || [];

  return (<React.Fragment
    key={`${spaceId}-${deep.linkId}`}
  >
    <DeepLoader
      spaceId={spaceId}
    />
    <CytoGraph gqlPath={gqlPath} gqlSsl={gqlSsl} links={links} cyRef={cyRef} cytoViewportRef={cytoViewportRef} useCytoViewport={useCytoViewport}>
      <CytoEditor />
      <Text position="fixed" left={0} bottom={0} p={4}>
        {appVersion} ({dpckg.version})
      </Text>
    </CytoGraph>
    <CytoMenu gqlPath={gqlPath} gqlSsl={gqlSsl} cyRef={cyRef} cytoViewportRef={cytoViewportRef} openPortal={openPortal} />
    <Switch />
    <PackagerInterface />
  </React.Fragment>);
};

export default function Page({
  serverUrl,
  deeplinksUrl,
  defaultGqlPath,
  defaultGqlSsl,
  appVersion,
  disableConnector
}: {
  defaultGqlPath: string;
  defaultGqlSsl: boolean;
  serverUrl: string;
  deeplinksUrl: string;
  appVersion: string;
  disableConnector: boolean;
}) {
  // todo: put gqlPath and gqlSsl to localstorage so client handler page can use settings from connector
  const [gqlPath, setGqlPath] = useState(defaultGqlPath);
  const [gqlSsl, setGqlSsl] = useState(defaultGqlSsl);
  const [portal, setPortal] = useState(true);

  const key = `${gqlSsl}-${gqlPath}`;

  useEffect(() => {
    if (!disableConnector) {
      return;
    }
    if (typeof window !== 'undefined') {
      const browserURI = window?.location?.origin;
      if (browserURI) {
        const [browserPath, browserSsl] = parseUrl(browserURI);
        setGqlPath(browserPath + "/api/gql");
        setGqlSsl(browserSsl);
      }
    }
  }, []);

  console.log("index-page-urls", {
    gqlPath,
    gqlSsl
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        // staleTime: 60 * 1000,
      },
    },
  });


  return (<>
    {[
      <Provider key={key} gqlPath={gqlPath} gqlSsl={gqlSsl}>
        <NetworksProvider>
          <QueryClientProvider client={queryClient}>
            <SdkQueryClientProvider>
              <SigningClientProvider>
                <DeepProvider>
                  {!disableConnector ?
                    <Connector
                      portalOpen={portal}
                      setPortal={setPortal}
                      // onClosePortal={() => setPortal(portal)}
                      gqlPath={gqlPath}
                      gqlSsl={gqlSsl}
                      serverUrl={serverUrl}
                      deeplinksUrl={deeplinksUrl}
                      setGqlPath={(path) => setGqlPath(path)}
                      setGqlSsl={(ssl) => setGqlSsl(ssl)}
                    /> : null}
                  {gqlPath ? [
                    <CatchErrors key={1} errorRenderer={(e) => <>
                      <pre>Error in AutoGuest or content rendering.</pre>
                      <pre>{e?.toString() || JSON.stringify(e, null, 2)}</pre>
                    </>}>
                      <AutoGuest>
                        <Box>Cyber</Box>
                      </AutoGuest>
                    </CatchErrors>
                  ] : []}
                </DeepProvider>
              </SigningClientProvider>
            </SdkQueryClientProvider>
          </QueryClientProvider>
        </NetworksProvider>
      </Provider>
    ]}
  </>);
}

export async function getStaticProps() {
  return {
    props: {
      defaultGqlPath: publicRuntimeConfig?.NEXT_PUBLIC_GQL_PATH || '',
      defaultGqlSsl: !!+publicRuntimeConfig?.NEXT_PUBLIC_GQL_SSL || false,
      serverUrl: publicRuntimeConfig?.NEXT_PUBLIC_DEEPLINKS_SERVER || 'http://localhost:3007',
      deeplinksUrl: publicRuntimeConfig?.NEXT_PUBLIC_DEEPLINKS_URL || 'http://localhost:3006',
      disableConnector: !!+publicRuntimeConfig?.NEXT_PUBLIC_DISABLE_CONNECTOR || false,
      appVersion: pckg?.version || '',
    },
  };
}
