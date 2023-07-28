
import { Box, Button, Code, Heading, HStack, ChakraProvider } from '@chakra-ui/react';
import { DeepProvider } from '@deep-foundation/deeplinks/imports/client';
import { useState } from 'react';
import { ColorModeSwitcher } from '@deep-foundation/deepcase/imports/color-mode-toggle';
import { Appearance } from '@deep-foundation/deepcase/imports/component-appearance';
import { GridComponent } from '@deep-foundation/deepcase/imports/component/grid-component';
import { QueryClientHandler } from '@deep-foundation/deepcase/imports/cyto/query-client-handler';
import { DotsLoader } from '@deep-foundation/deepcase/imports/dot-loader';
import { PackagePublisher } from '@deep-foundation/deepcase/imports/package-publisher';
import { PackagerInterface } from '@deep-foundation/deepcase/imports/packager-interface/packager-interface';
import { Example } from '@deep-foundation/deepcase/imports/popover-text/popover-text';
import { Provider } from '@deep-foundation/deepcase/imports/provider';
import { TextInput, TooltipEmoji } from '@deep-foundation/deepcase/imports/text-cursor-tooltip/text-cursor-tooltip';
import { Token } from '@deep-foundation/deepcase/imports/token';
import { elements } from './card';

import { isAndroid, isIOS, isWindows, isMacOs } from 'react-device-detect';
import { VerticalSash } from '@deep-foundation/deepcase/imports/editor/editor-grid';
import { MessagingInterface } from '@deep-foundation/deepcase/imports/messanger';
import { Switch } from '@deep-foundation/deepcase/imports/switch-mode';
import { DeepWysiwyg } from '@deep-foundation/deepcase/imports/deep-wysiwyg';
import { PackagesBlock } from '@deep-foundation/deepcase/imports/cyto-react-links-packages';
import { useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import themeChakra from '@deep-foundation/deepcase/imports/theme/theme';
import { EditableWithDecorate, HighlightLastActiveSelection } from '@deep-foundation/deepcase/imports/test-md';


const Detector = () => {
  let os = 'unknown';

  if (isAndroid) {
    os = 'Android';
  } else if (isIOS) {
    os = 'iOS';
  } else if (isWindows) {
    os = 'Windows';
  } else if (isMacOs) {
    os = 'macOS';
  }

  return (
    <div>
      <p>Your operating system is: {os}</p>
    </div>
  );
};

export default function Page() {
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;
  const [toggle, setToggle] = useState(false);
  const [togglePackager, setTogglePackager] = useState(false);
  const [portal, setPortal] = useState(false);
  const [nested, setNested] = useState(false);
  const [topMenu, setTopmenu] = useState(true);

  // return (<>
  //   <Provider>
  //  <DeepProvider>
  //  <ChakraProvider theme={themeChakra}>
  //     <>
  //     <Box p={{sm: 7, md: 20}}>
  //       <Box w='100%' h='4rem' />
  //       <Heading>каждый компонент имеет заголовком имя файла, который находится в папке imports🤓</Heading>
  //       <Box w='100%' h='4rem' />
  //       <Code>/component/grid-component</Code>
  //       <GridComponent />

  //       <Box w='100%' h='10rem' />
  //       <Code>/dot-loader</Code>
  //       <Box w='10rem'>
  //         <DotsLoader />
  //       </Box>

  //       <Box w='100%' h='10rem' />
  //       <Code>/component-appearance</Code>
  //       <HStack spacing={4}>
  //         <Appearance toggle={toggle}>
  //           <Box w='100px' h='10rem' bg='red.200' /> 
  //         </Appearance>
  //         <Appearance toggle={toggle}>
  //           <Box w='10rem' h='2rem' bg='teal.300' /> 
  //         </Appearance>
  //         <Appearance toggle={toggle}>
  //           <Box w='15rem' h='10rem' bg='blue.400' /> 
  //         </Appearance>
  //       </HStack>
  //       <Button colorScheme='teal' onClick={() => setToggle(!toggle)}>push me</Button>

  //       <Box w='100%' h='4rem' />
  //       <Code>/popover-text/popover-text</Code>
  //       <Example />

  //       <Box w='100%' h='10rem' />
  //       <Code>/text-cursor-tooltip/text-cursor-tooltip</Code>
  //       <TextInput />
        
  //       <TooltipEmoji data={elements} />

  //       <Box w='100%' h='10rem' />
  //       <Code>/cyto/query-client-handler</Code>
  //       <Box w='100%' h='1rem' />
  //       <QueryClientHandler nested={nested} />
  //       <Button colorScheme='teal' onClick={() => setNested(!nested)}>nested</Button>
  //       <Box w='100%' h='1rem' />

  //       {/* <Box w='100%' h='2rem' />
  //       <Code>/connector</Code>
  //       <Box w='100%' h='1rem' />
  //         <Connector 
  //           portalOpen={portal}
  //           onClosePortal={() => setPortal(false)}
  //         />
  //       <Button colorScheme='teal' onClick={() => setPortal(true)}>push me</Button>
  //       <Box w='100%' h='1rem' />
  //       */}
  //       <Box w='100%' h='2rem' />
  //       {/* <Code>/deep-wysiwyg</Code>
  //       <Box w='100%' h='1rem' />
  //         <DeepWysiwyg topmenu={topMenu} />
  //       <Box w='100%' h='1rem' />
  //       <Button colorScheme='teal' onClick={() => {
  //         setTopmenu(!topMenu);
  //         console.log('topMenu', topMenu);
  //       }}>topmenu</Button>
  //       <Box w='100%' h='1rem' /> */}


  //       <Box w='100%' h='2rem' />
  //       <Code>/packager-interface</Code>
  //       <Box w='100%' h='1rem' />
  //         {/* <PackagerInterface 
  //           toggle={togglePackager} 
  //           onClose={() => setTogglePackager(false)}
  //         /> */}
  //         <Button colorScheme='teal' onClick={() => setTogglePackager(true)}>push me</Button>
  //       <Box w='100%' h='1rem' />

  //       <Box w='100%' h='2rem' />
  //       <Code>/package-publisher</Code>
  //       <Box w='100%' h='1rem' />
  //         {/* <PackagePublisher /> */}
  //       <Box w='100%' h='1rem' />

  //       <Box w='100%' h='2rem' />
  //       <Code>/token</Code>
  //       <Box w='100%' h='1rem' />
  //         <Token />
  //       <Box w='100%' h='1rem' />
        
  //       <Box w='100%' h='2rem' />
  //       <Code>/package-publisher</Code>
  //       <Box w='100%' h='1rem' />
  //         <Detector />
  //       <Box w='100%' h='1rem' />

  //       <Box w='100%' h='2rem' />
  //       <Code>/editor-grid</Code>
  //       <Box w='100%' h='1rem' />
  //         <VerticalSash />
  //       <Box w='100%' h='1rem' />

  //       <Box w='100%' h='2rem' />
  //       <Code>/editor-grid</Code>
  //       <Box w='100%' h='1rem' />
  //         <MessagingInterface />
  //       <Box w='100%' h='1rem' />
        
  //       <Box w='100%' h='2rem' />
  //       <Code>/switch-mode</Code>
  //       <Box w='100%' h='1rem' />
  //         <Switch />
  //       <Box w='100%' h='1rem' />
      
  //       <Box w='100%' h='2rem' />
  //       <Code>/cyto-react-links-packages</Code>
  //       <Box w='100%' h='1rem' />
  //         <PackagesBlock />
  //       <Box w='100%' h='1rem' />
        
  //       <Box w='100%' h='2rem' />
  //       <Code>/test-md</Code>
  //       <Box w='100%' h='1rem' />
  //         <HighlightLastActiveSelection />
  //       <Box w='100%' h='1rem' />

  //       <Box w='100%' h='15rem' />

  //     </Box>
  //   </>
  //   </ChakraProvider>
  //  </DeepProvider>
  //   </Provider>
  // </>);
  return <></>;
}