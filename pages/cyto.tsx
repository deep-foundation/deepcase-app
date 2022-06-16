
import { Link, useMinilinksConstruct, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import React from 'react';
import { ConnectionController } from '.';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto-graph-props';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { useColorMode } from '../imports/framework';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto-graph-react').then((m) => m.default),
  { ssr: false }
);

export default function Page() {
  // const [spaceId, setSpaceId] = useSpaceId();
  const spaceId = 234;
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;
  const links: Link<number>[] = useMinilinksFilter(ml, (l) => true, (l, ml) => [...ml.links]);

  return (<>
    <Provider chakra>
      <ConnectionController>
        {[<DeepLoader
          key={spaceId}
          spaceId={spaceId}
          minilinks={minilinks}
          // onUpdateScreenQuery={query => console.log('updateScreenQuery', query)}
          />]}
        <ColorModeSwitcher/>
        <CytoGraph links={links} ml={ml}/>
      </ConnectionController>
    </Provider>
  </>);
}