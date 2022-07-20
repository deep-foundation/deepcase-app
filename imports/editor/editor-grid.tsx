import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from 'next/dynamic';
import React from 'react';
import { Box } from '../framework';

interface IGrid {
  columns?: any;
  editorTabsElement?: any;
  editorTextAreaElement?: any;
  editorRight?: any;
}


export const EditorGrid = React.memo<any>(({
  columns = 'repeat(2, 50%)',
  editorTabsElement,
  editorTextAreaElement,
  editorRight,
}:IGrid) => {

  return (<Box display='flex' flexDir='column'>
      <Box>{editorTabsElement}</Box>
      <Box display='grid' gridTemplateColumns={columns}>
        {editorTextAreaElement}
        <Box>{editorRight}</Box>
      </Box>
    </Box>
  )
})