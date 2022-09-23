import React, { ReactElement, useCallback, useRef, useState } from 'react';
import { chakra, Box, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, useBoolean, useDisclosure, useColorModeValue, Square } from '@chakra-ui/react';
import { useChackraColor } from '../get-color';

export interface ITypeData {
  id?: number;
  src?: string;
}

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
  
const WordPopover = React.memo<any>(({
  text = '', 
  popoverContent,
}:{
  text?: any; 
  popoverContent: ReactElement;
}) => {
  const whiteAlpha = useChackraColor('whiteAlpha.600');
  const blackAlpha = useChackraColor('blackAlpha.300');
  const colorGrayToWhite = useColorModeValue(blackAlpha, whiteAlpha);

  return (<Popover placement='auto' isLazy size='xs'>
    <PopoverTrigger>
      {/* <ButtonWord text={text} /> */}
      <Button 
      variant='text' 
      p={0} 
      lineHeight={1}
      height='auto'
      minWidth='min-content'
      bgColor={colorGrayToWhite} 
      verticalAlign='baseline' 
      fontWeight='inherit' 
      fontSize='inherit' 
    >{text}</Button>
    {/* <Trigger text={text} /> */}
    </PopoverTrigger>
    <PopoverContent>
      <PopoverArrow />
      <PopoverCloseButton />
      <PopoverBody overflowX='hidden' position='relative' width='100%' height='100%'>
        {popoverContent}
      </PopoverBody>
    </PopoverContent>
  </Popover>)
})

const PopContent = React.memo<any>(() => {
  return (<Square size='5rem' bg='goldenrod'>I'm square, but I can be anything</Square>)
})

export const AllText = React.memo<any>(({data}:{data: ITypeData}) => {
  
  return (<Box as='main' pos='relative'>
      <Text fontSize='sm'>Lorem ipsum dolor sit amet, consectetur <WordPopover popoverContent={<PopContent />} text='catch' /> elit. Sed ac justo ultrices lacus luctus mattis. Quisque hendrerit molestie feugiat. Fusce aliquet tellus sed ex congue, vel commodo mauris dictum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac <WordPopover popoverContent={<PopContent />} text='me' /> egestas. Nulla eleifend ante nulla, sit amet iaculis lacus vulputate in. Proin ipsum lorem, vulputate ac mauris eu, facilisis aliquet magna. Vestibulum dignissim lacinia varius. Sed gravida quam vitae posuere <WordPopover popoverContent={<PopContent />} text='if' />. Phasellus lacus mauris, <WordPopover popoverContent={<PopContent />} text='you' /> eu rhoncus a, pulvinar a ante. Aliquam eu nibh euismod enim porta semper at auctor nisl. Aliquam <WordPopover popoverContent={<PopContent />} text='can' /> varius sapien vitae fermentum. Aliquam rhoncus erat et dui luctus sagittis. Phasellus quis tellus vulputate, pretium ligula ut, iaculis quam. Sed accumsan egestas bibendum. Sed sed finibus eros.</Text>
    </Box>
  );
});