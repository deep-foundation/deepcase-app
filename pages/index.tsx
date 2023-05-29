
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from 'react';
import { AutoGuest } from '../imports/auto-guest';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import CytoGraph from '../imports/cyto/graph';
import { useBreadcrumbs, useShowExtra, useSpaceId, useTraveler } from '../imports/hooks';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { useRefstarter } from '../imports/refstater';
import { Connector } from '../imports/connector/connector';
import { PackagerInterface } from '../imports/packager-interface/packager-interface';
import getConfig from 'next/config'

const { publicRuntimeConfig } = getConfig();

// const CytoGraph = dynamic<CytoGraphProps>(
//   () => import('../imports/cyto/graph').then((m) => m.default),
//   { ssr: false }
// );
const CytoMenu = dynamic<any>(
  () => import('../imports/cyto/menu').then((m) => m.CytoMenu),
  { ssr: false }
);

export function Content({
  openPortal,
  gqlPath,
  gqlSsl,
}: {
  openPortal?: () => any;
  gqlPath: string;
  gqlSsl: boolean;
}) {
  const cytoViewportRef = useRefstarter<{ pan: { x: number; y: number; }; zoom: number }>();
  const cyRef = useRef();
  const [spaceId, setSpaceId] = useSpaceId();
  const [traveler, setTraveler] = useTraveler();
  const deep = useDeep();
  const globalAny:any = global;
  globalAny.deep = deep;
  globalAny.ml = deep.minilinks;
  const [extra, setExtra] = useShowExtra();
  const [breadcrumbs, setBreadcrumbs] = useBreadcrumbs();

  const links: Link<number>[] = useMinilinksFilter(
    deep.minilinks,
    useCallback((l) => true, []),
    useCallback((l, ml) => {
      let Traveler;
      try {
        Traveler = deep.idLocal('@deep-foundation/deepcase', 'Traveler');
      } catch(e) {}
      let result =  (
        extra
        ? ml.links
        : ml.links.filter(l => (
          !!l._applies.find((a: string) => !!~a.indexOf('query-') || a === 'space' || a === 'breadcrumbs')
        ))
      );
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
    }, [extra, breadcrumbs, traveler]),
  ) || [];

  return (<>
    {[<DeepLoader
      key={spaceId}
      spaceId={spaceId}
      />]}
    <CytoGraph gqlPath={gqlPath} gqlSsl={gqlSsl} links={links} cyRef={cyRef} cytoViewportRef={cytoViewportRef}/>
    <CytoMenu  gqlPath={gqlPath} gqlSsl={gqlSsl} cyRef={cyRef} cytoViewportRef={cytoViewportRef} openPortal={openPortal} />
    <ColorModeSwitcher/>
    <PackagerInterface />
  </>); 
};

export default function Page(props: {
  gqlPath: string;
  gqlSsl: boolean;
  serverUrl: string;
  deeplinksUrl: string;
}) {
  const { serverUrl, deeplinksUrl } = props;
  const [gqlPath, setGqlPath] = useState(props.gqlPath);
  const [gqlSsl, setGqlSsl] = useState(props.gqlSsl);
  const [portal, setPortal] = useState(true);

  return (<>
    <Provider gqlPath={gqlPath} gqlSsl={gqlSsl}>
      <DeepProvider>
        <AutoGuest>
          <Connector
            portalOpen={portal}
            setPortal={setPortal}
            // onClosePortal={() => setPortal(portal)}
            gqlPath={gqlPath}
            gqlSsl={gqlSsl}
            serverUrl={serverUrl}
            deeplinksUrl={deeplinksUrl} // TODO: Do we really need this? Does not gqlPath + gqlSsl is enough? Should we check status for the remote deeplinks or only for local? Ping to @Menzorg
            setGqlPath={(path) => setGqlPath(path)}
            setGqlSsl={(ssl) => setGqlSsl(ssl)}
          />
          <Content gqlPath={gqlPath} gqlSsl={gqlSsl} openPortal={()=>setPortal(true)} />
        </AutoGuest>
      </DeepProvider>
    </Provider>
  </>);
}

export async function getStaticProps() {
  return {
    props: {
      gqlPath: publicRuntimeConfig?.NEXT_PUBLIC_GQL_PATH || 'localhost:3006/gql',
      gqlSsl: !!+publicRuntimeConfig?.NEXT_PUBLIC_GQL_SSL || false,
      serverUrl: publicRuntimeConfig?.NEXT_PUBLIC_DEEPLINKS_SERVER || 'http://localhost:3007',
      deeplinksUrl: publicRuntimeConfig?.NEXT_PUBLIC_DEEPLINKS_URL || 'http://localhost:3006',
    },
  };
}
