import React from 'react';
import { HStack, Button, useColorMode, ButtonGroup, FormControl, FormLabel, Switch } from '@chakra-ui/react';


export const EditorSwitcher = React.memo<any>(({
  area,
  setArea,
  rightArea,
  fillSize,
  setFillSize,
}:{
  area?: string;
  setArea?: (e: any) => any; 
  rightArea?: string;
  setFillSize?: (fillSize: boolean) => any;
  fillSize: boolean;
}) => {
  const { colorMode } = useColorMode();

  return(
    <HStack 
      spacing={4} 
      width='100%' 
      justifyContent='flex-end' 
      px={4} py={2} 
      borderTopStyle='solid' 
      borderTopWidth={1} 
      borderTopColor={colorMode == 'light' ? 'blackAlpha.200' : 'whiteAlpha.200'}
    >
      {area == 'preview' && <>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='show-extra-switch' mb='0'>
            fillSize
          </FormLabel>
          <Switch id='show-extra-switch' isChecked={fillSize} onChange={() => setFillSize(!fillSize)}/>
        </FormControl>
      </>}
      <ButtonGroup size='sm' isAttached variant='outline'>
        <Button 
          aria-label='Preview area'
          value='preview'
          isDisabled={area == 'preview'}
          onClick={() => setArea('preview')}
        >Preview</Button>
        <Button 
          aria-label='Handlers area'
          value='handlers'
          isDisabled={area == 'handlers'}
          onClick={() => setArea('handlers')}
        >Handlers</Button>
        <Button 
          aria-label='Results area'
          value='results'
          isDisabled={true || area == 'results'}
          onClick={() => setArea('results')}
        >Results</Button>
      </ButtonGroup>
    </HStack>
  )
})