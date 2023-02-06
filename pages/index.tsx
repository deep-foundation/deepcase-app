
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { useCallback, useRef, useState } from 'react';
import { AutoGuest } from '../imports/auto-guest';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import CytoGraph from '../imports/cyto/graph';
import { useBreadcrumbs, useShowExtra, useSpaceId } from '../imports/hooks';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { useRefstarter } from '../imports/refstater';
import { Connector } from '../imports/connector/connector';

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
}: {
  openPortal?: () => any;
}) {
  const cytoViewportRef = useRefstarter<{ pan: { x: number; y: number; }; zoom: number }>();
  const cyRef = useRef();
  const [spaceId, setSpaceId] = useSpaceId();
  const deep = useDeep();
  global.deep = deep;

  global.ml = deep.minilinks;
  const [extra, setExtra] = useShowExtra();
  const [breadcrumbs, setBreadcrumbs] = useBreadcrumbs();

  const links: Link<number>[] = useMinilinksFilter(
    deep.minilinks,
    useCallback((l) => true, []),
    useCallback((l, ml) => {
      const result =  (
        extra
        ? ml.links
        : ml.links.filter(l => (
          !!l._applies.find((a: string) => !!~a.indexOf('query-') || a === 'space' || a === 'breadcrumbs')
        ))
      );
      return result;
    }, [extra, breadcrumbs]),
  ) || [];

  return (<>
    {[<DeepLoader
      key={spaceId}
      spaceId={spaceId}
      />]}
    <CytoGraph links={links} cyRef={cyRef} cytoViewportRef={cytoViewportRef}/>
    <CytoMenu cyRef={cyRef} cytoViewportRef={cytoViewportRef} openPortal={openPortal} />
    <ColorModeSwitcher/>
  </>); 
};

export default function Page() {
  const [gqlPath, setGqlPath] = useState('');
  const [gqlSsl, setGqlSsl] = useState('');
  const [portal, setPortal] = useState(true);

  return (<>
    <Provider gqlPath={gqlPath} gqlSsl={gqlSsl}>
      <DeepProvider>
        <AutoGuest>
          <Connector
            portalOpen={portal}
            setPortalOpen={setPortal}
            // onClosePortal={() => setPortal(portal)}
            gqlPath
            gqlSsl
            setGqlPath={(path) => setGqlPath(path)}
            setGqlSsl={(ssl) => setGqlSsl(ssl)}
          />
          <Content openPortal={()=>setPortal(true)} />
        </AutoGuest>
      </DeepProvider>
    </Provider>
  </>);
}