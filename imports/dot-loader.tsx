import { generateQuery } from '@deep-foundation/deeplinks/imports/gql';
import React from 'react';
import { usePrefersReducedMotion, keyframes, Box, Center } from '@chakra-ui/react';


const anim = keyframes`
  0% { 
    transform: scale(0); 
  }
  25% {
    transform: scale(0.5),
  }
  
  50% {
    transform: scale(1.5),
  }
  
  75% {
    transform: scale(0.5),
  }
  
  100% {
    transform: scale(0),
  }
`;

export const DotsLoader = React.memo<any>(() => {
  const prefersReducedMotion = usePrefersReducedMotion();
  const anim1 = prefersReducedMotion
    ? undefined
    : `${anim} 1.5s cubic-bezier(0.04, 0.6, 0.81, 0.45 ) 0s infinite`;
  const anim2 = prefersReducedMotion
    ? undefined
    : `${anim} 1.5s cubic-bezier(0.04, 0.6, 0.81, 0.45 ) 0.25s infinite`;
  const anim3 = prefersReducedMotion
    ? undefined
    : `${anim} 1.5s cubic-bezier(0.04, 0.6, 0.81, 0.45 ) 0.50s infinite`;
  const anim4 = prefersReducedMotion
    ? undefined
    : `${anim} 1.5s cubic-bezier(0.04, 0.6, 0.81, 0.45 ) 0.75s infinite`;

  
  return (<Box 
      display='flex'
      alignItems='center'
      justifyContent='center'
      h='100%'
      sx={{
        '& > *': {
          width: '0.5em',
          height: '0.5em',
          bg: 'gray.400',
          borderRadius: '50%',
          position: 'relative',
        },
        '& > *:nth-of-type(-n+3)': {
          marginRight: '0.2rem',
        }
      }}
    >
      <Box animation={anim1} />
      <Box animation={anim2} />
      <Box animation={anim3} />
      <Box animation={anim4} />
    </Box>
  )
})
