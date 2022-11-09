import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ITypeData } from '../popover-text/popover-text';
import { useChackraColor } from '../get-color';
import { useColorModeValue, Box, Textarea, Text, Tooltip, Flex, Button, ButtonGroup, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverFooter, PopoverHeader, PopoverTrigger } from '@chakra-ui/react';
import { TypeIcon } from '../cyto-react-links-card';
import { AnimatePresence, motion } from 'framer-motion';


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

  return (<AnimatePresence>

      <Popover
        returnFocusOnClose={false}
        isOpen={isOpen}
        onClose={close}
        placement='right'
        closeOnBlur={false}
      >
        <PopoverTrigger>
          <Button colorScheme='pink'>Popover Target</Button>
        </PopoverTrigger>
        <PopoverContent>
          <PopoverArrow />
          <PopoverBody>
            <Box
              overflow='hidden'
              h='100%'
            >
              <Flex overflowX='scroll'>
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
      {/* <Tooltip 
        as={motion.div}
        initial="exited"
        animate="opened"
        exit="exited"
        variants={variants}
        sx={{position: 'relative'}}
        label={<Box
            overflow='hidden'
            h='100%'
          >
            <Flex overflowX='scroll'>
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
        }
      >
        {children}
      </Tooltip> */}
    </AnimatePresence>
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
