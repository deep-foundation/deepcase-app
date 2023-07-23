
import { Link, useMinilinksConstruct, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import { DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import { useCallback } from 'react';
import { ColorModeSwitcher } from '@deep-foundation/deepcase/imports/color-mode-toggle';
import { CytoReactLinksCard } from '@deep-foundation/deepcase/imports/cyto-react-links-card';
import { Center } from '@chakra-ui/react';
import { DeepLoader } from '@deep-foundation/deepcase/imports/loader';
import { Provider } from '@deep-foundation/deepcase/imports/provider';


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
  {
    id: 11,
    src: '❤️‍🔥',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
  {
    id: 12,
    src: '❤️‍🔥',
    linkName: 'Massage',
    containerName: '@deepcase/massage',
  },
  {
    id: 13,
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
            // minilinks={minilinks}
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