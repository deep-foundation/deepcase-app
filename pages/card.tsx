
import { Link, useMinilinksConstruct, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { useCallback } from 'react';
import { ConnectionController } from '.';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto-graph-props';
import { CytoReactLinksCard } from '../imports/cyto-react-links-card';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { Center } from '../imports/framework';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto-graph-react').then((m) => m.default),
  { ssr: false }
);

const elements = [
  {
    id: 1,
    src: '🥸',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
  {
    id: 2,
    src: '🥳',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
  {
    id: 3,
    src: '💀',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
  {
    id: 4,
    src: '💩',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
  {
    id: 5,
    src: '❤️‍🔥',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
  {
    id: 6,
    src: '💩',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
  {
    id: 7,
    src: '❤️‍🔥',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  }
]

export default function Page() {
  // const [spaceId, setSpaceId] = useSpaceId();
  const spaceId = 234;
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;
  const links: Link<number>[] = useMinilinksFilter(
    ml,
    useCallback((l) => true, []),
    useCallback((l, ml) => [...ml.links], []),
  );

  return (<>
    <Provider chakra>
      <>
        {[<DeepLoader
          key={spaceId}
          spaceId={spaceId}
          minilinks={minilinks}
          // onUpdateScreenQuery={query => console.log('updateScreenQuery', query)}
          />]}
        <ColorModeSwitcher/>
        <Center>
          <CytoReactLinksCard elements={elements} noResults />
        </Center>
      </>
    </Provider>
  </>);
}