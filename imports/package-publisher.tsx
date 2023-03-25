import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Input, Link, VStack } from '@chakra-ui/react';
import React from 'react';


export const PackagePublisher = () => {
  const link = 'https://chakra-ui.com';

  return (<Box maxW='md' borderColor='gray.400' borderWidth='1px' borderRadius='lg' overflow='hidden'>
      {link ? <Link fontSize='xs' href={link} p={2} isExternal>
        {link} <ExternalLinkIcon mx='2px' />
      </Link> : null}
      <VStack p={2}>
        <Input 
          placeholder='package name'
          value='name'
          borderColor='gray.300'
          size='sm'
          />
        <Input 
          placeholder='package version'
          value='version'
          borderColor='gray.300'
          size='sm'
          />
        <Button colorScheme='blue' size='sm' w='100%'>save</Button>
        <Button colorScheme='blue' size='sm' w='100%'>publish</Button>
      </VStack>
    </Box>
  )
}