
import { Link, useMinilinksConstruct, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import { DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import dynamic from "next/dynamic";
import { useCallback } from 'react';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoReactLinksCard } from '../imports/cyto-react-links-card';
import { CytoGraphProps } from '../imports/cyto/types';
import { Center } from '@chakra-ui/react';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto/graph').then((m) => m.default),
  { ssr: false }
);

export const elements = [
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
  },
  {
    id: 8,
    src: '❤️‍🔥',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
  {
    id: 9,
    src: '❤️‍🔥',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
  {
    id: 10,
    src: '❤️‍🔥',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
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
    <Provider>
      <DeepProvider>
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
      </DeepProvider>
    </Provider>
  </>);
}