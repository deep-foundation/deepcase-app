import React from 'react';
import { Box, Link, Text } from '@chakra-ui/react';
import { ExternalLinkIcon } from '@chakra-ui/icons';
import { FaExternalLinkSquareAlt } from 'react-icons/fa';


export const DockerWarning = React.memo<any>(() => {
  return (<Box pr={4} pl={4} pt={4} textAlign='center'>
      <Text color='yellow.400' fontSize='xs'>Docker is not installed on the system.<br/>Install{' '}
        <Link href='https://www.docker.com/' isExternal color='yellow.400'>
          Docker <ExternalLinkIcon ml='2px' />
        </Link>
      </Text>
    </Box>
  )
}) 
