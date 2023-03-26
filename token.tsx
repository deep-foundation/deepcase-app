import { CheckIcon, ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Input, InputGroup, InputRightElement, Link } from '@chakra-ui/react';
import React, { useState } from 'react';

export const Token = () => {
  const [value, setValue] = useState('');
  const [loader, setLoader] = useState(true);

  return (<Box maxW='md' borderColor='gray.400' borderWidth='1px' borderRadius='lg'>
      <Link fontSize='xs' href='https://docs.npmjs.com/creating-and-viewing-access-tokens' p={2} isExternal>
        creating and viewing npm access tokens <ExternalLinkIcon mx='2px' />
      </Link>
      <InputGroup maxW='md' size='sm' p={2}>
        <Input 
          placeholder='Enter you npm token' 
          value={value} 
          borderColor='gray.300' 
          onChange={(e) => setValue(e.target.value)} />
          {!value === true
            ? <InputRightElement width='4.2rem' top={2} children={
                <Button isLoading={true} size='xs' bg='blue.300' color='blackAlpha.800' _hover={{ bg: 'blue.500' }} onClick={() => console.log('save')}>
                  save
                </Button>
                } 
              />
            : loader === true
            ? null
            : <InputRightElement width='4.2rem' top={2} children={
                <Button isLoading={true} size='xs' bg='blue.200' color='blackAlpha.800' onClick={() => console.log('save')}>
                  save
                </Button>
                } 
              />
          }
      </InputGroup>
    </Box>
  );
}