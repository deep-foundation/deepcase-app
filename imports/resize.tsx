import React, { useState } from 'react';
import { Resizable } from 're-resizable';
import { motion } from 'framer-motion';

export const Resize = React.memo<any>(({ 
  onChangeSize,
  size,
  fillSize = true,
  children,
  style 
}:{ 
  onChangeSize?: (size: { width: number, height: number }) => any;
  size?: any;
  fillSize?: boolean;
  children: any;
  style?: any;  
}) => {
  return <>
    <Resizable
      as={motion.div}
      // layout="size"
      onResize={(e, direction, ref: any, d) => onChangeSize({width: ref.offsetWidth, height: ref.offsetHeight})}
      size={size}
      style={{border: '1px dashed #605c60', ...style}}
    >
      {children}
    </Resizable>
  </>;
});