import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from 'next/dynamic';
import React from 'react';
import { Box, Flex, Center, CloseButton } from '../framework';

interface IGrid {
  columns?: any;
  editorTabsElement?: any;
  editorTextAreaElement?: any;
  editorRight?: any;
  closeButtonElement?: any;
}


export const EditorGrid = React.memo<any>(({
  columns = 'repeat(2, 50%)',
  editorTabsElement,
  editorTextAreaElement,
  editorRight,
  closeButtonElement,
}:IGrid) => {

  return (<Box display='flex' flexDir='column' h={'100%'}>
      <Flex>
        <Box sx={{width: 'calc(100% - 2rem)'}}>{editorTabsElement}</Box>
        <Center>{closeButtonElement}</Center>
      </Flex>
      <Box display='grid' gridTemplateColumns={columns} h={'100%'}>
        {editorTextAreaElement}
        <Box>{editorRight}</Box>
      </Box>
    </Box>
  )
})