import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ITypeData } from '../popover-text/popover-text';
import { useChackraColor } from '../get-color';
import { useColorModeValue, Box, Textarea, Text, Tooltip } from '@chakra-ui/react';
import { TypeIcon } from '../cyto-react-links-card';
import { AnimatePresence, motion } from 'framer-motion';


const variants = {
  opened: {
      opacity: 1
  },
  exited: {
      opacity: 0
  }
};

export const TextInput = React.memo<any>(() => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>();
  // const { ref: inputRef, updateCaret } = useCaretPosition();

  const handleInputChange = (e) => {
    let inputValue = e.target.value
    setValue(inputValue);
  }
  
  useEffect(() => {
    let position = inputRef?.current?.selectionStart;
    console.log(position);
  })

  return (<Textarea
    ref={inputRef}
    value={value}
    onChange={(e) => handleInputChange(e)}
    placeholder='Here is a sample placeholder'
    size='sm'
  />)
})

export const TooltipEmoji = React.memo<any>(({
  selectedLinkId = 0,
  children,
  data,
}:{
  children: any;
  selectedLinkId?: number;
  data: ITypeData[];
}) => {
  const whiteAlpha = useChackraColor('whiteAlpha.600');
  const blackAlpha = useChackraColor('blackAlpha.300');
  const borderColorSelected = useChackraColor('primary');
  const colorGrayToWhite = useColorModeValue(blackAlpha, whiteAlpha);

  const [selectedLink, setSelectedLink] = useState(selectedLinkId);

  const selectLink = useCallback((linkId) => {
    setSelectedLink((prevLinkId) => prevLinkId == linkId ? 0 : linkId);
  }, []);

  return (<AnimatePresence>
      <Tooltip 
        as={motion.div}
        initial="exited"
        animate="opened"
        exit="exited"
        variants={variants}
        sx={{position: 'relative'}}
        label={<Box
          display='flex'
          overflowX='scroll'
          width='100rem'
          // pos='absolute'
          h='100%'
        >
          {data.map((t) => <TypeIcon 
            key={t.id} 
            src={t.src} 
            borderWidth={selectedLink === t.id ? 2 : 1}
            borderColor={selectedLink === t.id ? borderColorSelected : colorGrayToWhite}
            _hover={{
              borderColor: 'primary'
            }}
            onClick={selectLink}/>
          )}
        </Box>}
      >
        {/* <Box
          display='flex'
          overflowX='scroll'
          width='100rem'
          pos='absolute'
          h='100%'
        >
          {data.map((t) => <TypeIcon 
            key={t.id} 
            src={t.src} 
            borderWidth={selectedLink === t.id ? 2 : 1}
            borderColor={selectedLink === t.id ? borderColorSelected : colorGrayToWhite}
            _hover={{
              borderColor: 'primary'
            }}
            onClick={selectLink}/>
          )}
        </Box> */}
        {children}
      </Tooltip>
    </AnimatePresence>
  )
})

export const TooltipExample = React.memo(({data}:{data: ITypeData[];}) => {
  return (<TooltipEmoji data={data}><Text as='div' fontSize='xl'>Tooltip</Text></TooltipEmoji>)
})