import React from 'react';
import { VscAdd } from 'react-icons/vsc';
import { CytoReactLinkAvatar } from '../cyto-react-avatar';
import { Flex, Box, HStack, Text, Divider, VStack, Select, useColorMode, Container, Switch } from '../framework';

interface IReason {
  id?: number;
  name?: string;
}

interface IHandler {
  id?: number;
  avatarElement?: any;
  title?: string;
  reasons?: IReason[];
  onChangeReason?: (reasonId?: number) => void;
  sync?: boolean;
  onChangeSync?: (sync?: boolean) => void;
  children?: any;
}

export const EditorHandler = React.memo<any>(({
  id,
  avatarElement,
  title,
  reasons,
  onChangeReason,
  sync,
  onChangeSync,
  children,
}:IHandler) => {
  const { colorMode } = useColorMode();

  return (<Box borderStyle='solid' borderWidth={1} borderColor={colorMode == 'light' ? 'blackAlpha.200' : 'whiteAlpha.200'} m={4} >
      <VStack overflowY='hidden' p='4' spacing={4}>
        <VStack w='100%' spacing={4} >
          <HStack
            w='100%'
          >
            {avatarElement}
            <Text fontSize='sm'>{title}</Text>
          </HStack>
          <HStack
            w='100%'
            spacing={6}
          >
            <HStack>
              <Text fontSize='sm'>on</Text>
              <Select size='sm' variant='outline' placeholder='type'>
                {reasons.map(r => (
                  <option key={r.id} value={r.id}>{r.name}</option>
                ))}
              </Select>
            </HStack>
            <HStack>
              <Text fontSize='sm'>sync</Text>
              <Switch 
                color='primary' 
                size='md' 
                isChecked={sync}
                onChange={() => onChangeSync()}
              />
            </HStack>
          </HStack>

        </VStack>    
        <Divider />
        <Box overflowY='scroll'>{children}</Box>
      </VStack>
    </Box>
  )
})