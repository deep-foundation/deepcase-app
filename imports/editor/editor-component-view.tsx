import React from 'react';
import { Center, Text, Box } from '../framework';
import { Resize } from '../resize';


export const EditorComponentView = React.memo<any>(({
  onChangeSize,
  defaultSize,
}:{
  onChangeSize?: (size: { width: number, height: number }) => any;
  defaultSize?: {width: number, height: number};
}) => {
  return(<Center position='absolute' top={0} left={0} width='100%' height='100%'>
      <Box pos='relative'>
        <Text
          fontSize='xs'
          color='#605c60'
          sx={{
            transform: 'rotate(-90deg)',
            position: 'absolute',
            top: 3,
            left: -7,
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
            top: -4.5
          }}
        >{defaultSize.width} px</Text>
      </Box>
    </Center>
  )
})