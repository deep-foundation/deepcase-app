import { Box, Flex, Popover, PopoverArrow, PopoverBody, PopoverContent, PopoverTrigger, Text, Textarea, useColorModeValue } from '@chakra-ui/react';
import { AnimatePresence } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { TypeIcon } from '../cyto-react-links-card';
import { useChackraColor } from '../get-color';
import { ITypeData } from '../popover-text/popover-text';


const variants = {
  opened: {
    opacity: 1
  },
  exited: {
    opacity: 0,
    transition: { duration: 0.9 }
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
  // children,
  data,
}:{
  // children?: any;
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

  const [isOpen, setIsOpen] = React.useState(false)
  const open = () => setIsOpen(!isOpen)
  const close = () => setIsOpen(false)

  return (<Popover
      returnFocusOnClose={false}
      isOpen={isOpen}
      onOpen={open}
      onClose={close}
      placement='right'
      closeOnBlur={false}
      size='sm'
      arrowShadowColor='none'
      
    >
      <PopoverTrigger>
        <Box w='max-content' h='100%'>Popover Target</Box>
      </PopoverTrigger>
      <PopoverContent sx={{ 
          // boxShadow: '0 0 0',
          // '[data-focus-visible]': {
          //   borderColor: 'none'
          // }
        }}
        _focusVisible={{boxShadow: '0 0 0', outlineColor: 'transparent', border: 'none',}}
      >
        <PopoverArrow />
        <PopoverBody 
          overflow='scroll'
          sx={{
            p: 1.5,
            overscrollBehavior: 'contain', 
            boxSizing: 'border-box',
            '::-webkit-scrollbar': {
              display:'none',
              // width: '100%',
              // height: '3px',
              // borderRadius: '2px',
              // backgroundColor: `rgba(194, 219, 245, 0.5)`,
            },
            // '&::-webkit-scrollbar-thumb': {
            //   backgroundColor: 'red',
            // },
          }}
        >
          <Box
            w='max-content'
            h='100%'
          >
            <Flex 
              sx={{
                '& > *:not(:last-of-type)': {
                  mr: '0.4rem',
                }
              }}
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
            </Flex>
          </Box>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  )
})

export const TooltipExample = React.memo(({
  // data, 
  open
}:{
  // data: ITypeData[]; 
  open?: any;
}) => {
  return (
    // <TooltipEmoji data={data}>
      <Text onClick={open} as='div' fontSize='xl'>Tooltip</Text>
    // </TooltipEmoji>
  )
})
