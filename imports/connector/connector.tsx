import { Box, Divider, Flex, IconButton, Image, Input, InputGroup, InputLeftElement, InputRightElement, Text } from '@chakra-ui/react';
import { useDebounceCallback } from "@react-hook/debounce";
import { AnimatePresence, motion, useAnimation } from 'framer-motion';
import React, { useEffect, useRef, useState } from "react";
import { IoAddOutline, IoPlayOutline, IoStopOutline } from 'react-icons/io5';
import { BsFillPauseFill } from 'react-icons/bs';
import { MdDelete } from 'react-icons/md';
import { CustomizableIcon } from "../icons-provider";
import { ModalWindow } from "../modal-window";
import { DockerWarning } from './docker-warning';
import axios from 'axios';
import { Loading } from '../loading-motion-bubble';

const DOCKER = process.env.DOCKER || '0';

const delay = ms => new Promise(resolve => setTimeout(resolve, ms))

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

const callEngine = async ({ serverUrl, operation, terminal }: { serverUrl: string; operation: string; terminal?: any}) => {
  terminal?.resize(terminal.cols,terminal.rows);
  const r = await axios({ 
    method: 'post',
    url: `${serverUrl}/api/deeplinks`,
    headers: {
      'Content-Type': 'application/json'
    },
    data: {
      operation
    }
  });
  if (terminal) {
    terminal?.writeln(JSON.stringify(r.data?.envs));
    terminal?.writeln(r.data?.engineStr);
    const strings = r?.data?.result?.stdout?.split('\n');
    if (r?.data?.result?.stderr) terminal?.writeln(r?.data?.result?.stderr);
    for (let i = 0; i < strings?.length; i++) terminal?.writeln(strings[i]);
    terminal?.writeln('');
  }
  return r;
};


