import { Box, Button, Center, Flex, IconButton, Input, InputGroup, InputRightElement, ScaleFade, SlideFade, Spacer, Text, useColorModeValue } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { BsCheck2, BsDoorClosed, BsGrid3X2Gap, BsListUl, BsSearch } from 'react-icons/bs';
import { DotsLoader } from './dot-loader';
import { useChackraColor } from './get-color';

interface IGridPanel {
  id?: number;
  src?: string;
  alt?: string;
}

interface IListPanel {
  id?: number;
  src?: string;
  linkName?: string;
  containerName?: string;
}

export interface ITypeIcon {
  src: string;
  borderColor?: any;
  borderWidth?: any;
  boxSize?: string;
  [key: string]: any;
}

const variants = {
  initial: {
    originX: 1, 
    originY: 1, 
    opacity: 0, 
    scale: 0, 
    transformPerspective: 100, 
    z: 0, 
    y: 0,
  },
  view: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
      // delay: 0.2,
    }
  },
  hide: {
    originX: 0,
    originY: 0,
    opacity: 0, scale: 0,
    transition: {
      duration: 0.05,
    }
  }
};

export const TypeIcon = React.memo<any>(({
  src,
  borderColor = 'black',
  borderWidth = '1px',
  boxSize = '1.5rem',
  ...props
}:ITypeIcon) => {
  return <Box 
      as={motion.div} 
      arial-label='type button' 
      variants={variants}
      initial='initial'
      whileInView='view'
      whileHover={{
        y: 1,
        z: 10,
        transformPerspective: 400}}
      exit='hide'
      borderRadius='full' 
      boxSize={boxSize}
      borderWidth={borderWidth} 
      borderStyle='solid' 
      borderColor={borderColor} 
      display='flex' 
      justifyContent='center' 
      alignItems='center'
      {...props}
    >
      {src}
    </Box>
})

export const GridPanel = React.memo<any>(({
  borderColor,
  borderColorSelected,
  data,
  selectedLink,
  onSelectLink,
  gridTemplateColumns = 'repeat( auto-fill, minmax(.5rem, 1.5rem) )',
  columnGap = 2,
  rowGap = 2,
}:{
  borderColor?: string;
  borderColorSelected?: string;
  data: IGridPanel[];
  selectedLink: number;
  onSelectLink?: (linkId: number) => any;
  gridTemplateColumns?: string;
  columnGap?: number;
  rowGap?: number;
}) => {
  return (
    <Box display='grid' gridTemplateColumns={gridTemplateColumns} p='2' columnGap={columnGap} rowGap={rowGap}>
      {data.map(d => (<TypeIcon
        key={d.id}
        borderWidth={selectedLink === d.id ? 2 : 1}
        borderColor={selectedLink === d.id ? borderColorSelected : borderColor}
        _hover={{
          borderColor: 'primary'
        }}
        onClick={() => { onSelectLink && onSelectLink(d.id); }}
        src={d.src}
      />))}
    </Box>
  )
})

const CytoListItem = React.memo<any>(({
  id,
  src,
  linkName, 
  containerName,
  borderColor,
  selectedLink,
  onSelectLink,
}:{
  id?: number;
  src?: string;
  linkName?: string;
  containerName?: string;
  borderColor?: string;
  selectedLink: number;
  onSelectLink?: (linkId: number) => any;
}) => {

  return (
    <Box 
      as='li' 
      display='flex' 
      w='100%'
      alignItems='center'
      onClick={() => onSelectLink && onSelectLink(id)}
      _hover={{
        bg: 'primary'
      }}
      bg={selectedLink === id ? 'primary' : 'none'}
    >
      <TypeIcon borderColor={borderColor} src={src} mr={2} ml={2} />
      <Flex direction='column' align='flex-start'>
        <Text fontSize='sm'>{linkName}</Text>
        <Text fontSize='xs'>{containerName}</Text>
      </Flex>
    </Box>
  )
})

const ListPanel = React.memo<any>(({
  borderColor,
  data,
  onSelectLink,
  selectedLink,
}: {
  borderColor?: string;
  data: IListPanel[];
  onSelectLink?: (linkId: number) => any;
  selectedLink: number;
}) => {

  return (<Flex direction='column' gap={3}>
      {data.map(d => (<CytoListItem key={d.id} {...d} borderColor={borderColor} onSelectLink={onSelectLink} selectedLink={selectedLink} />))}
    </Flex>
  )
})

export const NoResults = React.memo<any>(() => {
  return (<Center height='100%' width='100%'>
      <Text fontSize='xs'>Not founded</Text>
    </Center>
  )
})

