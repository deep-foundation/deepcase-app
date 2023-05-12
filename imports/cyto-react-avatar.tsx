import React from 'react';
import { Avatar } from '@chakra-ui/react';


export const CytoReactLinkAvatar = React.memo<any>(({
  emoji,
  name,
  src,
  size,
}: {
  emoji?: string;
  name?: string;
  src?: string;
  size?: string;
}) => {
  return src
    ? <Avatar src={src} size={size} />
    : emoji
    ? <Avatar name={emoji} getInitials={str => str} size={size} />
    : name
    ? <Avatar name={name} size={size} />
    : <Avatar name={'?'} size={size} />
});