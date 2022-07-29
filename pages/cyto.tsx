
import { CloseIcon } from '@chakra-ui/icons';
import { Box, Button, ButtonGroup, Flex, FormControl, FormLabel, HStack, IconButton, Select, Switch } from '@chakra-ui/react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, useMinilinksConstruct, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { useCallback, useState } from 'react';
import { ConnectionController } from '.';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto/types';
import { useContainer, useLayout, useShowExtra, useShowTypes, useSpaceId } from '../imports/hooks';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import copy from 'copy-to-clipboard';
import { layouts } from '../imports/cyto/layouts';
import { useCytoEditor } from '../imports/cyto/hooks';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto/graph').then((m) => m.default),
  { ssr: false }
);

const NEXT_PUBLIC_GQL_PATH = process.env.NEXT_PUBLIC_GQL_PATH || 'localhost:3006/gql';
const NEXT_PUBLIC_GQL_SSL = process.env.NEXT_PUBLIC_GQL_SSL || '0';

export function Content({
}: {
}) {
  const [spaceId, setSpaceId] = useSpaceId();
  const deep = useDeep();
  global.deep = deep;
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;
  global.ml = ml;
  const [container, setContainer] = useContainer();
  const [extra, setExtra] = useShowExtra();
  const [showTypes, setShowTypes] = useShowTypes();
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const { layout, setLayout, layoutName } = useLayout();
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
        <Select placeholder='layouts' size='sm' value={layoutName} onChange={(event) => {
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
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='show-types-switch' mb='0'>
            show types
          </FormLabel>
          <Switch id='show-types-switch' isChecked={showTypes} onChange={() => setShowTypes(!showTypes)}/>
        </FormControl>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button as='a' href={`http${+NEXT_PUBLIC_GQL_SSL ? 's' : ''}://${NEXT_PUBLIC_GQL_PATH}`} target="_blank">gql</Button>
        </ButtonGroup>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button onClick={() => setCytoEditor(true)}>editor</Button>
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