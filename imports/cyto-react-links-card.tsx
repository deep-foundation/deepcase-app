import { Box, Center, Flex, IconButton, Input, InputGroup, InputRightElement, ScaleFade, SlideFade, Spacer, Text, useOutsideClick } from '@chakra-ui/react';
import { motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { BsCheck2, BsDoorClosed, BsGrid3X2Gap, BsListUl, BsSearch } from 'react-icons/bs';
import { TbPackages } from 'react-icons/tb';
import { DotsLoader } from './dot-loader';
import { IPackageProps, PackagesBlock } from './cyto-react-links-packages';

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
  src: string | number;
  borderColor?: any;
  borderWidth?: any;
  boxSize?: string;
  [key: string]: any;
  scrollRef?: any;
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
    background: 'transparent',
  },
  view: {
    opacity: 1,
    scale: 1,
    transition: {
      duration: 0.3,
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
  borderColor = 'borderColor',
  borderWidth = 'thin',
  boxSize = '1.8rem',
  scrollRef,
  ...props
}:ITypeIcon) => {
  const number = src.toString();
  const size = typeof(src) === 'number' ? number.length : null;

  return <Box 
      as={motion.div} 
      arial-label='type button' 
      variants={variants}
      initial='initial'
      whileInView='view'
      viewport={{ root: scrollRef }}
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
      fontSize={typeof(src) === 'string' ? 'sm' : size > 2 ? 'xxs' : 'xs'}
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
  gridTemplateColumns = 'repeat( auto-fill, minmax(.5rem, 1.9rem) )',
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

  const scrollRef = useRef(null);

  return (
    <Box 
      display='grid' 
      gridTemplateColumns={gridTemplateColumns} 
      columnGap={columnGap} 
      rowGap={rowGap}
      alignItems='center'
      justifyContent={data.length > 10 ? 'center' : 'flex-start'}
      p='2' 
      ref={scrollRef}
    >
      {data.map(d => (<TypeIcon
        scrollRef={scrollRef}
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
  scrollRef,
}:{
  id?: number;
  src?: string;
  linkName?: string;
  containerName?: string;
  borderColor?: string;
  selectedLink: number;
  onSelectLink?: (linkId: number) => any;
  scrollRef?: any;
}) => {

  return (
    <Box 
      as={motion.li}
      display='flex' 
      w='100%'
      alignItems='center'
      onClick={() => onSelectLink && onSelectLink(id)}
      arial-label='type button' 
      variants={variants}
      initial='initial'
      whileInView='view'
      viewport={{ root: scrollRef }}
      whileHover={{
        y: 1,
        z: 8,
        transformPerspective: 600,
        background: '#0080ff',
      }}
      _hover={{
        color: 'whiteText'
      }}
      bg={selectedLink === id ? 'primary' : 'none'}
    >
      <Box 
        py='0.2rem'
        width='100%'
        display='flex'
        flexDirection='row'
        alignItems='center'
      >
        <TypeIcon borderColor={borderColor} src={src} mr={2} ml={2} />
        <Flex direction='column' align='flex-start'>
          <Text fontSize='xs'>{linkName}</Text>
          <Text fontSize='xs'>{containerName}</Text>
        </Flex>
      </Box>
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
  const scrollRef = useRef(null);

  return (<Flex direction='column' gap={3} py={2} ref={scrollRef}>
      {data.map(d => (<CytoListItem key={d.id} {...d} borderColor={borderColor} onSelectLink={onSelectLink} selectedLink={selectedLink} scrollRef={scrollRef} />))}
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
  packages = [],
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
    src?: string;
    linkName: string;
    containerName: string;
  }[];
  packages?: IPackageProps[];
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
  // const [switchLayout, setSwitchLayout] = useState('packages');
  const [selectedLink, setSelectedLink] = useState(selectedLinkId);
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  })

  const selectLink = useCallback((linkId) => {
    setSelectedLink((prevLinkId) => prevLinkId == linkId ? 0 : linkId);
  }, []);

  useHotkeys('up,right,down,left', e => {
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
    setSwitchLayout((v) => v === 'grid' ? 'list' : 'packages')
  }, { enableOnFormTags: ["TEXTAREA", "INPUT"] });

  // useOutsideClick({
  //   ref: ref,
  //   handler: () => setIsModalOpen(false),
  // })

  return (<>
      <Box
        bg='backgroundModal' 
        // maxW='md'
        maxH='lg'
        {...(fillSize ? { h: '100%', w: '100%' } : { h: 72, w: 'max-content' })}
        overflowY='hidden'
        borderWidth='thin' 
        borderColor='borderColor' 
        color='text' 
        borderRadius='lg' 
        overflow='hidden'
        display='flex'
        flexDir='column'
      >
        <Flex minWidth='max-content' alignItems='center' gap='2' borderBottomStyle='solid' borderBottomWidth='thin' borderBottomColor='borderColor'>
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
          {/* <IconButton 
            aria-label='list layout' 
            variant='ghost' 
            colorScheme='current'
            isRound 
            sx={{
              transform: switchLayout === 'packages' ? 'scale(1.2)' : 'scale(1)',
              _hover: {
                transform: switchLayout === 'packages' && 'scale(1.2)',
              }
            }}
            icon={<TbPackages />} 
            onClick={() => setSwitchLayout('packages')} 
          /> */}
          <IconButton 
            aria-label='grid layout' 
            variant='ghost' 
            colorScheme='current'
            isRound 
            sx={{
              transform: switchLayout === 'grid' ? 'scale(1.2)' : 'scale(1)',
              _hover: {
                transform: switchLayout === 'grid' && 'scale(1.2)',
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
              transform: switchLayout === 'list' ? 'scale(1.2)' : 'scale(1)',
              _hover: {
                transform: switchLayout === 'list' && 'scale(1.2)',
              }
            }}
            icon={<BsListUl />} 
            onClick={() => setSwitchLayout('list')} 
          />
        </Flex>
        {!loading 
        ? <Box 
          pos='relative' 
          w='100%' h="100%"
        >
          {/* <ScaleFade 
            initialScale={0.9} 
            in={switchLayout === 'packages'}
            style={{
              pointerEvents: switchLayout === 'packages' ? 'initial' : 'none',
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              overflowY: 'scroll',
            }}
          >
            <PackagesBlock 
              packages={elements} 
            />
          </ScaleFade> */}
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
              borderColor='borderColor' 
              onSelectLink={selectLink} 
              selectedLink={selectedLink} 
              borderColorSelected='primary' 
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
            <ListPanel data={elements} 
              borderColor='borderColor' 
              selectedLink={selectedLink} onSelectLink={selectLink}/>
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