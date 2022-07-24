import React, { useState } from 'react';
import { Resizable } from 're-resizable';
import { Hide, Text } from './framework';

export const Resize = React.memo<any>(({ 
  onResize,
  defaultSize,
  children 
}:{ 
  onResize?: () => any;
  defaultSize?: any;
  children: any 
}) => {
  return <>
    <Hide above='sm'><div style={{
      position: 'fixed',
      bottom: 0, left: 0,
      width: '100vw', height: 'calc(100vh - 48px)'
    }}>{children}</div></Hide>
    <Hide below='sm'>
      <Resizable
        onResize={() => onResize()}
        defaultSize={defaultSize}
        style={{border: '1px dashed #605c60'}}
      >
        {children}
      </Resizable>
    </Hide>
  </>;
});