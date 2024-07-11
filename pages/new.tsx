import {
  Box,
  Button,
  CircularProgress,
  Flex,
  Grid,
  GridItem,
  Text,
} from '@chakra-ui/react';
import { AutoGuest } from '@deep-foundation/deepcase/imports/auto-guest';
import { parseUrl } from '@deep-foundation/deepcase/imports/connector/connector';
import { useContainer, useSpaceId } from '@deep-foundation/deepcase/imports/hooks';
import { Provider as ProviderDeepcase } from '@deep-foundation/deepcase/imports/provider';
import { DeepNamespaceProvider, DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { MinilinksProvider } from '@deep-foundation/deeplinks/imports/minilinks';
import { useQueryStore } from '@deep-foundation/store/query';
import { useTranslation } from 'next-i18next';
import getConfig from 'next/config';
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { IoMdExit } from "react-icons/io";
import pckg from '../package.json';
import { i18nGetStaticProps } from '../src/i18n.tsx';
import { useDeepPath } from '../src/provider.tsx';

const { publicRuntimeConfig } = getConfig();

export const Tab = ({
  id, name, type, icon, isActive, onClick,
  side = 'right'
}: {
  id: number;
  name: string;
  type: string;
  icon: string;
  isActive: boolean;
  onClick: (id: number) => void;
  side?: 'left' | 'right';
}) => {
  return <Box position='relative' display='inline-flex' h='3em' role="group">
    <Button
      borderRadius={0} h='3em' variant='newButton' color={isActive ? 'cyan' : 'white'}
      zIndex={1}
      onClick={() => onClick(id)}
    >
      {icon} <Box align='left' pl='0.5em'>
        <Text fontSize="sm">{name || type}</Text>
        <Text fontSize="xxs">{name ? type : ''} {id}</Text>
      </Box>
    </Button>
    <Box
      _groupHover={{ top: '100%' }}
      position='absolute' top='0%' {...({ [side]: '0px' })}
      transition='all 0.3s ease'
    >
      <Button
        borderRadius={0} h='2.5em' w='2.5em' variant='newButton'
        onClick={() => onClick(id)}
      >❌</Button>
      <Button
        borderRadius={0} h='2.5em' w='2.5em' variant='newButton'
        onClick={() => onClick(id)}
      >📌</Button>
    </Box>
  </Box>
};

export const LayoutButton = ({
  id, name, isActive, onClick
}: {
  id: string;
  name: string;
  isActive: boolean;
  onClick: (id: string) => void;
}) => {
  return <Box position='relative' display='inline-flex' h='3em' role="group">
    <Button
      borderRadius={0} h='3em' w='3em' variant='newButton' color={isActive ? 'cyan' : 'white'}
      zIndex={1}
      onClick={() => onClick(id)}
    >
      {name}
    </Button>
    <Box
      _groupHover={{ left: '100%' }}
      position='absolute' left='0%' top='0px'
      transition='all 0.3s ease'
    >
      <Button
        borderRadius={0} h='2.5em' w='2.5em' variant='newButton'
        onClick={() => onClick(id)}
      >❌</Button>
    </Box>
  </Box>
};

export function Status() {
  const deep = useDeep();
  // const status = deep.client.useApolloNetworkStatus();
  const status = {}
  console.log('status', status);
  return <>
    <CircularProgress
      size="1em" isIndeterminate={false} value={100} color={(deep && deep?.linkId) ? 'cyan' : 'red'}
    />
  </>;
}

export function Content() {
  const deep = useDeep();
  const { t } = useTranslation();
  const router = useRouter();

  // @ts-ignore
  if (typeof(window) === 'object') window.deep = deep;
  console.log('deep', deep);

  const [layout, setLayout] = useQueryStore('layout', 'c');

  const [spaceId, setSpaceId] = useSpaceId();
  const [containerId, setContainerId] = useContainer();

  return (
    <Grid
      templateAreas={`"tabs tabs"
                      "nav main"`}
      gridTemplateRows={'3em 1fr'}
      gridTemplateColumns={'3em 1fr'}
      h='100%' w="100%" position="fixed" l="0%" t="0%"
      color='blackAlpha.700'
      fontWeight='bold'
    >
      <GridItem bg='orange.300' area={'tabs'} zIndex={1}>
        <Flex w="100%" h="100%">
          <Box flex='1' bg='newBackground' sx={{ textWrap: "nowrap" }}>
            <Tab
              id={123} name='ivansglazunov' type='user' icon='🥼'
              onClick={id => setSpaceId(id)} isActive={spaceId === 123}
            />
            <Tab
              id={4324} name='onReplyInsert' type='SyncTextFile' icon='📑'
              onClick={id => setSpaceId(id)} isActive={spaceId === 4324}
            />
            <Tab
              id={1273} name='Finder' type='TSX' icon='📑'
              onClick={id => setSpaceId(id)} isActive={spaceId === 1273}
            />
            <Tab
              id={2473} name='Layout' type='TSX' icon='📑'
              onClick={id => setSpaceId(id)} isActive={spaceId === 2473}
            />
            <Tab
              id={4273} name='Menu' type='TSX' icon='📑'
              onClick={id => setSpaceId(id)} isActive={spaceId === 4273}
            />
            <Tab
              id={5173} name='Grid' type='TSX' icon='📑'
              onClick={id => setSpaceId(id)} isActive={spaceId === 5173}
            />
          </Box>
          <Box flex='1' bg='newBackground' align="right">
            <Tab
              id={452} name='allowUsersInsertSafe' type='Rule' icon='🔥'
              onClick={id => setSpaceId(id)} isActive={spaceId === 452}
              side='left'
            />
          </Box>
        </Flex>
      </GridItem>
      <GridItem bg='newBackground' area={'nav'} zIndex={1} position="relative" h="100%">
        <LayoutButton isActive={layout === 'c'} id={'c'} name={'c'} onClick={id => setLayout(id)}/>
        <LayoutButton isActive={layout === 'g'} id={'g'} name={'g'} onClick={id => setLayout(id)}/>
        <LayoutButton isActive={layout === 'f'} id={'f'} name={'f'} onClick={id => setLayout(id)}/>
        <LayoutButton isActive={layout === 'o'} id={'o'} name={'o'} onClick={id => setLayout(id)}/>
        <Button borderRadius={0} variant='newButton' w='3em' h='3em'>+</Button>
        <Button borderRadius={0} variant='newButton' w='3em' h='3em' position="absolute" bottom="3em" left="0px">
          <Status/>
        </Button>
        <Button borderRadius={0} variant='newButton' w='3em' h='3em' position="absolute" bottom="0px" left="0px"><IoMdExit /></Button>
      </GridItem>
      <GridItem bg='newBackground' area={'main'} overflow="hidden" position="relative">
        {layout === 'c' && <Box w='100%' h='100%' bg='newBackground'>
        </Box>}
        {layout === 'g' && <Box w='100%' h='100%' bg='white'></Box>}
        {layout === 'f' && <Box w='100%' h='100%' bg='pink'>
        </Box>}
        {layout === 'o' && <Box w='100%' h='100%' bg='newBackground'>
          <iframe src='https://openchakra.app/' width='100%' height='100%'></iframe>
        </Box>}
      </GridItem>
    </Grid>
  );
  // return (<Flex w="100%" h="100%" position="fixed" l="0%" t="0%">
  //   <Box w='2em' bg='gray.500' overflowX="hidden" overflowY="scroll">
  //   </Box>
  //   <Box flex='1' bg='tomato' overflow="hidden">
  //   </Box>
  // </Flex>);
};

export default function Page({
  defaultPath, defaultSsl, disableConnector
}: {
  defaultPath: string;
  defaultSsl: boolean;
  disableConnector: boolean;
}) {
  const [path, setPath] = useDeepPath(defaultPath);
  const [ssl, setSsl] = useState(defaultSsl);

  useEffect(() => {
    if (!disableConnector) {
      return;
    }
    if (typeof window !== 'undefined') {
      const browserURI = window?.location?.origin;
      if (browserURI) {
        const [browserPath, browserSsl] = parseUrl(browserURI);
        setPath(browserPath + "/api/gql");
        setSsl(browserSsl);
      }
    }
  }, []);

  return (
    <ProviderDeepcase gqlPath={path} gqlSsl={ssl}>
      <DeepNamespaceProvider>
        <MinilinksProvider>
          {!!path && <>
            {/* <CyberDeepProvider namespace="cyber"/> */}
            <DeepProvider namespace="remote"/>
            <AutoGuest/>
            <Content/>
          </>}
        </MinilinksProvider>
      </DeepNamespaceProvider>
    </ProviderDeepcase>
  );
};

export async function getStaticProps(arg) {
  const result = await i18nGetStaticProps(arg);
  result.props = result?.props || {};

  result.props.defaultPath = publicRuntimeConfig?.NEXT_PUBLIC_GQL_PATH || '';
  result.props.defaultSsl = !!+publicRuntimeConfig?.NEXT_PUBLIC_GQL_SSL || false;
  result.props.serverUrl = publicRuntimeConfig?.NEXT_PUBLIC_DEEPLINKS_SERVER || 'http://localhost:3007';
  result.props.deeplinksUrl = publicRuntimeConfig?.NEXT_PUBLIC_DEEPLINKS_URL || 'http://localhost:3006';
  result.props.disableConnector = !!+publicRuntimeConfig?.NEXT_PUBLIC_DISABLE_CONNECTOR || false;
  result.props.appVersion = pckg?.version || '';

  return result;
}