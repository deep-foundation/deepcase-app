import React, { useState } from 'react';
import { Resizable } from 're-resizable';

export const Resize = React.memo<any>(({ 
  onChangeSize,
  size,
  fillSize = true,
  children 
}:{ 
  onChangeSize?: (size: { width: number, height: number }) => any;
  size?: any;
  fillSize?: boolean;
  children: any 
}) => {
  return <>
    <Resizable
      onResize={(e, direction, ref: any, d) => onChangeSize({width: ref.offsetWidth, height: ref.offsetHeight})}
      size={size}
      style={{border: '1px dashed #605c60'}}
    >
      {children}
    </Resizable>
  </>;
});