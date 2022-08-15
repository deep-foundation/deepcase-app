import React from 'react';
import { Box, Center, Flex, useColorMode } from '@chakra-ui/react';
import { useChackraColor } from '../get-color';

interface IGrid {
  columns?: any;
  editorTabsElement?: any;
  editorTextAreaElement?: any;
  editorRight?: any;
  closeButtonElement?: any;
  editorRightSwitch?: any;
}


export const EditorGrid = React.memo<any>(({
  columns = 'repeat(2, 50%)',
  editorTabsElement,
  editorTextAreaElement,
  editorRight,
  closeButtonElement,
  editorRightSwitch,
}:IGrid) => {
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const { colorMode } = useColorMode();

  return (<Box display='flex' flexDir='column' h={'100%'} bg={colorMode == 'light' ? white : gray900} style={{ opacity: 0.98 }}>
      <Flex>
        <Box sx={{width: 'calc(100% - 2rem)'}}>{editorTabsElement}</Box>
        <Center>{closeButtonElement}</Center>
      </Flex>
      <Box display='grid' gridTemplateColumns={columns} h={'100%'}>
        {editorTextAreaElement}
        <Box display='grid' gridTemplateRows='1fr max-content' h={'100%'} position="relative">
          {editorRight}
          {editorRightSwitch}
        </Box>
      </Box>
    </Box>
  )
})