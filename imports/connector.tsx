import React, { useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { Box, Button, Divider, Flex, IconButton, Image, Input, InputGroup, InputLeftAddon, InputLeftElement, InputRightAddon, InputRightElement, Spacer, Text } from '@chakra-ui/react';
import { ModalWindow } from "./modal-window";
import { useDebounceCallback } from "@react-hook/debounce";
import { IoAddCircleOutline, IoPlayOutline, IoAddOutline } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { motion, useAnimation, AnimatePresence } from 'framer-motion';
import { CustomizableIcon } from "./icons-provider";


const Initializing = React.memo<any>(() => {
  return (<Flex width='100%' justify='space-between' pt={2} pb={2}>
      <Text sx={{color: '#F7FAFC'}} fontSize='sm' as='kbd' mr='0.125rem'>Initializing</Text>
      <Box 
        display='flex' 
        w='100%' 
        justifyContent='flex-start' 
        alignItems='flex-end'
        sx={{
          pb: '0.3125rem',
          '& > *:not(:last-of-type)': {
            mr: 1
          }
        }}
      >
        <motion.div
          style={{
            width: 3,
            height: 3,
            borderRadius: 0.5,
            backgroundColor: "#fff"
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          style={{
            width: 3,
            height: 3,
            borderRadius: 0.5,
            backgroundColor: "#fff"
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4  }}
        />
        <motion.div
          style={{
            width: 3,
            height: 3,
            borderRadius: 0.5,
            backgroundColor: "#fff"
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8  }}
        />
        <motion.div
          style={{
            width: 3,
            height: 3,
            borderRadius: 0.5,
            backgroundColor: "#fff"
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.6  }}
        />
      </Box>
    </Flex>
  )
});

const Initialized = React.memo(() => {
  return (<Flex width='100%' justify='space-between' pt={2} pb={2} alignItems='center'>
      <IconButton
        variant='unstyled' 
        size='md'
        aria-label='Add local route' 
        icon={
          <IoPlayOutline color='rgb(0, 128, 255)' />
        } 
      />
      <Text sx={{color: '#F7FAFC'}} fontSize='sm' as='kbd' mr='0.125rem'>Initializing</Text>
      <IconButton
        variant='unstyled' 
        size='md'
        aria-label='Add local route' 
        icon={
          <MdDelete color='rgb(0, 128, 255)' />
        } 
      />
      
    </Flex>
  )
})

const inputArea = {
  open: {
    height: '5rem',
    // scaleY: 1,
    // display: 'block',
    transition: { duration: 0.5 }
  }, 
  close: {
    height: '0rem',
    // scaleY: 0,
    // display: 'none',
    transition: { delay: 0.5 }
  },
  initial: {
    height: '0rem',
    // scaleY: 0,
    originY: 1
  }
};

const inputAnimation = {
  add: {
    opacity: 1,
    scaleY: 1,
    originY: 0,
    // display: 'flex',
    transition: { 
      duration: 0.5,
      delay: 0.2
    }
  },
  hide: {
    opacity: 0,
    scaleY: 0,
    originY: 1,
    // display: 'none',
    transition: { 
      duration: 0.3,
      display: { delay: 0.7 }
    }
  }
};

const InputAnimation = React.memo<any>(({
  bgContainer = '#141214',
  addRemoteRout = false,
  valueRemoteRoute = '',
  onChangeValueRemoteRoute,
  setValueRemote,
  onDeleteValue,
  onStartRemoteRoute,
  key,
}:{
  bgContainer?: string;
  addRemoteRout?: boolean;
  valueRemoteRoute?: string;
  onChangeValueRemoteRoute
  setValueRemote?: () => any;
  onDeleteValue: () => any;
  onStartRemoteRoute?: () => any;
  key?: any;
}) => {
  const control = useAnimation();
  const controlInput = useAnimation();

  useEffect(() => {
    if (!!addRemoteRout) { 
      control.start('open');
      controlInput.start("add");
    } else {
      controlInput.start("hide");
      control.start('close');
    }
  }, [addRemoteRout]);

  return (<Box 
      as={motion.div}
      animate={control}
      initial='initial'
      exit='close'
      layout
      variants={inputArea}
      bg={bgContainer}
      w='100%'
      // height='100%'
      p={4}
      key={key}
    >
      {/* <Box > */}
        {/* <AnimatePresence> */}
          <InputGroup 
            size='lg'
            // layout
            as={motion.div}
            animate={controlInput}
            initial='hide'
            exit='hide'
            variants={inputAnimation}
            key={key}
          >
            <InputLeftElement 
              onClick={onStartRemoteRoute}
              children={
                <CustomizableIcon Component={IoPlayOutline} value={{color: 'rgb(0, 128, 255)'}} />
              } 
            />
            <Input placeholder='rout' value={valueRemoteRoute} onChange={onChangeValueRemoteRoute} />
            <InputRightElement 
              onClick={onDeleteValue}
              children={
                <CustomizableIcon Component={MdDelete} value={{color: 'rgb(0, 128, 255)'}} />
              } 
            />
          </InputGroup>
        {/* </AnimatePresence> */}
      {/* </Box> */}
    </Box>
  )
});

const cardAnimation = {
  grow: {
    scale: 1,
    opacity: 1,
    transition: { duration: 0.8}
  },
  shrink: {
    scale: 0,
    opacity: 0,
    transition: { duration: 0.8, delay: 0.5}
  }
};

const initArea = {
  initial: {
    scaleY: 1,
    originY: 1,
    opacity: 1,
    display: 'flex'
  },
  open: {
    scaleY: 1,
    opacity: 1,
    display: 'flex',
  }, 
  close: {
    scaleY: 0,
    opacity: 0,
    // display: 'none',
    // transition: { 
    //   display: {
    //     delay: 3 
    //   }}
  },
  initializing: {
    // display: 'none',
    scaleY: 0,
    originY: 1,
    opacity: 0,
  }
};

export const Connector = React.memo<any>(({
  portalOpen, 
  onClosePortal,
}:{
  portalOpen?: boolean; 
  onClosePortal: () => any;
}) => {
  const control = useAnimation();
  const controlNotInit = useAnimation();
  const controlInit = useAnimation();
  const controlInited = useAnimation();
  const [valueRemote, setValueRemote] = useState('');
  const [initLocal, setInitLocal] = useState(false);
  const [initedLocal, setInitedLocal] = useState(false);
  // const [addRemote, setAddRemote] = useState(0);
  const onChangeValueRemote = useDebounceCallback((value) => {
    setValueRemote(value);
  }, 500);
  
  const [remoteRouts, setArr] = useState([]);
  
  const add = () => {
    setArr((remoteRouts) => [
      ...remoteRouts,
      { id: (Math.random() + 1).toString(36).substring(7), value: "" }
    ])
  };
  const remove = (id) => {
    setArr((remoteRouts) => remoteRouts.filter((el) => el.id != id))
  };
  const save = (id, value) => {
    setArr((remoteRouts) => remoteRouts.map((el) => (el.id === id ? { ...el, value } : el)))
  };

  useEffect(() => {
    if (!!portalOpen) {
      control.start("grow"); 
    } else {
      control.start("shrink");
    }
  }, [control, portalOpen]);

  useEffect(() => {
    if (initLocal && !initedLocal) { 
      controlNotInit.start('close');
      controlInit.start('open');
    } else if (initLocal && initedLocal) {
      controlNotInit.start('initializing');
      controlInit.start('initializing');
      controlInited.start('open');
    } else {
      controlNotInit.start("open");
    } 
  }, [initLocal, initedLocal]);

  return (<ModalWindow onClosePortal={onClosePortal} portalOpen={portalOpen}>
      <Box 
        display='flex'
        flexDirection='column'
        alignItems='center'
      >
        <Box boxSize='5rem'>
          <Image src='./logo_n.svg' alt='logo' />
        </Box>
        <Box 
          as={motion.div}
          display='flex' 
          flexDir='column' 
          alignItems='center' 
          justifyContent='center' 
          height='100%'
          width='max-content'
          bg='#141214'
          borderRadius='5px'
          animate={control}
          initial='shrink'
          variants={cardAnimation}
        >
          <Box pt={4} pl={4} pr={4} textAlign='left' w='100%'>
            <Text sx={{color: '#F7FAFC'}} fontSize='md'>Remote deep</Text>
          </Box>
          <AnimatePresence>
            {remoteRouts.map(rr => (
              <InputAnimation 
                addRemoteRout={!!remoteRouts}
                valueRemoteRoute={rr.value}
                onChangeValueRemoteRoute={(e) => save(rr.id, e.target.value)}
                // setValueRemote={}
                onDeleteValue={() => remove(rr.id)}
                // onStartRemoteRoute={() => {}}
                key={rr.id}
              />)
            )}
          </AnimatePresence>
          <Box pb={4} pl={4} pr={4} width='100%'>
            <IconButton
              as={motion.div} 
              variant='unstyled' 
              aria-label='Add remote route' 
              icon={
                <IoAddOutline color='rgb(0, 128, 255)' />
              }
              // onClick={() => setAddRemote(!addRemote)} 
              onTap={add}
            />
            <Divider mb={4} />
            <Text sx={{color: '#F7FAFC'}} fontSize='md'>Local deep</Text>
          </Box>
          <Box 
            bg='#141214'
            pl={4}
            pb={2}
            boxSizing='border-box'
            w='100%'
          > 
            <AnimatePresence>
              <Box display='flex' w='100%' justifyContent='space-between' alignItems='center' minW='19.75rem' position='relative'>
                <Box 
                  w='100%' 
                  h='100%' 
                  display='flex' 
                  justifyContent='space-between'
                  alignItems='center'
                  as={motion.div}
                  animate={controlNotInit}
                  initial='initial'
                  variants={initArea}
                  onClick={() => setInitLocal(!initLocal)} 
                >
                  <Text sx={{color: '#F7FAFC'}} fontSize='sm' as='kbd'>no initialized</Text>
                  <IconButton
                    variant='unstyled' 
                    size='md'
                    aria-label='Add local route' 
                    icon={
                      <IoAddOutline color='rgb(0, 128, 255)' />
                    } 
                  />
                </Box>
                <Box 
                  w='100%' 
                  h='100%' 
                  display='flex' 
                  position='absolute'
                  top={0} left={0}
                  justifyContent='space-between'
                  alignItems='center'
                  as={motion.div}
                  animate={controlInit}
                  initial='Initializing'
                  variants={initArea}
                  onClick={() => setInitedLocal(!initedLocal)} 
                >
                  <Initializing />
                </Box>
                <Box 
                  w='100%' 
                  h='100%'  
                  position='absolute'
                  top={0} left={-4}
                  as={motion.div}
                  animate={controlInited}
                  initial='initializing'
                  variants={initArea}
                  onClick={() => setInitLocal(!initLocal)} 
                >
                  <Initialized />
                </Box>
              </Box>
            </AnimatePresence>
          </Box>
        </Box>
      </Box>
    </ModalWindow>
  )
})
