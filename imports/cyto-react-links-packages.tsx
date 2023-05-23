import { Box, Button, Center, Flex, IconButton, Input, InputGroup, InputRightElement, ScaleFade, SlideFade, Spacer, Text, useColorModeValue } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { BsCheck2, BsDoorClosed, BsGrid3X2Gap, BsListUl, BsSearch } from 'react-icons/bs';
import { DotsLoader } from './dot-loader';
import { useChackraColor } from './get-color';

const TypeExample = () => <Box className="type" sx={{ w: '3rem', height: '3rem', bg: 'sendMessagePlane' }} />;

export const OneLink = React.memo<any>(() => {
  return (<Box as={motion.div}
    variants={{ collapsed: { scale: 0.8 }, open: { scale: 1 } }}
    // @ts-ignore
    transition={{ duration: 0.8 }}
    sx={{
      padding: '20px',
      transformOrigin: 'top center',
    }}
  >
    <TypeExample />
  </Box>);
})

export const PackageItemAccordion = React.memo<any>(({elem}) => {
  const [expanded, setExpanded] = useState<false | number>(0);
  const isOpen = elem === expanded;

  return (<>
    <Box as={motion.div}
      initial={false}
      animate={{ backgroundColor: isOpen ? 'switchOff' : 'switchOn' }}
      onClick={() => setExpanded(isOpen ? false : elem)}
      sx={{
        background: 'switchOn',
        borderRadius: '0.5rem',
        borderWidth: 'thin',
        borderColor: 'borderInputMessage',
        color: 'text',
        cursor: 'pointer',
        height: '3rem',
        marginBottom: isOpen ? '0' : '0.5rem',
      }}
    >
    </Box>
    <AnimatePresence initial={false}>
      {isOpen && (
        <Box as={motion.section}
          key='content'
          initial='collapsed'
          animate='open'
          exit='collapsed'
          variants={{
            open: { opacity: 1, height: 'auto' },
            collapsed: { opacity: 0, height: 0 }
          }}
          // @ts-ignore
          transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
         <OneLink />
        </Box>
      )}
    </AnimatePresence>
  </>);
})

const accordionIds = [0, 1, 2, 3];

export const Example = React.memo<any>(() => {
  return (accordionIds.map((i) => (
    <PackageItemAccordion elem={i} key={i} />
  )))
})

