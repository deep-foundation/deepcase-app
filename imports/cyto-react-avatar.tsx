import React from 'react';
import { Avatar } from '@chakra-ui/react';


export const CytoReactLinkAvatar = React.memo<any>(({
  emoji,
  name,
  src,
}: {
  emoji?: string;
  name?: string;
  src?: string;
}) => {
  return src
    ? <Avatar src={src} />
    : emoji
    ? <Avatar name={emoji} getInitials={str => str} />
    : name
    ? <Avatar name={name} />
    : <Avatar name={'?'} />
});