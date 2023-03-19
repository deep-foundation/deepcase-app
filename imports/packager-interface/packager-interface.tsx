import React, { useEffect, useRef, useState } from 'react';
import { Box, Flex, IconButton, Input, InputGroup, InputRightElement, Spacer } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { Appearance } from '../component-appearance';
import { BsSearch } from 'react-icons/bs';
import { SlClose } from 'react-icons/sl';
import { TabComponent } from './packager-interface-tabs-content';
import { TabsPackages } from './packager-interface-tabs-menu';
import { combinedPackagesSearch } from '../../pages/api/packager';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';


const variants = {
  show: {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    // width: '100%',
    // height: '100%',
    borderRadius: '0%',
    transition: { duration: 0.5 }
  },
  hide: {
    scaleX: 0.3,
    scaleY: 0.1,
    opacity: 0,
    borderRadius: '50%',
    transition: { 
      // scale: { delay: 1 },
      duration: 0.8 
    }
  },
  initial: {
    originX: 1,
    originY: 0,
  }
}

export const PackagerInterface = React.memo<any>(({
  toggle,
  search, 
  onSearch,
  onClose,
}:{
  toggle?: boolean;
  search?: any;
  onSearch?: any;
  onClose?: () => any;
}) => {
  const inputRef = useRef(null);

  useEffect(() => {
    inputRef.current.focus();
  })

  const deep = useDeep();

  const [ variant, setSelectedVariant ] = useState(0);
//write async function

const test = async () => {
  const result = await combinedPackagesSearch(deep, '');
  console.log({'render packager interface': result});
}
  console.log({'render packager interface': test()});

  return (<Appearance 
      toggle={toggle} 
      variantsAnimation={variants} 
      initial='initial'
    >
      <Box border='1px' borderColor='gray.300' borderRadius='1.2rem'>
        <Flex 
          minWidth='max-content' 
          maxWidth='35.5rem'
          alignItems='center' gap='2' 
        >
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
            aria-label='packager window close' 
            variant='ghost' 
            colorScheme='current'
            isRound 
            icon={<SlClose />} 
            onClick={onClose} 
          />
        </Flex>
        <TabsPackages 
          selectedTab={variant}
          onSelectMode={(e) => setSelectedVariant(variant => variant === 0 ? 1 : 0)}
        />
        <TabComponent variant={variant} />
      </Box>
    </Appearance>
  )
})