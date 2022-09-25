
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, useMinilinksConstruct, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { useCallback } from 'react';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto/types';
import { useShowExtra, useSpaceId } from '../imports/hooks';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { AutoGuest } from '../imports/auto-guest';
import CytoGraph from '../imports/cyto/graph';
import { useRefstarter } from '../imports/refstater';

// const CytoGraph = dynamic<CytoGraphProps>(
//   () => import('../imports/cyto/graph').then((m) => m.default),
//   { ssr: false }
// );
const CytoMenu = dynamic<any>(
  () => import('../imports/cyto/menu').then((m) => m.CytoMenu),
  { ssr: false }
);

export function Content({
}: {
}) {
  const cytoViewportRef = useRefstarter<{ pan: { x: number; y: number; }; zoom: number }>();

  const [spaceId, setSpaceId] = useSpaceId();
  const deep = useDeep();
  global.deep = deep;
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;
  global.ml = ml;

  const [extra, setExtra] = useShowExtra();

  const links: Link<number>[] = useMinilinksFilter(
    ml,
    useCallback((l) => true, []),
    useCallback((l, ml) => (
      extra
      ? ml.links
      : ml.links.filter(l => (
        !!l._applies.find((a: string) => !!~a.indexOf('query-') || a === 'space')
      ))
    ), [extra]),
  ) || [];

  return (<>
    {[<DeepLoader
      key={spaceId}
      spaceId={spaceId}
      minilinks={minilinks}
      />]}
    <CytoGraph links={links} ml={ml} cytoViewportRef={cytoViewportRef}/>
    <CytoMenu cytoViewportRef={cytoViewportRef}/>
    <ColorModeSwitcher/>
  </>);
  
};

export default function Page() {
  return (<>
    <Provider>
      <DeepProvider>
        <AutoGuest>
          <Content/>
        </AutoGuest>
      </DeepProvider>
    </Provider>
  </>);
}