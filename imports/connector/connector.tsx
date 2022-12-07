import { Box, Divider, Flex, IconButton, Image, Input, InputGroup, InputLeftElement, InputRightElement, Text } from '@chakra-ui/react';
import { useDebounceCallback } from "@react-hook/debounce";
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import React, { useEffect, useRef, useState } from "react";
import { IoAddOutline, IoPlayOutline, IoStopOutline } from 'react-icons/io5';
import { MdDelete } from 'react-icons/md';
import { CustomizableIcon } from "../icons-provider";
import { ModalWindow } from "../modal-window";
import { DockerWarning } from './docker-warning';

const ConnectorGrid = React.memo<any>(({
  children, 
  ...props
}:{
  children: any; 
  [key: string]: any;
}) => {

  return (
    <Box 
      display='flex' 
      {...props}
    >
      <AnimatePresence>
        {children}
      </AnimatePresence>
    </Box>
  )
});

const terminalAnimation = {
  grow: {
    scale: 1,
    width: '100%',
    opacity: 1,
    transition: { duration: 1.1}
  },
  shrink: {
    scale: 0,
    opacity: 0,
    width: '0px',
    transition: { duration: 1.1, delay: 0.2}
  }
};

const displayAnimation = {
  display: {
    display: 'block',
    transition: { duration: 1}
  },
  none: {
    display: 'none',
    transition: { duration: 0.1, delay: 1.3}
  },
  initial: {
    display: 'none',
  }
};

const TerminalConnect = React.memo<any>(({openTerminal = false, key,}:{openTerminal?: boolean; key: any;}) => {
  const terminalBoxRef = useRef<any>();
  const terminalRef = useRef<any>();
  const control = useAnimation();
  const animation = useAnimation();

  useEffect(() => {
    (async () => {
      const { Terminal } = await import("xterm");
      const termimal = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
      });
      terminalRef.current = termimal;
      const box = terminalBoxRef.current;
      termimal.open(box);
      termimal.write('Hello from \x1B[1;3;31mxterm.js\x1B[0m $ ')
    })();
  }, []);

  useEffect(() => {
    if(openTerminal == true) {
      control.start('grow');
      animation.start('display');
    } else {
      control.start('shrink');
      animation.start('none');
    }
  }, [control, animation, openTerminal]);

  return (
  // <AnimatePresence>
      <Box 
        key={key}
        as={motion.div}
        overflow='hidden'
        borderRadius='5px'
        animate={control}
        initial='shrink'
        variants={terminalAnimation}
        exit='shrink'
        // w='100%' 
        // h='100%'
      >
        <Box  
          ref={terminalBoxRef}
          w='45rem' 
          h='20rem'
          sx={{
            '& > *': {
              height: '100%',
            },
          }}
          onClick={()=>{terminalRef.current.write('click!')}}
        />
      </Box>
    // </AnimatePresence>
  )
});

const Initializing = React.memo<any>(() => {
  return (<Flex width='100%' justify='space-between' pt={2} pb={2}>
      <Text color='gray.400' fontSize='sm' as='kbd' mr='0.125rem'>Initializing</Text>
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
            backgroundColor: "#A0AEC0",
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
        />
        <motion.div
          style={{
            width: 3,
            height: 3,
            borderRadius: 0.5,
            backgroundColor: "#A0AEC0",
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.4  }}
        />
        <motion.div
          style={{
            width: 3,
            height: 3,
            borderRadius: 0.5,
            backgroundColor: "#A0AEC0",
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 0.8  }}
        />
        <motion.div
          style={{
            width: 3,
            height: 3,
            borderRadius: 0.5,
            backgroundColor: "#A0AEC0",
          }}
          animate={{ scale: [0, 1, 0] }}
          transition={{ duration: 2, repeat: Infinity, delay: 1.6  }}
        />
      </Box>
    </Flex>
  )
});

const ButtonTextButton = React.memo(({
  ComponentLeftIcon = IoPlayOutline,
  ariaLabelLeft = 'Add local route',
  ComponentRightIcon =  MdDelete,
  ariaLabelRight = 'Remove local route',
  text = 'Initialized',
  onClickLeft,
  onClickRight,
}:{
  ComponentLeftIcon?: any;
  ariaLabelLeft?: string;
  ComponentRightIcon?: any;
  ariaLabelRight?: string;
  text?: any;
  onClickLeft?: () => any;
  onClickRight?: () => any;
}) => {
  return (<Flex width='100%' justify='space-between'  alignItems='center'>
      <IconButton
        variant='unstyled' 
        size='md'
        aria-label={ariaLabelLeft}
        icon={<ComponentLeftIcon color='rgb(0, 128, 255)' />} 
        onClick={onClickLeft}
      />
      <Text color='gray.400' fontSize='sm' as='kbd' mr='0.125rem'>{text}</Text>
      <IconButton
        variant='unstyled' 
        size='md'
        aria-label={ariaLabelRight}
        onClick={onClickRight}
        icon={<ComponentRightIcon color='rgb(0, 128, 255)' />} 
      />
    </Flex>
  )
})

const inputArea = {
  open: {
    height: '4rem',
    transition: { duration: 0.5 }
  }, 
  close: {
    height: '0rem',
    transition: { delay: 0.5 }
  },
  initial: {
    height: '0rem',
    overflow: 'hidden',
    originY: 1
  }
};

