import { Tag, TagLabel, TagLeftIcon } from '@chakra-ui/react';
import React from 'react';
import { TbAtom } from 'react-icons/tb';

export const TagLink = React.memo<any>(({
  size='sm',
  borderRadius='full',
  version, 
  key,
  hrefSpace = '/',
  leftIcon = TbAtom,
  onClick,
}:{
  size?: string;
  borderRadius?: string;
  version: string; 
  key?: any;
  hrefSpace?: string;
  leftIcon?: any;
  onClick?: any;
}) => {
  return (<a href={hrefSpace} onClick={onClick}>
      <Tag size={size} key={key} variant='subtle' colorScheme='blue' borderRadius={borderRadius}>
        <TagLeftIcon as={leftIcon} />
        <TagLabel>{version}</TagLabel>
      </Tag>
    </a>
  )
})