import React, { useRef, useState } from 'react';
import { IconButton, useColorModeValue, Popover, PopoverBody, PopoverCloseButton, PopoverContent, PopoverTrigger, Textarea, Spinner } from './framework';
import { TiArrowBackOutline } from 'react-icons/ti';
import { IoIosSend } from 'react-icons/io';
import { BsCheck2 } from 'react-icons/bs';
import { useChackraColor } from './get-color';


export const MessageTextArea = React.memo(() => {
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const whiteAlpha = useChackraColor('whiteAlpha.400');
  const colorGrayToWhite = useColorModeValue(gray900, white);
  const colorWhiteToGray = useColorModeValue(white, gray900);

  const initialFocusRef = useRef();
  const [value, setValue] = useState('');

  const handleInputChange = (e) => {
    let inputValue = e.target.value
    setValue(inputValue)
  };

  return (<Popover 
    isLazy
    placement='right-start'
    initialFocusRef={initialFocusRef} 
    colorScheme={colorGrayToWhite} 
    // styleConfig={{borderColor: 'none'}}
  >
    <PopoverTrigger>
      <IconButton 
        aria-label='replay to message button' 
        variant='unstyled' 
        colorScheme='current'
        isRound 
        sx={{
          height: 5,
          _hover: {
            transform: 'scale(1.2)',
          }
        }}
        icon={<TiArrowBackOutline />} 
        // onClick={() => console.log('replay')} 
      />
    </PopoverTrigger>
    <PopoverContent color={white}>
      <PopoverBody p={0} color={white}>
        <Textarea
          ref={initialFocusRef}
          colorScheme={colorWhiteToGray}
          value={value}
          onChange={handleInputChange}
          focusBorderColor='transparent'
          placeholder='Write the answer' />
      </PopoverBody>
      <PopoverCloseButton 
        size='lg' 
        p={1} 
        right={1} 
        top='110%' 
        bg={colorWhiteToGray}
        _hover={{
          bg: 'primary'
        }}
        borderRadius='full'
        borderStyle='solid'
        borderColor={whiteAlpha}
        borderWidth={1}
        onClick={() => console.log('send')}
      >
        <IoIosSend color={colorGrayToWhite} size='1.5em' />
      </PopoverCloseButton>
      <PopoverCloseButton 
        p={1} 
        size='lg' 
        right={14} 
        top='110%' 
        bg={colorWhiteToGray}
        _hover={{
          bg: 'primary'
        }}
        borderRadius='full' 
        borderStyle='solid'
        borderColor={whiteAlpha}
        borderWidth={1}
        onClick={() => console.log('spinner')}
      >
        <Spinner 
          color='primary' 
          size='md' 
          _hover={{
            color: white 
          }}
        />
      </PopoverCloseButton>
      <PopoverCloseButton 
        size='lg'
        p={1} 
        right={28} 
        top='110%' 
        bg={colorWhiteToGray}
        _hover={{
          bg: 'primary'
        }}
        borderRadius='full' 
        borderStyle='solid'
        borderColor={whiteAlpha}
        borderWidth={1}
        onClick={() => console.log('check')}
      >
        <BsCheck2 color={colorGrayToWhite} size='1.5em' />
      </PopoverCloseButton>
    </PopoverContent>
  </Popover>)
})