import React, { createContext, useContext } from 'react';
import { Center, Text, Box } from '@chakra-ui/react';
import { Resize } from '../resize';
import ReactResizeDetector from 'react-resize-detector';

const RecursionContext = createContext(false);

export const EditorComponentView = React.memo<any>(({
  onChangeSize,
  size,
  fillSize,
  setFillSize,
  children,
}:{
  onChangeSize?: (size: { width: number, height: number }) => any;
  size?: {width: number, height: number};
  setFillSize?: (fillSize: boolean) => any;
  fillSize: boolean;
  children?: any;
}) => {
  const recursionContext = useContext(RecursionContext);

  return(
    <RecursionContext.Provider value={true}>
      <Center position='absolute' top={0} left={0} width='100%' height='100%'>
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
          >{size.height} px</Text>
          {!!fillSize && <Resize size={size} onChangeSize={onChangeSize}>
            {!recursionContext && children}
          </Resize>}
          {!fillSize && <div>
            <ReactResizeDetector handleWidth handleHeight onResize={(w, h) => onChangeSize({width: w, height: h})} />
            {!recursionContext && <>
              {children}
            </>}
          </div>}
          <Text
            fontSize='xs'
            color='#605c60'
            sx={{
              position: 'absolute',
              top: -4.5
            }}
          >{size.width} px</Text>
        </Box>
      </Center>
    </RecursionContext.Provider>
  )
})
