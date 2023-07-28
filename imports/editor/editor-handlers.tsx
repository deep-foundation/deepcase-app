import React from 'react';
import { VscAdd } from 'react-icons/vsc';
import { Flex, Box, Button, Divider, ButtonGroup, Spacer } from '@chakra-ui/react';


export const EditorHandlers = React.memo<any>(({
  children,
  onAddHandler,
  generated,
  setGenerated,
}:{
  children?: any;
  onAddHandler?: (id: number) => void;
  generated?: string;
  setGenerated?: (generated: string) => void;
}) => {
  return (<Flex direction='column'>
    <Flex
      w='100%'
      textAlign='right'
      px={4} py={2}
    >
      <ButtonGroup size='sm' isAttached variant='outline'>
        <Button
          isDisabled={generated === 'src'}
          onClick={() => setGenerated('src')}
        >src</Button>
        <Button
          isDisabled={generated === 'dist'}
          onClick={() => setGenerated('dist')}
        >dist</Button>
      </ButtonGroup>
      <Spacer />
      <ButtonGroup size='sm' isAttached variant='outline'>
        <Button
          rightIcon={<VscAdd />}
        >handler</Button>
      </ButtonGroup>
    </Flex>
    <Divider />
    <Box overflowY='scroll'>{children}</Box>
  </Flex>);
})