const TerminalConnect = React.memo<any>(({
  initializingState = undefined, 
  setInitLocal, 
  serverUrl,
  setGqlPath,
  setGqlSsl,
}:{
  initializingState?: InitializingState; 
  closeTerminal: () => any; 
  setInitLocal: (state) => any; 
  terminalClosed: boolean; 
  serverUrl: string;
  setGqlPath: (path: string) => any;
  setGqlSsl: (ssl: boolean) => any; 
}) => {
  const terminalBoxRef = useRef<any>();
  const terminalRef = useRef<any>();
  const control = useAnimation();
  // const animation = useAnimation();

  useEffect(() => {
    (async () => {
      const { Terminal } = await import("xterm");
      const terminal = new Terminal({
        cursorBlink: true,
        cursorStyle: 'block',
      });
      terminalRef.current = terminal;
      if (terminalBoxRef.current){
        terminal?.open(terminalBoxRef.current);
        terminal?.writeln('Hello \x1B[1;3;31mbugfixers\x1B[0m!');
      }
    })();
  }, []);

  useEffect(() => {
    if(initializingState == 'initializing') {
      control.start('grow');
      // animation.start('display');
      setTimeout(async() => {
        terminalRef?.current?.resize(terminalRef.current.cols,terminalRef.current.rows);
        const initResult = await callEngine({ serverUrl, operation: 'init', terminal: terminalRef.current });
        console.log(initResult);
        const migrateResult = await callEngine({ serverUrl, operation: 'migrate', terminal: terminalRef.current });
        console.log(migrateResult);
        const checkResult = await callEngine({ serverUrl, operation: 'check', terminal: terminalRef.current });
        console.log(checkResult);

        await delay(2000);
        setInitLocal(InitializingState.launched);
        setGqlPath('localhost:3006/gql');
        setGqlSsl(false);
      }, 2000);
    } else if (initializingState == 'removing') {
        control.start('grow');
        // animation.start('display');
        setTimeout(async() => {
          terminalRef?.current?.resize(terminalRef.current.cols,terminalRef.current.rows);
          await callEngine({ serverUrl, operation: 'reset', terminal: terminalRef.current });
          // control.start('shrink');
          await delay(2000);
          setInitLocal(InitializingState.notInit);
          await delay(1000);
          setGqlPath('');
          setGqlSsl(false);
        }, 2000);
    } else if (initializingState == 'launched' || initializingState == 'not init') {
      if (terminalRef.current) terminalRef.current.clear();
      control.start('shrink');
    }
  }, [control, initializingState]);

  return (
    <AnimatePresence>
      <Box 
        key={432432}
        as={motion.div}
        overflow='auto'
        sx={{ overscrollBehavior: 'contain'}}
        borderRadius='5px'
        border='1rem solid #141214'
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
          h='25rem'
          sx={{
            '& > *': {
              height: '100%',
            },
          }}
        />
      </Box>
    </AnimatePresence>
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

// const cardAnimation = {
//   grow: {
//     scale: 1,
//     opacity: 1,
//     transition: { duration: 0.8}
//   },
//   shrink: {
//     scale: 0,
//     opacity: 0,
//     transition: { duration: 0.8, delay: 0.5}
//   }
// };

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
  removing = 'removing',
}

export const Connector = React.memo<any>(({
  portalOpen = true,
  setPortal,
  gqlPath,
  gqlSsl,
  serverUrl,
  deeplinksUrl,
  setGqlPath,
  setGqlSsl,
  // onClosePortal,
}:{
  portalOpen?: boolean;
  setPortal?: (state?: boolean) => any;
  gqlPath: string;
  gqlSsl: boolean;
  serverUrl: string;
  deeplinksUrl: string;
  setGqlPath: (path: string) => any;
  setGqlSsl: (ssl: boolean) => any; 
  // onClosePortal: (portalOpen: boolean) => any;
}) => {
  const control = useAnimation();
  const controlNotInit = useAnimation();
  const controlInit = useAnimation();
  const controlInited = useAnimation();
  const controlLaunch = useAnimation();
  const controlRemoving = useAnimation();
  const [valueRemote, setValueRemote] = useState('');
  const [isExistDocker, setIsExistDocker] = useState(true);
  const [init, setInitLocal] = useState<InitializingState>(InitializingState.notInit);
  const onChangeValueRemote = useDebounceCallback((value) => {
    setValueRemote(value);
  }, 500);

  // const [ portalOpen, setPortal ] = useState(true); 
  const onClosePortal = () => setPortal(false);
  
  const [remoteRouts, setArr] = useState([]);

  const checkDeeplinksStatus = async () => {
    let status;
    let err;
    try {
      // DL may be not in docker, when DC in docker, so we use host.docker.internal instead of docker-network link deep_links_1
      status = await axios.get(`${+DOCKER ? 'http://host.docker.internal:3006' : deeplinksUrl}/api/healthz`, { validateStatus: status => true, timeout: 7000 });
    } catch(e){
      err = e;
    }
    return { result: status?.data?.docker, error: err };
  };
  
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
    } else if (init === InitializingState.removing) {
      controlNotInit.start('initializing');
      controlInit.start('initializing');
      controlInited.start('initializing');
      controlLaunch.start('initializing');
      controlRemoving.start("open");
    } else if (init === InitializingState.notInit) {
      controlNotInit.start('initializing');
      controlInit.start('initializing');
      controlInited.start('initializing');
      controlLaunch.start('initializing');
      controlRemoving.start("initializing");
      controlNotInit.start("open");
      // controlNotInit.start('close');
    } 
  }, [init]);

  useEffect(() => {
    (async () => {
      const status = await checkDeeplinksStatus();
      if (status.result !== undefined) {
        setInitLocal(InitializingState.notInit);
        await delay(1000);
        setInitLocal(InitializingState.launched);
        if (!gqlPath){
          setGqlPath('localhost:3006/gql');
          setGqlSsl(false);
        }
      }
    })();
  }, [portalOpen]);

  useEffect(() => {
    (async () => {
      const dockerStatus = await callEngine({ serverUrl, operation: 'dock' });
      // console.log('docker', dockerStatus);
      // console.log('docker', dockerStatus?.data?.result?.stdout?.[0]);
      // console.log('docker', dockerStatus?.data?.result?.stdout?.[0] !== '{');
      console.log('dockerStatusObj', dockerStatus);
      if (dockerStatus?.data?.result?.stdout?.[0] !== '{') setIsExistDocker(false);
      const dockerComposeStatus = await callEngine({ serverUrl, operation: 'compose' });
      console.log('dockerComposeStatusObj', dockerComposeStatus);
      // console.log('docker', dockerComposeStatus);
      // console.log('docker', dockerComposeStatus?.data?.result?.stdout.toString());
      // console.log('docker', !/^-?[a-z0-9]+\r?\n?$/.test(dockerComposeStatus?.data?.result?.stdout.toString()));
      if (!/^-?[a-z0-9.]+\r?\n?$/.test(dockerComposeStatus?.data?.result?.stdout.toString())) setIsExistDocker(false);
    })();
  }, []);

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
            // as={motion.div}
            display='flex' 
            flexDir='column' 
            alignItems='center' 
            justifyContent='center' 
            height='100%'
            width='max-content'
            bg='#141214'
            borderRadius='5px'
            // animate={control}
            // initial='grow'
            // variants={cardAnimation}
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
                  onDeleteValue={(e) => {
                    if (gqlPath == rr.value) {
                      setGqlPath('');
                      setGqlSsl(false);
                    }
                    remove(rr.id)
                    }
                  }
                  onStartRemoteRoute={() => {
                    try {
                      const url = new URL(rr.value);
                      setGqlPath(`${url.hostname}${url.port ? ':' + url.port : ''}${url.pathname}`);
                      setGqlSsl(url.protocol == 'http:' ? false : true);
                    } catch(e) {
                      console.log('URL error', e);
                    }
                  }}
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
                  onClick={() => {
                    setInitLocal(InitializingState.initializing);
                    setTimeout(() => {
                      setInitLocal(InitializingState.initialized);
                    }, 3000)
                  }} 
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
                  <Loading text="Initializing" 
                    sxFlex={{pt: 2, pb: 2}}
                    sx={{
                      pb: '0.3125rem',
                    }}
                  />
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
                    ariaLabelLeft="go to launched deepcase"
                    ariaLabelRight="launched local deepcase"
                    ComponentRightIcon={BsFillPauseFill}
                    onClickLeft={() => setInitLocal(InitializingState.launched)} 
                    onClickRight={() => setInitLocal(InitializingState.notInit)} 
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
                  // onClick={() => setInitLocal(InitializingState.notInit)} 
                >
                  <ButtonTextButton 
                    text='launched'
                    ariaLabelLeft="go to deepcase"
                    ariaLabelRight="delete local deepcase"
                    // ComponentRightIcon={IoStopOutline}
                    onClickLeft={() => setPortal(false)} 
                    onClickRight={() => {
                      setInitLocal(InitializingState.removing)
                    }} 
                  />
                </Box>
                <Box 
                  key={InitializingState.removing}
                  w='100%' 
                  minW='19.75rem'
                  h='100%'  
                  position='absolute'
                  top={0} left={0}
                  pl={4}
                  as={motion.div}
                  animate={controlRemoving}
                  initial='initializing'
                  variants={initArea}
                >
                  <Loading text="Removing" 
                    sxFlex={{pt: 2, pb: 2}}
                    sx={{
                      pb: '0.3125rem',
                      '& > *:not(:last-of-type)': {
                        mr: 1
                      }
                    }} 
                  />
                </Box>
              </AnimatePresence>
            </Box>
          </Box>
          <TerminalConnect 
            initializingState={init} 
            setInitLocal={(state)=>setInitLocal(state)}
            key={21121}
            serverUrl={serverUrl}
            setGqlPath={(path) => setGqlPath(path)}
            setGqlSsl={(ssl) => setGqlSsl(ssl)}
          />
        </ConnectorGrid>
      </Box>
    </ModalWindow>
  )
})
