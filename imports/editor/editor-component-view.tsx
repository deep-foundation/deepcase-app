import React from 'react';
import { Center, Text } from '../framework';
import { Resize } from '../resize';


export const EditorComponentView = React.memo<any>(({
  onChangeSize,
  defaultSize,
}:{
  onChangeSize?: (size: { width: number, height: number }) => any;
  defaultSize?: {width: number, height: number};
}) => {
  return(<Center position='absolute' top={0} left={0} width='100%'>
      <Text
        fontSize='xs'
        color='#605c60'
        sx={{
          transform: 'rotate(-90deg)'
        }}
      >{defaultSize.height} px</Text>
      <Resize defaultSize={defaultSize} onChangeSize={onChangeSize}>
        <Center>123</Center>
      </Resize>
      <Text
        fontSize='xs'
        color='#605c60'
        sx={{
          position: 'absolute',
          top: -7
        }}
      >{defaultSize.width} px</Text>
    </Center>
  )
})