export const CytoReactLinksCard = React.memo<any>(({
  elements = [],
  onSubmit,
  onClose,
  loading = false,
  noResults,
  search, 
  onSearch,
  fillSize=false,
  selectedLinkId = 0,
}: {
  elements: {
    id: number;
    src: string;
    linkName: string;
    containerName: string;
  }[];
  onSubmit?: (id: number) => any;
  onClose?: () => any;
  loading?: boolean;
  noResults: any;
  search?: any;
  onSearch?: any;
  fillSize?: boolean;
  selectedLinkId?: number;
}) => {
  const [switchLayout, setSwitchLayout] = useState('grid');
  const [selectedLink, setSelectedLink] = useState(selectedLinkId);
  const inputRef = useRef(null);

  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const colorBorderSelected = useChackraColor('primary');
  const colorGrayToWhite = useColorModeValue(white, gray900);
  const colorWhiteToGray = useColorModeValue(gray900, white);

  useEffect(() => {
    inputRef.current.focus();
  }, []);

  const selectLink = useCallback((linkId) => {
    setSelectedLink((prevLinkId) => prevLinkId == linkId ? 0 : linkId);
  }, []);

  useHotkeys('up,right,down,left', e => {
    const searchInput = document.activeElement;
    if (searchInput instanceof HTMLInputElement || searchInput instanceof HTMLTextAreaElement) {
      return;
    }
    
    e.preventDefault();
    e.stopPropagation();
    let index = elements.findIndex(e => e.id == selectedLink);
    if (index === -1) {
      index = 0;
    }
    let next = elements[index];
    if (!selectedLink) {
      setSelectedLink(next.id);
    } else if (e.key == 'ArrowUp' || e.key == 'ArrowLeft') {
      next = elements[index == 0 ? elements.length - 1 : index - 1];
      setSelectedLink(next.id);
    } else if (e.key == 'ArrowDown' || e.key == 'ArrowRight') {
      next = elements[index == elements.length - 1 ? 0 : index + 1];
      setSelectedLink(next.id);
    }
  }, { enableOnFormTags: ["TEXTAREA", "INPUT"] });

  useHotkeys('enter', e => {
    e.preventDefault();
    e.stopPropagation();
    if (selectedLink) {
      onSubmit && onSubmit(selectedLink);
    }
  }, { enableOnFormTags: ["TEXTAREA", "INPUT"] });

  useHotkeys('tab', e => {
    e.preventDefault();
    e.stopPropagation();
    setSwitchLayout((v) => v === 'grid' ? 'list' : 'grid')
  }, { enableOnFormTags: ["TEXTAREA", "INPUT"] });

  return (<>
      <Box
        bg={colorGrayToWhite} 
        maxW='md'
        maxH='lg'
        {...(fillSize ? { h: '100%', w: '100%' } : { h: 72, w: 96 })}
        overflowY='hidden'
        borderWidth='1px' 
        borderColor={colorWhiteToGray} 
        color={colorWhiteToGray} 
        borderRadius='lg' 
        overflow='hidden'
        display='flex'
        flexDir='column'
      >
        <Flex minWidth='max-content' alignItems='center' gap='2' borderBottomStyle='solid' borderBottomWidth='1px' borderBottomColor='gray.200'>
          <InputGroup size='xs' pl='2'>
            <Input 
              ref={inputRef}
              placeholder='search' 
              sx={{borderRadius: 'full'}}
              focusBorderColor='primary'
              value={search}
              onChange={onSearch}
            />
            <InputRightElement children={<BsSearch color='green.500' />} />
          </InputGroup>
          <Spacer />
          <IconButton 
            aria-label='grid layout' 
            variant='ghost' 
            colorScheme='current'
            isRound 
            sx={{
              transform: switchLayout === 'grid' && 'scale(1.2)',
              _hover: {
                transform: 'scale(1.2)',
              }
            }}
            icon={<BsGrid3X2Gap />} 
            onClick={() => setSwitchLayout('grid')} 
          />
          <IconButton 
            aria-label='list layout' 
            variant='ghost' 
            colorScheme='current'
            isRound 
            sx={{
              transform: switchLayout === 'list' && 'scale(1.2)',
              _hover: {
                transform: 'scale(1.2)',
              }
            }}
            icon={<BsListUl />} 
            onClick={() => setSwitchLayout('list')} 
          />
        </Flex>
        {!loading 
        ? <Box pos='relative' w='100%' h="100%">
          <ScaleFade 
            initialScale={0.9} 
            in={switchLayout === 'grid'}
            style={{
              pointerEvents: switchLayout === 'grid' ? 'initial' : 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflowY: 'scroll',
            }}
          >
            <GridPanel 
              data={elements} 
              borderColor={colorWhiteToGray} 
              onSelectLink={selectLink} 
              selectedLink={selectedLink} 
              borderColorSelected={colorBorderSelected} 
            />
          </ScaleFade>
          <ScaleFade 
            initialScale={0.9} 
            in={switchLayout === 'list'}
            style={{
              pointerEvents: switchLayout === 'list' ? 'initial' : 'none',
              position: 'absolute',
              left: 0,
              width: '100%',
              height: '100%',
              overflowY: 'scroll',
            }}
          >
            <ListPanel data={elements} borderColor={colorWhiteToGray} selectedLink={selectedLink} onSelectLink={selectLink}/>
          </ScaleFade>
        </Box>
        : !!noResults 
        ? <NoResults />
        : <Center height='100%'><DotsLoader /></Center>
      }
      </Box>
      <SlideFade in={!!selectedLink} offsetX='-0.5rem' style={{position: 'absolute', bottom: 0, right: '-2.8rem'}}>
        <IconButton
          isRound
          variant='solid'
          bg='primary'
          // color='white'
          aria-label='submit button'
          icon={<BsCheck2 />}
          onClick={() => onSubmit && onSubmit(selectedLink)}
        />
      </SlideFade>
      {!!onClose && <Box pos='absolute' top={0} right='-2.8rem'>
        <IconButton
          isRound
          colorScheme='gray'
          variant='outline'
          aria-label='close button'
          icon={<BsDoorClosed />}
          onClick={() => onClose && onClose()}
        />
    </Box>}
  </>);
})