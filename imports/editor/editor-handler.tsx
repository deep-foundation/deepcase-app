import React from 'react';
import { VscAdd } from 'react-icons/vsc';
import { CytoReactLinkAvatar } from '../cyto-react-avatar';
import { Flex, Box, HStack, Text, Divider, VStack, Select } from '../framework';

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

export const EditorHandlers = React.memo(({
  id,
  avatarElement,
  title,
  reasons,
  onChangeReason,
  sync,
  onChangeSync,
  children,
}:IHandler) => {
  return (<Flex overflowY='hidden'>
      <VStack>
        <HStack
          w='100%'
        >
          {avatarElement}
          <Text fontSize='sm'>{title}</Text>
        </HStack>
        <HStack
          w='100%'
        >
          <Select variant='outline' placeholder='type'>
            {reasons.map(r => (
              <option key={r.id} value={r.id}>{r.name}</option>
            ))}
          </Select>
          <Text fontSize='sm'>{title}</Text>
        </HStack>

      </VStack>    
      <Divider />
      <Box
        overflowY='scroll'
      >{children}</Box>
    </Flex>
  )
})