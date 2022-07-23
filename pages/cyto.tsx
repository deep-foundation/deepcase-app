
import { CloseIcon } from '@chakra-ui/icons';
import { Box, Button, ButtonGroup, Flex, FormControl, FormLabel, HStack, IconButton, Select, Switch } from '@chakra-ui/react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, useMinilinksConstruct, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { useCallback, useState } from 'react';
import { ConnectionController } from '.';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto-graph-props';
import { useContainer, useLayout, useShowExtra, useSpaceId } from '../imports/hooks';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import copy from 'copy-to-clipboard';
import { layouts } from '../imports/cyto-layouts-presets';

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
  const [container, setContainer] = useContainer();
  const [extra, setExtra] = useShowExtra();
  const { layout, setLayout, layoutName } = useLayout();
  const links: Link<number>[] = useMinilinksFilter(
    ml,
    useCallback((l) => true, []),
    useCallback((l, ml) => (
      extra
      ? [...ml.links]
      : ml.links.filter(l => (
        !(l.type_id === 3 && (!l.to || l.to?.type_id === 55 || !l.from)) &&
        l.type_id !== 1 && l.type_id !== 55
      ))
    ), [extra]),
  );

  return (<>
    {[<DeepLoader
      key={spaceId}
      spaceId={spaceId}
      minilinks={minilinks}
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
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button onClick={() => {
            copy(deep.token);
          }}>copy token</Button>
        </ButtonGroup>
        <Select placeholder='layouts' size='sm' onChange={(event) => {
          setLayout(event.target.value);
        }}>
          {Object.keys(layouts).map(name => (
            <option value={name}>{name}</option>
          ))}
        </Select>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='show-extra-switch' mb='0'>
            show extra
          </FormLabel>
          <Switch id='show-extra-switch' isChecked={extra} onChange={() => setExtra(!extra)}/>
        </FormControl>
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