const inputAnimation = {
  add: {
    opacity: 1,
    scaleY: 1,
    originY: 0,
    transition: { 
      duration: 0.5,
      delay: 0.2
    }
  },
  hide: {
    opacity: 0,
    scaleY: 0,
    originY: 1,
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
      display='flex'
      alignItems='center'
      justifyContent='center'
      pl={4}
      pr={4}
      // p={4}
      key={key}
    >
      <InputGroup 
        size='md'
        // layout
        as={motion.div}
        animate={controlInput}
        initial='hide'
        exit='hide'
        color='gray.500'
        variants={inputAnimation}
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
    // display: 'flex',
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

enum InitializingState {
  notInit = 'not init',
  initializing = 'initializing',
  initialized = 'initialized',
  launched = 'launched',
}

export const Connector = React.memo<any>(({
  portalOpen = true, 
  onClosePortal,
  isExistDocker = true,
}:{
  portalOpen?: boolean; 
  onClosePortal: () => any;
  isExistDocker?: boolean;
}) => {
  const control = useAnimation();
  const controlNotInit = useAnimation();
  const controlInit = useAnimation();
  const controlInited = useAnimation();
  const controlLaunch = useAnimation();
  const [valueRemote, setValueRemote] = useState('');
  const [init, setInitLocal] = useState<InitializingState>(InitializingState.notInit);
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
    if (portalOpen == true) {
      control.start("grow"); 
    } else {
      control.start("shrink");
    }
  }, [control, portalOpen]);

  useEffect(() => {
    if (init === InitializingState.initializing) { 
      controlNotInit.start('close');
      controlInit.start('open');
    } else if (init === InitializingState.initialized) {
      controlNotInit.start('initializing');
      controlInit.start('initializing');
      controlInited.start('open');
    } else if (init === InitializingState.launched) {
      controlNotInit.start('initializing');
      controlInit.start('initializing');
      controlInited.start('initializing');
      controlLaunch.start('open');
    } else {
      controlNotInit.start('initializing');
      controlInit.start('initializing');
      controlInited.start('initializing');
      controlLaunch.start('initializing');
      controlNotInit.start("open");
    } 
  }, [init]);

  return (<ModalWindow onClosePortal={onClosePortal} portalOpen={portalOpen}>
      <Box 
        display='flex'
        flexDirection='column'
        alignItems='center'
      >
        <Box>
          <Box boxSize='5rem' mb={4}>
            <Image src='./logo_n.svg' alt='logo' />
          </Box>
        </Box>
        <ConnectorGrid 
          alignItems='center'
          sx={{
            '& > *:not(:last-of-type)': {
              mr: init == InitializingState.notInit ? 0 : 4,
            }
          }}
        >
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
            initial='grow'
            variants={cardAnimation}
            key={1221}
          >
            <Box pt={4} pl={4} pr={4} textAlign='left' w='100%'>
              <Text color='gray.400' fontSize='md'>Remote deep</Text>
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
              <Text color='gray.400' fontSize='md'>Local deep</Text>
              {!isExistDocker ? <DockerWarning /> : null}
            </Box>
            <Box 
              bg='#141214'
              pl={4}
              pb={2}
              boxSizing='border-box'
              w='100%'
              position='relative'
              borderBottomLeftRadius='5px'
              borderBottomRightRadius='5px'
              filter='auto'
              blur={isExistDocker === false ? '2px' : 0}
            > 
              <AnimatePresence>
                <Box 
                  key={InitializingState.notInit}
                  w='100%' 
                  minW='19.75rem'
                  h='100%' 
                  display='flex' 
                  justifyContent='space-between'
                  alignItems='center'
                  as={motion.div}
                  animate={controlNotInit}
                  initial='initial'
                  variants={initArea}
                  onClick={() => setInitLocal(InitializingState.initializing)} 
                >
                  <Text color='gray.400' fontSize='sm' as='kbd'>no initialized</Text>
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
                  key={InitializingState.initializing}
                  w='100%' 
                  minW='19.75rem'
                  h='100%' 
                  display='flex' 
                  position='absolute'
                  top={0} left={4}
                  justifyContent='space-between'
                  alignItems='center'
                  as={motion.div}
                  animate={controlInit}
                  initial='initializing'
                  variants={initArea}
                  onClick={() => setInitLocal(InitializingState.initialized)} 
                >
                  <Initializing />
                </Box>
                <Box 
                  key={InitializingState.initialized}
                  w='100%' 
                  minW='19.75rem'
                  h='100%'  
                  position='absolute'
                  top={0} left={0}
                  as={motion.div}
                  animate={controlInited}
                  initial='initializing'
                  variants={initArea}
                >
                  <ButtonTextButton 
                    onClickLeft={() => setInitLocal(InitializingState.launched)} 
                    onClickRight={() => setInitLocal(InitializingState.launched)} 
                  />
                </Box>
                <Box 
                  key={InitializingState.launched}
                  w='100%' 
                  minW='19.75rem'
                  h='100%'  
                  position='absolute'
                  top={0} left={0}
                  as={motion.div}
                  animate={controlLaunch}
                  initial='initializing'
                  variants={initArea}
                  onClick={() => setInitLocal(InitializingState.notInit)} 
                >
                  <ButtonTextButton 
                    text='launched'
                    ariaLabelLeft=""
                    ariaLabelRight=""
                    ComponentRightIcon={IoStopOutline}
                    onClickLeft={() => setInitLocal(InitializingState.launched)} 
                    onClickRight={() => setInitLocal(InitializingState.launched)} 
                  />
                </Box>
              </AnimatePresence>
            </Box>
          </Box>
          <TerminalConnect 
            openTerminal={init == InitializingState.initializing ? true : false} 
            key={21121} />
        </ConnectorGrid>
      </Box>
    </ModalWindow>
  )
})
