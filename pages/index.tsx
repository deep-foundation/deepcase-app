
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, useMinilinksConstruct, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { useCallback } from 'react';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto/types';
import { useShowExtra, useSpaceId } from '../imports/hooks';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto/graph').then((m) => m.default),
  { ssr: false }
);
const CytoMenu = dynamic<any>(
  () => import('../imports/cyto/menu').then((m) => m.CytoMenu),
  { ssr: false }
);

export function Content({
}: {
}) {
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
    <CytoGraph links={links} ml={ml}/>
    <CytoMenu/>
    <ColorModeSwitcher/>
  </>);
  
};

export default function Page() {
  return (<>
    <Provider chakra>
      <Content/>
    </Provider>
  </>);
}