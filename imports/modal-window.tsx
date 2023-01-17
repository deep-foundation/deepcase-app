import { motion, useAnimation } from 'framer-motion';
import React, { useEffect, useRef } from 'react';
import { Box, Center, Portal, useOutsideClick } from '@chakra-ui/react';


const spring = {
  type: "spring",
  damping: 10,
  stiffness: 100,
  duration: 2
}

const invitationForm = {
  active: {
    scale: 1,
    opacity: 1,
    display: 'block',
    transition: spring 
  },
  inactive: {
    scale: 0,
    opacity: 0,
    display: 'none',
    transition: spring 
  }
}

const backdrop = {
  active: {
    scale: 1,
    opacity: 1,
    display: 'flex',
    transition: spring 
  },
  inactive: {
    scale: 0,
    opacity: 0,
    display: 'none',
    transition: spring 
  }
}

export const ModalWindow = React.memo<any>(({
  portalOpen = true, 
  onClosePortal,
  children,
}:{
  portalOpen: boolean; 
  onClosePortal: () => any;
  children: any;
}) => {
  const control = useAnimation();
  const ref = useRef<any>();
  useOutsideClick({
    ref: ref,
    handler: onClosePortal,
  })

  useEffect(() => {
    if (portalOpen === true) {
      control.start("active"); 
    } else {
      control.start("inactive");
    }
  }, [control, portalOpen]);

  return (
    <Portal>
      <Center 
        as={motion.div}
        animate={control}
        initial='active'
        variants={backdrop}
        width='100vw' 
        height='100vh'
        position='fixed'
        top={0}
        left={0}
        zIndex={3}
        backdropFilter='
          blur(2px) 
          contrast(1.2)'
        backdropInvert='25%'
      >
        {portalOpen && <Box 
          as={motion.div} 
          animate={control} 
          variants={invitationForm} 
          ref={ref}
        >
          {children}
        </Box>}
      </Center>
    </Portal>
    )
  })