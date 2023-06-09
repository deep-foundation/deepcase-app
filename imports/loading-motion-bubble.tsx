import React from 'react';
import { Flex, Text, Box } from '@chakra-ui/react';
import { motion } from 'framer-motion';


interface ILoading {
  text?: string;
  width?: string;
  height?: string;
  sxFlex?: any;
  justifyFlex?: string;
  widthFlex?: string;
  sx?: any;
  borderRadiusBubble?: string;
  backgroundBubble?: string;
}

export const Loading = React.memo<any>(({
  text,
  width = '0.1875rem',
  height = '0.1875rem',
  sxFlex,
  justifyFlex = 'space-between',
  widthFlex = '100%',
  sx,
  borderRadiusBubble = '0.125rem',
  backgroundBubble = "#A0AEC0",
}: ILoading) => {
  return (<Flex width={widthFlex} justify={justifyFlex} sx={sxFlex}>
      <Text color='gray.400' fontSize='sm' as='kbd' mr='0.125rem'>{text}</Text>
      <Box 
        display='flex' 
        w='100%' 
        justifyContent='flex-start' 
        alignItems='flex-end'
        sx={{
          '& > *:not(:last-of-type)': {
            mr: 1
          },
          ...sx
        }}
      >
        <motion.div 
          style={{
            width: width,
            height: height,
            borderRadius: borderRadiusBubble,
            backgroundColor: backgroundBubble,
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          style={{
            width: width,
            height: height,
            borderRadius: borderRadiusBubble,
            backgroundColor: backgroundBubble,
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4  }}
        />
        <motion.div
          style={{
            width: width,
            height: height,
            borderRadius: borderRadiusBubble,
            backgroundColor: backgroundBubble,
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8  }}
        />
        <motion.div
          style={{
            width: width,
            height: height,
            borderRadius: borderRadiusBubble,
            backgroundColor: backgroundBubble,
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.6  }}
        />
      </Box>
    </Flex>
  )
});