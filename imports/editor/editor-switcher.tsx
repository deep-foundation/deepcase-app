import React from 'react';
import { HStack, Button, useColorMode } from '../framework';


export const EditorSwitcher = React.memo(({
  setArea,
  rightArea, 
}:{
  setArea?: (e: any) => any; 
  rightArea?: string;
}) => {
  const { colorMode } = useColorMode();

  return(
    <HStack 
      spacing={4} 
      width='100%' 
      justifyContent='flex-end' 
      pr={4} py={2} 
      borderTopStyle='solid' 
      borderTopWidth={1} 
      borderTopColor={colorMode == 'light' ? 'blackAlpha.200' : 'whiteAlpha.200'}
    >
      <Button 
        aria-label='Preview area' 
        bg='cyan.400' 
        size='xs' 
        value='preview'
        onClick={() => setArea('preview')}
      >Preview</Button>
      <Button 
        aria-label='Handlers area' 
        bg='cyan.400' 
        size='xs' 
        value='handlers'
        onClick={() => setArea('handlers')}
      >Handlers</Button>
    </HStack>
  )
})