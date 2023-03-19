import { Box, Text } from '@chakra-ui/react';
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import React, { useEffect, useState } from 'react';
import { Install } from "./icons/install";
import { Uninstall } from './icons/uninstall';


const tabInstall = {
  active: {
    width: "93%",
    background: '#0080ff',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  inactive: {
    width: "6%",
    background: '#e4e4e4',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  initial: {
    width: "93%",
    originX: 0,
  },
};

const tabUninstall = {
  active: {
    width: "93%",
    background: '#0080ff',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  inactive: {
    width: "6%",
    background: '#e4e4e4',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  initial: {
    width: "6%",
    borderRadius: '5rem',
    originX: 0,
  }
};

const textUninstall = {
  show: {
    opacity: 1,
    display: 'block',
    transition: {
      type: "tween",
      delay: 0.45,
      duration: 0.4,
    }
  },
  hide: {
    opacity: 0,
    display: 'none',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  initial: {
    opacity: 0,
    originX: 0,
    borderRadius: '5rem',
    display: 'none',
  }
};
const textInstall = {
  show: {
    opacity: 1,
    display: 'block',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  hide: {
    opacity: 0,
    display: 'none',
    transition: {
      type: "tween",
      duration: 0.4
    }
  },
  initial: {
    display: 'block',
    opacity: 1,
    originX: 0,
  }
};


export const TabsPackages = React.memo<any>(({
  // selectedTab = 0,
  onClickTab,
}:{
  // selectedTab?: number;
  onClickTab?: (selectedTab: number) => any;
}) => {
  const [ selectedTab, setSelectedTab ] = useState(0);
  const controlInstall = useAnimation();
  const controlUninstall = useAnimation();
  const controlTextInstall = useAnimation();
  const controlTextUninstall = useAnimation();

  useEffect(() => {
    if (selectedTab === 0) {
      controlInstall.start("active"); 
      controlUninstall.start("inactive"); 
      controlTextInstall.start("show"); 
      controlTextUninstall.start("hide"); 
    } else if (selectedTab === 1) {
      controlUninstall.start("active"); 
      controlInstall.start("inactive");
      controlTextInstall.start("hide"); 
      controlTextUninstall.start("show"); 
    } else {
      controlInstall.start("active"); 
      controlUninstall.start("inactive"); 
      controlTextInstall.start("show"); 
      controlTextUninstall.start("hide");
    }
  }, [controlInstall, controlUninstall, controlTextInstall, controlTextUninstall, selectedTab]);

  return (<Box
      as={motion.div}
      width='100%'
      display='flex'
      justifyContent='space-between'
      pl={2}
      pr={2}
      pb={2}
      >
      <AnimatePresence>
        <Box
          as={motion.div}
          role='button'
          animate={controlInstall}
          initial='initial'
          exit='initial'
          variants={tabInstall}
          onClick={() => setSelectedTab(0)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '5rem',
            p: 2,
            '& > *:nth-child(1)': {
              mr: selectedTab === 0 ? 1 : 0
            }
          }}
        >
          <Install stroke={selectedTab === 0 ? '#ffffff' : '#8b8b8b'} />
          <Text 
            as={motion.div}
            color='whiteAlpha.800'
            animate={controlTextInstall}
            variants={textInstall}
            initial='initial'
            sx={{ lineHeight: 1 }}
          >Install</Text>
        </Box>
      </AnimatePresence>
      <AnimatePresence>
        <Box
          key={1}
          as={motion.div}
          role='button'
          animate={controlUninstall}
          initial='initial'
          exit='initial'
          variants={tabUninstall}
          onClick={() => setSelectedTab(1)}
          sx={{
            display: 'flex',
            alignItems: 'center',
            borderRadius: '5rem',
            p: 2,
            '& > *:nth-child(1)': {
              mr: selectedTab === 1 ? 1 : 0
            }
          }}
        >
          <Uninstall stroke={selectedTab === 1 ? '#ffffff' : '#8b8b8b'} />
          <Text
            as={motion.div}
            animate={controlTextUninstall}
            color='whiteAlpha.800'
            variants={textUninstall}
            initial='initial'
            sx={{ lineHeight: 1 }}
          >Not install</Text>
        </Box>
      </AnimatePresence>
    </Box>
  )
})