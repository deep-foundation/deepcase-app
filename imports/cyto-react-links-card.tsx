import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsCheck2, BsDoorClosed, BsGrid3X2Gap, BsListUl, BsSearch } from 'react-icons/bs';
import { DotsLoader } from './dot-loader';
import { Box, Center, Flex, IconButton, ScaleFade, SlideFade, Spacer, Text, useColorModeValue, InputGroup, Input, InputRightElement, Divider } from './framework';
import { useChackraColor, useChackraGlobal } from './get-color';

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

const GridPanel = React.memo<any>(({
  borderColor,
  borderColorSelected,
  data,
  selectedLink,
  onSelectLink,
}:{
  borderColor?: string;
  borderColorSelected?: string;
  data: IGridPanel[];
  selectedLink: number;
  onSelectLink?: (linkId: number) => any;
}) => {
  return (
    <Box display='grid' gridTemplateColumns='repeat( auto-fill, minmax(.5rem, 1.5rem) )' pl='2' pr='2' columnGap={2} rowGap={2}>
      {data.map(d => (<Box
        as='button'
        arial-label='type button'
        key={d.id}
        borderRadius='full'
        boxSize='1.5rem'
        borderWidth={selectedLink === d.id ? 2 : 1}
        borderStyle='solid'
        borderColor={selectedLink === d.id ? borderColorSelected : borderColor}
        display='flex'
        justifyContent='center'
        alignItems='center'
        _hover={{
          borderColor: 'primary'
        }}
        onClick={() => { onSelectLink && onSelectLink(d.id); }}
      >
        {d.src}
      </Box>))}
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
      <Box as='button' arial-label='type button' mr={2} ml={2} borderRadius='full' boxSize='1.5rem' borderWidth='1px' borderStyle='solid' borderColor={borderColor} display='flex' justifyContent='center' alignItems='center'>
        {src}
      </Box>
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
  setSearch,
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
  setSearch?: any;
}) => {
  const [switchLayout, setSwitchLayout] = useState('grid');
  const [selectedLink, setSelectedLink] = useState(0);
  const inputRef = useRef(null);

  const globalStyle = useChackraGlobal();
  const textColor = useChackraColor(globalStyle.body.color);
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const colorBorderSelected = useChackraColor('primary');
  const colorGrayToWhite = useColorModeValue(white, gray900);
  const colorFocus = useColorModeValue(white, gray900);
  const colorWhiteToGray = useColorModeValue(gray900, white);

  useEffect(() => {
    inputRef.current.focus();
  })

  const selectLink = useCallback((linkId) => {
    setSelectedLink((prevLinkId) => prevLinkId == linkId ? 0 : linkId);
  }, []);

  return (<Box pos='relative'>
      <Box
        bg={colorGrayToWhite} 
        maxW='md'
        maxH='lg'
        h='72'
        w='96'
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
              onChange={setSearch}
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
              top: '0.4rem',
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
              top: '0.4rem',
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
    </Box>
  );
})