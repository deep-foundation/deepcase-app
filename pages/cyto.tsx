
import { CloseIcon } from '@chakra-ui/icons';
import { Box, Button, ButtonGroup, Flex, HStack, IconButton } from '@chakra-ui/react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, useMinilinksConstruct, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { ConnectionController } from '.';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto-graph-props';
import { useContainer, useSpaceId } from '../imports/gui';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto-graph-react').then((m) => m.default),
  { ssr: false }
);

export function Content({
}: {
}) {
  const [spaceId, setSpaceId] = useSpaceId();
  const deep = useDeep();
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;
  const links: Link<number>[] = useMinilinksFilter(ml, (l) => true, (l, ml) => [...ml.links]);
  const [container, setContainer] = useContainer();

  return (<>
    {[<DeepLoader
      key={spaceId}
      spaceId={spaceId}
      minilinks={minilinks}
      // onUpdateScreenQuery={query => console.log('updateScreenQuery', query)}
      />]}
    <CytoGraph links={links} ml={ml}/>
    <Box pos='absolute' left={0} top={0}>
      <HStack spacing='1rem' m='1rem'>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button disabled>auth</Button>
          <Button>{deep.linkId}</Button>
          <IconButton aria-label='Reauth as guest' icon={<CloseIcon />} onClick={async () => {
            const guest = await deep.guest();
            setSpaceId(guest.linkId);
            setContainer(guest.linkId);
          }}/>
        </ButtonGroup>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button disabled>space</Button>
          <Button>{spaceId}</Button>
          <IconButton aria-label='Quit to user space' icon={<CloseIcon />} onClick={() => {
            setSpaceId(deep.linkId);
            setContainer(deep.linkId);
          }}/>
        </ButtonGroup>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button disabled>container</Button>
          <Button>{container}</Button>
          <IconButton aria-label='Quit to user space' icon={<CloseIcon />} onClick={() => {
            setContainer(deep.linkId);
          }}/>
        </ButtonGroup>
      </HStack>
    </Box>
    <ColorModeSwitcher/>
  </>);
  
};

export default function Page() {
  return (<>
    <Provider chakra>
      {/* <ConnectionController> */}
        <Content/>
      {/* </ConnectionController> */}
    </Provider>
  </>);
}