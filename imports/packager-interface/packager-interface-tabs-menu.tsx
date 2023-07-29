import { Box, Circle, Text, useColorMode } from '@chakra-ui/react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Install } from "./icons/install";
import { Uninstall } from './icons/uninstall';


const tabInstall = {
  active: {
    background: '#0080ff',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  inactive: {
    background: '#eeeeee',
    borderColor: '#718096',
    borderWidth: 'thin',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  inactiveDark: {
    background: '#19202B',
    borderColor: '#718096',
    borderWidth: 'thin',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  initial: {
    originX: 0,
  },
};

const tabUninstalled = {
  active: {
    background: '#0080ff',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  inactive: {
    background: '#eeeeee',
    borderColor: '#a0aec0',
    borderWidth: 'thin',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  inactiveDark: {
    background: '#19202B',
    borderColor: '#718096',
    borderWidth: 'thin',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  initial: {
    borderRadius: '5rem',
    borderColor: '#a0aec0',
    borderWidth: 'thin',
    originX: 0,
  }
};

const textUninstalled = {
  show: {
    color: '#fff',
    transition: {
      type: "tween",
      duration: 0.4,
    }
  },
  hide: {
    color: '#3a3a3a',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  initial: {
    originX: 0,
    color: '#fff',
  }
};
const textInstall = {
  show: {
    color: '#fff',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  hide: {
    color: '#3a3a3a',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  initial: {
    originX: 0,
    color: '#3a3a3a',
  }
};

const QuantityPackages = React.memo<any>(({ quantity, borderColor }: { quantity: number; borderColor?: string; }) => {
  return (<Circle size='1.2rem' 
      sx={{
        w: 'max-content', minW: '1.2rem', p: '0 0.25rem',
        border: `1px solid ${borderColor}`}} >
      <Text fontSize='xs' fontWeight='bold' color={borderColor}>{quantity}</Text>
    </Circle>
  )
})

export const TabsPackages = React.memo<any>(({
  selectedTab = 0,
  onSelectMode,
  quantityInstall = 0,
  quantityUninstalled = 0,
}:{
  selectedTab?: number;
  onSelectMode?: () => any;
  quantityInstall?: number;
  quantityUninstalled?: number;
}) => {
  const controlTabInstall = useAnimation();
  const controlTabUninstalled = useAnimation();
  const controlTextInstall = useAnimation();
  const controlTextUninstalled = useAnimation();
  const { colorMode } = useColorMode();

  useEffect(() => {
    if (selectedTab === 0 && colorMode === 'light') {
      controlTabInstall.start("active"); 
      controlTabUninstalled.start("inactive");
      controlTextInstall.start("show"); 
      controlTextUninstalled.start("hide"); 
    } else if (selectedTab === 0 && colorMode === 'dark') {
      controlTabInstall.start("active"); 
      controlTabUninstalled.start("inactiveDark");
      controlTextUninstalled.start("show"); 
    } else if (selectedTab === 1 && colorMode === 'light') {
      controlTabUninstalled.start("active"); 
      controlTabInstall.start("inactive");
      controlTextInstall.start("hide"); 
      controlTextUninstalled.start("show"); 
    } else {
      controlTabInstall.start("inactiveDark");
      controlTabUninstalled.start("active"); 
      controlTextInstall.start("show"); 
      controlTextUninstalled.start("show");
    }
  }, [controlTabInstall, controlTabUninstalled, controlTextInstall, controlTextUninstalled, selectedTab, colorMode]);

  return (<Box
      as={motion.div}
      width='100%'
      display='flex'
      justifyContent='space-between'
      pl={2}
      pr={2}
      pb={2}
      sx={{
        '& > *:nth-of-type(1)': {
          mr: 1
        }
      }}
    >
      <AnimatePresence>
        <Box
          as={motion.div}
          role='button'
          animate={controlTabInstall}
          initial='initial'
          exit='initial'
          variants={tabInstall}
          onClick={onSelectMode}
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderRadius: '5rem',
            w: '100%',
            p: 2,
            '& > *:nth-of-type(1)': {
              mr: 1
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              '& > *:nth-of-type(1)': {
                mr: 1
              }
            }}
          >
            <Install stroke={
                (selectedTab === 0 && colorMode === 'dark') 
                ? '#ffffff' 
                : (selectedTab === 0 && colorMode === 'light') 
                ? '#ffffff' 
                : (colorMode === 'dark')
                ? '#ffffff' 
                : '#3a3a3a'
              } 
            />
            <Text 
              as={motion.div}
              color='whiteAlpha.800'
              animate={controlTextInstall}
              variants={textInstall}
              initial='initial'
              sx={{ lineHeight: 1 }}
            >Installed</Text>
          </Box>
          <Box>
            <QuantityPackages 
              quantity={quantityInstall} 
              borderColor={
                (selectedTab === 0 && colorMode === 'dark') 
                ? '#ffffff' 
                : (selectedTab === 0 && colorMode === 'light') 
                ? '#ffffff' 
                : (colorMode === 'dark')
                ? '#ffffff' 
                : '#3a3a3a'
              } />
          </Box>
        </Box>
      </AnimatePresence>
      <AnimatePresence>
        <Box
          key={1}
          as={motion.div}
          role='button'
          animate={controlTabUninstalled}
          initial='initial'
          exit='initial'
          variants={tabUninstalled}
          onClick={onSelectMode}
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderRadius: '5rem',
            w: '100%',
            p: 2,
            '& > *:nth-of-type(1)': {
              mr: 1
            }
          }}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              '& > *:nth-of-type(1)': {
                mr: 1
              }
            }}
          >
            <Uninstall stroke={
                (selectedTab === 1 && colorMode === 'dark') 
                ? '#ffffff' 
                : (selectedTab === 1) 
                ? '#ffffff' 
                : (colorMode === 'dark')
                ? '#ffffff' 
                : '#3a3a3a'
              } 
            />
            <Text
              as={motion.div}
              animate={controlTextUninstalled}
              variants={textUninstalled}
              initial='initial'
              sx={{ lineHeight: 1 }}
            >Not installed</Text>
          </Box>
          <Box>
            <QuantityPackages 
              quantity={quantityUninstalled} 
              borderColor={
                (selectedTab === 1 && colorMode === 'dark') 
                ? '#ffffff' 
                : (selectedTab === 1) 
                ? '#ffffff' 
                : (colorMode === 'dark')
                ? '#ffffff' 
                : '#3a3a3a'
              } />
          </Box>
        </Box>
      </AnimatePresence>
    </Box>
  )
})