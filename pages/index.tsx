
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from 'react';
import { AutoGuest } from '../imports/auto-guest';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { Switch } from '../imports/switch-mode';
import CytoGraph from '../imports/cyto/graph';
import { useBreadcrumbs, useRefAutofill, useShowExtra, useSpaceId, useTraveler } from '../imports/hooks';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { useRefstarter } from '../imports/refstater';
import { Connector } from '../imports/connector/connector';
import { PackagerInterface } from '../imports/packager-interface/packager-interface';
import getConfig from 'next/config'
import { CatchErrors } from '../imports/react-errors';
import { Button } from '@chakra-ui/react';

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
  const travelerRef = useRefAutofill(traveler);

  const TravelerRef = useRef(0);
  useEffect(() => { (async () => {
    TravelerRef.current = await deep.id('@deep-foundation/deepcase', 'Traveler');
  })(); }, []);

  const links: Link<number>[] = useMinilinksFilter(
    deep.minilinks,
    useCallback((l) => true, []),
    useCallback((l, ml) => {
      const Traveler = TravelerRef.current;
      const traveler = travelerRef.current;
      let result =  (
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
    }, [extra, breadcrumbs, traveler]),
    1000,
  ) || [];

  return (<>
    {[<DeepLoader
      key={spaceId}
      spaceId={spaceId}
      />]}
    <CytoGraph gqlPath={gqlPath} gqlSsl={gqlSsl} links={links} cyRef={cyRef} cytoViewportRef={cytoViewportRef}/>
    <CytoMenu  gqlPath={gqlPath} gqlSsl={gqlSsl} cyRef={cyRef} cytoViewportRef={cytoViewportRef} openPortal={openPortal} />
    <Switch />
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
  
  console.log("gqlPath", gqlPath);
  console.log("gqlSsl", gqlSsl);
  
  const key = `${gqlSsl}-${gqlPath}`;

  return (<>
    {[
      <Provider key={key} gqlPath={gqlPath} gqlSsl={gqlSsl}>
        <DeepProvider>
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
          />
          { gqlPath ? [
            <CatchErrors key={1} errorRenderer={(e) => <>
              <div>Error in AutoGuest or content rendering.</div>
              <div>{e?.toString() || JSON.stringify(e)}</div>
            </> }>
              <AutoGuest>
                <Content gqlPath={gqlPath} gqlSsl={gqlSsl} openPortal={()=>setPortal(true)} />
                <Button
                  colorScheme='blue' 
                  onClick={() => setPortal(true)} 
                  pos='absolute' right='44' top='4'
                >connector</Button>
              </AutoGuest>
            </CatchErrors>
          ] : [] }
        </DeepProvider>
      </Provider>
    ]}
  </>);
}

export async function getStaticProps() {
  return {
    props: {
      gqlPath: publicRuntimeConfig?.NEXT_PUBLIC_GQL_PATH || '',
      gqlSsl: !!+publicRuntimeConfig?.NEXT_PUBLIC_GQL_SSL || false,
      serverUrl: publicRuntimeConfig?.NEXT_PUBLIC_DEEPLINKS_SERVER || 'http://localhost:3007',
      deeplinksUrl: publicRuntimeConfig?.NEXT_PUBLIC_DEEPLINKS_URL || 'http://localhost:3006',
    },
  };
}
