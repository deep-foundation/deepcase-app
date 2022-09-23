import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ITypeData } from '../popover-text/popover-text';
import { useChackraColor } from '../get-color';
import { useColorModeValue, Box, Textarea } from '@chakra-ui/react';
import { TypeIcon } from '../cyto-react-links-card';


export const TextInput = React.memo<any>(() => {
  const [value, setValue] = useState('');
  const inputRef = useRef<HTMLTextAreaElement>();
  // const { ref: inputRef, updateCaret } = useCaretPosition();

  const handleInputChange = (e) => {
    let inputValue = e.target.value
    setValue(inputValue);
  }
  
  useEffect(() => {
    let position = inputRef.current.selectionStart;
    // function getCaretIndex(element) {
    //   let position = 0;
    //   const isSupported = typeof window.getSelection !== "undefined";
    //   if (isSupported) {
    //     const selection = window.getSelection();
    //     if (selection.rangeCount !== 0) {
    //       const range = window.getSelection().getRangeAt(0);
    //       const preCaretRange = range.cloneRange();
    //       preCaretRange.selectNodeContents(element);
    //       preCaretRange.setEnd(range.endContainer, range.endOffset);
    //       position = preCaretRange.toString().length;
    //     }
    //   }
    //   console.log(position);
    //   return position;
    // }
  })

  return (<Textarea
    ref={inputRef}
    value={value}
    onChange={handleInputChange}
    placeholder='Here is a sample placeholder'
    size='sm'
  />)
})

export const TooltipEmoji = React.memo<any>(({
  selectedLinkId = 0,
  data,
}:{
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

  return (<Box
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
    </Box>
  )
})