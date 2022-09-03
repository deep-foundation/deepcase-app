import React, { useCallback, useRef, useState } from 'react';
import { chakra, Box, Button, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Text, useBoolean, useDisclosure, useColorModeValue } from '@chakra-ui/react';
import { useChackraColor } from '../get-color';
import { TypeIcon } from '../cyto-react-links-card';

interface ITypeData {
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
  selectedLinkId = 0,
  data,
}:{
  text?: any; 
  selectedLinkId?: number;
  data: ITypeData[];
}) => {
  const whiteAlpha = useChackraColor('whiteAlpha.600');
  const blackAlpha = useChackraColor('blackAlpha.300');
  const colorGrayToWhite = useColorModeValue(blackAlpha, whiteAlpha);
  const borderColorSelected = useChackraColor('primary');
  // const colorWhiteToGray = useColorModeValue(gray900, white);

  const [selectedLink, setSelectedLink] = useState(selectedLinkId);

  const selectLink = useCallback((linkId) => {
    setSelectedLink((prevLinkId) => prevLinkId == linkId ? 0 : linkId);
  }, []);

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
      {/* <PopoverCloseButton /> */}
      <PopoverBody
        display='flex'
        overflowX='scroll'
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
      </PopoverBody>
    </PopoverContent>
  </Popover>)
})

export const AllText = React.memo<any>(({data}:{data: ITypeData}) => {
  
  return (<Box as='main' pos='relative'>
      <Text fontSize='sm'>Lorem ipsum dolor sit amet, consectetur <WordPopover data={data} text='catch' /> elit. Sed ac justo ultrices lacus luctus mattis. Quisque hendrerit molestie feugiat. Fusce aliquet tellus sed ex congue, vel commodo mauris dictum. Pellentesque habitant morbi tristique senectus et netus et malesuada fames ac <WordPopover data={data} text='me' /> egestas. Nulla eleifend ante nulla, sit amet iaculis lacus vulputate in. Proin ipsum lorem, vulputate ac mauris eu, facilisis aliquet magna. Vestibulum dignissim lacinia varius. Sed gravida quam vitae posuere <WordPopover data={data} text='if' />. Phasellus lacus mauris, <WordPopover data={data} text='you' /> eu rhoncus a, pulvinar a ante. Aliquam eu nibh euismod enim porta semper at auctor nisl. Aliquam <WordPopover data={data} text='can' /> varius sapien vitae fermentum. Aliquam rhoncus erat et dui luctus sagittis. Phasellus quis tellus vulputate, pretium ligula ut, iaculis quam. Sed accumsan egestas bibendum. Sed sed finibus eros.</Text>
    </Box>
  );
});