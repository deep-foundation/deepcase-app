
import { Box, Button, Code, Heading, HStack } from '@chakra-ui/react';
import { useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { useState } from 'react';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { Appearance } from '../imports/component-appearance';
import { GridComponent } from '../imports/component/grid-component';
import { Connector } from '../imports/connector';
import { QueryClientHandler } from '../imports/cyto/query-client-handler';
import { CytoGraphProps } from '../imports/cyto/types';
import { DotsLoader } from '../imports/dot-loader';
import { Example } from '../imports/popover-text/popover-text';
import { Provider } from '../imports/provider';
import { TextInput, TooltipEmoji } from '../imports/text-cursor-tooltip/text-cursor-tooltip';
import { elements } from './card';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto/graph').then((m) => m.default),
  { ssr: false }
);

export default function Page() {
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;
  const [toggle, setToggle] = useState(false);
  const [portal, setPortal] = useState(false);
  const [nested, setNested] = useState(false);
  // const [viewSize, setViewSize] = useState({width: 200, height: 150});

  // const blackAlpha = useChackraColor('blackAlpha.200');
  // const whiteAlpha = useChackraColor('whiteAlpha.200');
  // const colorGrayToWhite = useColorModeValue(blackAlpha, whiteAlpha);

  return (<>
    <Provider><>
      <ColorModeSwitcher/>
      <Box p={{sm: 7, md: 20}}>
        <Box w='100%' h='4rem' />
        <Heading>каждый компонент имеет заголовком имя файла, который находится в папке imports🤓</Heading>
        <Box w='100%' h='4rem' />
        <Code>/component/grid-component</Code>
        <GridComponent />

        <Box w='100%' h='10rem' />
        <Code>/dot-loader</Code>
        <Box w='10rem'>
          <DotsLoader />
        </Box>

        <Box w='100%' h='10rem' />
        <Code>/component-appearance</Code>
        <HStack spacing={4}>
          <Appearance toggle={toggle}>
            <Box w='100px' h='10rem' bg='red.200' /> 
          </Appearance>
          <Appearance toggle={toggle}>
            <Box w='10rem' h='2rem' bg='teal.300' /> 
          </Appearance>
          <Appearance toggle={toggle}>
            <Box w='15rem' h='10rem' bg='blue.400' /> 
          </Appearance>
        </HStack>
        <Button colorScheme='teal' onClick={() => setToggle(!toggle)}>push me</Button>

        <Box w='100%' h='4rem' />
        <Code>/popover-text/popover-text</Code>
        <Example />

        <Box w='100%' h='10rem' />
        <Code>/text-cursor-tooltip/text-cursor-tooltip</Code>
        <TextInput />
        
        <TooltipEmoji data={elements} />

        <Box w='100%' h='10rem' />
        <Code>/cyto/query-client-handler</Code>
        <Box w='100%' h='1rem' />
        <QueryClientHandler nested={nested} />
        <Button colorScheme='teal' onClick={() => setNested(!nested)}>nested</Button>
        <Box w='100%' h='1rem' />

        <Box w='100%' h='2rem' />
        <Code>/connector</Code>
        <Box w='100%' h='1rem' />
        <Connector 
          portalOpen={portal}
          onClosePortal={() => setPortal(false)}
        />
        <Button colorScheme='teal' onClick={() => setPortal(true)}>push me</Button>
        <Box w='100%' h='1rem' />

      </Box>
    </></Provider>
  </>);
}