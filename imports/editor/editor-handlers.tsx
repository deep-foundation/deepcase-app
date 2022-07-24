import React from 'react';
import { VscAdd } from 'react-icons/vsc';
import { Flex, Box, Button, Divider } from '../framework';


export const EditorHandlers = React.memo(({
  children,
  onAddHandler,
}:{
  children?: any;
  onAddHandler?: (id: number) => void;
}) => {
  return (<Flex direction='column'>
      <Box
        w='100%'
        textAlign='right'
      >
        <Button 
          rightIcon={<VscAdd />} 
          colorScheme='blue'
          fontSize='sm' 
          variant='ghost'>handler</Button>
      </Box>
      <Divider />
      <Box overflowY='scroll'>{children}</Box>
    </Flex>
  )
})