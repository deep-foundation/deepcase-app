import React, { useCallback, useState } from 'react';
import { BsGrid3X2Gap, BsListUl } from 'react-icons/bs';
import { Box, Button, Collapse, Flex, IconButton, ScaleFade, Spacer, Text, useColorModeValue } from './framework';
import { useChackraColor, useChackraGlobal } from './get-color';
import { Provider } from './provider';

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

const CytoListItem = React.memo(({
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

export const CytoReactLinksCard = React.memo<any>(({
  elements = [],
  onSubmit
}: {
  elements: {
    id: number;
    src: string;
    linkName: string;
    containerName: string;
  }[];
  onSubmit?: (id: number) => any;
}) => {
  const [switchLayout, setSwitchLayout] = useState('grid');
  const [selectedLink, setSelectedLink] = useState(0);

  const globalStyle = useChackraGlobal();
  const textColor = useChackraColor(globalStyle.body.color);
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const colorBorderSelected = useChackraColor('primary');
  const colorGrayToWhite = useColorModeValue(gray900, white);
  const colorFocus = useColorModeValue(gray900, white);
  const colorWhiteToGray = useColorModeValue(white, gray900);

  const selectLink = useCallback((linkId) => {
    setSelectedLink((prevLinkId) => prevLinkId == linkId ? 0 : linkId);
  }, []);

  return (<Box
    bg={colorGrayToWhite} 
    maxW='sm'
    maxH='md'
    h='36'
    w='52'
    overflowY='hidden'
    borderWidth='1px' 
    borderColor={colorWhiteToGray} 
    color={colorWhiteToGray} 
    borderRadius='lg' 
    overflow='hidden'
    display='flex'
    flexDir='column'
  >
    <Flex minWidth='max-content' alignItems='center' gap='2'>
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
    <Box pos='relative' w='100%' h="100%">
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
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          overflowY: 'scroll',
        }}
      >
        <ListPanel data={elements} borderColor={colorWhiteToGray} selectedLink={selectedLink} onSelectLink={selectLink}/>
      </ScaleFade>
    </Box>
    <Box>
      <Collapse in={!!selectedLink} animateOpacity>
        <Button
          borderTopLeftRadius={0}
          borderTopRightRadius={0}
          borderBottom='none'
          borderLeft='none'
          borderRight='none'
          width='100%'
          arial-label='submit'
          colorScheme={colorGrayToWhite}
          variant='outline'
          onClick={() => onSubmit && onSubmit(selectedLink)}
        >
          <Text fontSize='xs'>Submit</Text>
        </Button>
      </Collapse>
    </Box>
  </Box>);
})