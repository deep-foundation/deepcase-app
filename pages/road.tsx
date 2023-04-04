
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
import { PackagerInterface } from '../imports/packager-interface/packager-interface';


export function Content({
  openPortal,
}: {
  openPortal?: () => any;
}) {
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
    <ColorModeSwitcher/>
    <PackagerInterface />
  </>); 
};

export default function Page() {
  const [gqlPath, setGqlPath] = useState('');
  const [gqlSsl, setGqlSsl] = useState('');
  const [portal, setPortal] = useState(true);

  return (<>
    <Provider gqlPath={gqlPath} gqlSsl={gqlSsl}>
      <DeepProvider>
        <Content openPortal={()=>setPortal(true)} />
      </DeepProvider>
    </Provider>
  </>);
}