import React, { useCallback, useRef } from 'react';
import { chakra, Box, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, useBoolean, useDisclosure } from '@chakra-ui/react';


const ButtonWord = React.memo<any>(({text = 'Trigger'}:{text?: any;}) => {
  return <Button 
      variant='text' 
      p={0} 
      height='auto'
      minWidth='min-content'
      bgColor='whiteAlpha.600' 
      verticalAlign='baseline' 
      fontWeight='inherit' 
      fontSize='inherit' 
    >{text}</Button>
});

const Trigger = chakra(ButtonWord);
  
const WordPopover = React.memo<any>(({text = ''}:{text?: any;}) => {


  return (<Popover placement='auto' isLazy>
    <PopoverTrigger>
      {/* <ButtonWord text={text} /> */}
      <Button 
      variant='text' 
      p={0} 
      lineHeight={1}
      height='auto'
      minWidth='min-content'
      bgColor='blackAlpha.300' 
      verticalAlign='baseline' 
      fontWeight='inherit' 
      fontSize='inherit' 
    >{text}</Button>
    {/* <Trigger text={text} /> */}
    </PopoverTrigger>
    <PopoverContent>
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverHeader>Confirmation!</PopoverHeader>
      <PopoverBody>Are you sure you want to have that milkshake?</PopoverBody>
    </PopoverContent>
  </Popover>)
})

export const AllText = React.memo<any>(() => {
  
  return (<Box as='main' pos='relative'>
      <Text fontSize='sm'>Lorem ipsum dolor sit amet, consectetur <WordPopover text='catch' /> elit. Sed ac justo ultrices lacus luctus mattis. Quisque hendrerit molestie feugiat. Fusce aliquet tellus sed ex congue, vel commodo mauris dictum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac <WordPopover text='me' /> egestas. Nulla eleifend ante nulla, sit amet iaculis lacus vulputate in. Proin ipsum lorem, vulputate ac mauris eu, facilisis aliquet magna. Vestibulum dignissim lacinia varius. Sed gravida quam vitae posuere <WordPopover text='if' />. Phasellus lacus mauris, <WordPopover text='you' /> eu rhoncus a, pulvinar a ante. Aliquam eu nibh euismod enim porta semper at auctor nisl. Aliquam <WordPopover text='can' /> varius sapien vitae fermentum. Aliquam rhoncus erat et dui luctus sagittis. Phasellus quis tellus vulputate, pretium ligula ut, iaculis quam. Sed accumsan egestas bibendum. Sed sed finibus eros.</Text>
    </Box>
  );
});