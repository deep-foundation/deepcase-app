import { CloseIcon } from "@chakra-ui/icons";
import { HStack, ButtonGroup, Button, IconButton, FormControl, FormLabel, Switch, Box, VStack, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Input, Tag, TagLabel, Text, useColorModeValue } from "@chakra-ui/react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import copy from "copy-to-clipboard";
import { useState, useEffect, useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSpaceId, useShowTypes, useLayout, useContainer, useShowExtra, useShowFocus, usePromiseLoader, useTraveler, useMediaQuery, useAutoFocusOnInsert, useBreadcrumbs, useReserved } from "../hooks";
import { useCytoEditor } from "./hooks";
import { IoExitOutline } from 'react-icons/io5';
import { PackagerInterface } from "../packager-interface/packager-interface";
import { Appearance } from "../component-appearance";
import { SlClose } from 'react-icons/sl';
import { HiMenuAlt2 } from 'react-icons/hi';
import { motion, useAnimation } from 'framer-motion';

const NEXT_PUBLIC_GQL_PATH = process.env.NEXT_PUBLIC_GQL_PATH || 'localhost:3006/gql';
const NEXT_PUBLIC_GQL_SSL = process.env.NEXT_PUBLIC_GQL_SSL || '0';

const variants = {
  show: {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    borderRadius: '0.5rem',
    display: 'block',
    transition: { duration: 0.5 }
  },
  hide: {
    scaleX: 0.3,
    scaleY: 0.1,
    opacity: 0,
    borderRadius: '50rem',
    display: 'none',
    transition: { 
      duration: 0.5,
      display: { delay: 0.6 }, 
      opacity: { duration: 0.4 },
    }
  },
  initial: {
    originX: 0,
    originY: 0,
    scaleX: 0,
    scaleY: 0,
    opacity: 0,
    display: 'none'
  }
}

const buttonVariant = {
  show: {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    borderRadius: '0.5rem',
    display: 'block',
    transition: { duration: 0.5 }
  },
  hide: {
    scaleX: 0.3,
    scaleY: 0.1,
    opacity: 0,
    borderRadius: '50rem',
    display: 'none',
    transition: { 
      duration: 0.5,
      display: { delay: 0.6 }, 
      opacity: { duration: 0.4 },
    }
  },
  initial: {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    display: 'block'
  }
}

export function CytoMenu({
  cyRef,
  openPortal,
}: {
  cyRef?: any;
  openPortal?: () => any;
}) {
  const [spaceId, setSpaceId] = useSpaceId();
  const [showTypes, setShowTypes] = useShowTypes();
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const { layout, setLayout, layoutName } = useLayout();
  const [promiseLoader, setPromiseLoader] = usePromiseLoader();
  const [autoFocus, setAutoFocus] = useAutoFocusOnInsert();

  console.log('cytoEditor', cytoEditor)

  const [pasteError, setPasteError] = useState(false);
  const [valid, setValid] = useState<any>(undefined);
  const [container, setContainer] = useContainer();
  const [extra, setExtra] = useShowExtra();
  const [focus, setFocus] = useShowFocus();
  const [traveler, setTraveler] = useTraveler();
  const [reserved, setReserved] = useReserved();
  const [breadcrumbs, setBreadcrumbs] = useBreadcrumbs();
  const deep = useDeep();
  const [max300] = useMediaQuery('(max-width: 300px)');
  const [togglePackager, setTogglePackager] = useState(false);

  const control = useAnimation();
  useEffect(() => {
    if (togglePackager === true) {
      control.start("hide"); 
    } else {
      control.start("show");
    }
  }, [control, togglePackager]);

  useEffect(() => {
    const timer = setTimeout(() => {
      setPasteError(false);
      setValid(undefined);
    }, 3000);
    return () => clearTimeout(timer);
  }, [pasteError, valid]);

  // const bg = useColorModeValue('#141214b6', '#90cdf4e6');
  const bg = useColorModeValue('blue.50', 'blue.900')
  const buttonBg = useColorModeValue('#eeeeee', '#141214');
  const borderColor = useColorModeValue('#d2cece', '#718096');
  const switchLabelColor = useColorModeValue('#111720', '#eeeeee');
  const switchCheck = useColorModeValue('#0080ff', '#90cdf4');
  

  return (<Box 
    left={0} 
    // ml='8' 
    // mt='4' 
    pos='fixed'>
    <Button 
      as={motion.button}
      variants={buttonVariant} 
      animate={control}
      colorScheme='blue' 
      onClick={() => setTogglePackager(true)} 
      pos='absolute' 
      left={4} top={4}><HiMenuAlt2 /></Button>
    <Appearance 
      toggle={togglePackager} 
      variantsAnimation={variants} 
      initial='initial'
      styleProps={{overflow: 'uset'}}
    > 
      <>
        <Box  
          pt='0.2rem'
          w='max-content'
          bg={bg}
          borderBottomLeftRadius='0.5rem'
          borderBottomRightRadius='0.5rem'
          sx={{
            border: `thin solid ${borderColor}`,
          }}
        >
          <VStack spacing='1rem' m='1rem' align={'flex-start'}>
            <HStack>
              <IconButton 
                aria-label='menu close' 
                variant='ghost' 
                colorScheme='current'
                isRound 
                icon={<SlClose />} 
                onClick={() => setTogglePackager(false)} 
              />
              <ButtonGroup size='sm' isAttached variant='outline'>
                <Button disabled borderColor='gray.400' background={buttonBg}>auth</Button>
                <Button borderColor='gray.400' background={buttonBg}>{deep.linkId}</Button>
                <IconButton aria-label='Reauth as guest' icon={<CloseIcon />} onClick={async () => {
                  const guest = await deep.guest();
                  setSpaceId(guest.linkId);
                  setContainer(guest.linkId);
                }} borderColor='gray.400' background={buttonBg}/>
              </ButtonGroup>
              <ButtonGroup size='sm' isAttached variant='outline'>
                <Button disabled borderColor='gray.400' background={buttonBg}>space</Button>
                <Button borderColor='gray.400' background={buttonBg}>{spaceId}</Button>
                <IconButton aria-label='Quit to user space' icon={<CloseIcon />} onClick={() => {
                  setSpaceId(deep.linkId);
                  setContainer(deep.linkId);
                }} borderColor='gray.400' background={buttonBg} />
              </ButtonGroup>
              <ButtonGroup size='sm' isAttached variant='outline'>
                <Button disabled borderColor='gray.400' background={buttonBg}>container</Button>
                <Button borderColor='gray.400' background={buttonBg}>{container}</Button>
                <IconButton aria-label='Quit to user space' icon={<CloseIcon />} onClick={() => {
                  setContainer(deep.linkId);
                }} borderColor='gray.400' background={buttonBg}/>
              </ButtonGroup>
              <ButtonGroup size='sm' isAttached variant='outline'>
                <Button onClick={() => {
                  copy(deep.token);
                }} borderColor='gray.400' background={buttonBg}>copy token</Button>
                <Button colorScheme={pasteError ? 'red' : valid ? 'blue' : undefined} onClick={async () => {
                if (valid) await deep.login({ token: valid });
                else {
                  setPasteError(false);
                  const token: string = await navigator?.clipboard?.readText();
                  const { linkId, error } = await deep.jwt({ token });
                  if (error && !linkId) setPasteError(true);
                  else if (linkId) setValid(token);
                }
                }} borderColor='gray.400' background={buttonBg}>{valid ? 'login token' : 'paste token'}</Button>
              </ButtonGroup>
              <ButtonGroup size='sm' isAttached variant='outline'>
                <Button borderColor='gray.400' background={buttonBg} as='a' href={`http${+NEXT_PUBLIC_GQL_SSL ? 's' : ''}://${NEXT_PUBLIC_GQL_PATH}`} target="_blank">gql</Button>
              </ButtonGroup>
              <ButtonGroup size='sm' isAttached variant='outline'>
                <Button borderColor='gray.400' background={buttonBg} onClick={() => setCytoEditor(true)}>editor</Button>
              </ButtonGroup>
            </HStack>
            <HStack spacing={5}>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color={switchLabelColor} htmlFor='autofocus-on-insert' mb='0' fontSize='sm' mr='0.25rem'>
                  autofocus
                </FormLabel>
                <Switch id='autofocus-on-insert' isChecked={autoFocus} onChange={() => setAutoFocus(!autoFocus)} sx={{
                  '&>span': {background: autoFocus == false ? '#8a8989' : switchCheck}}} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color={switchLabelColor} htmlFor='show-focus' mb='0' fontSize='sm' mr='0.25rem'>
                  focus
                </FormLabel>
                <Switch id='show-focus' isChecked={focus} onChange={() => setFocus(!focus)} sx={{
                  '&>span': {background: focus == false ? '#8a8989' : switchCheck}}} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color={switchLabelColor} htmlFor='show-extra-switch' mb='0' fontSize='sm' mr='0.25rem'>
                  debug
                </FormLabel>
                <Switch id='show-extra-switch' isChecked={extra} onChange={() => setExtra(!extra)} sx={{
                  '&>span': {background: extra == false ? '#8a8989' : switchCheck}}} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color={switchLabelColor} htmlFor='show-types-switch' mb='0' fontSize='sm' mr='0.25rem'>
                  types
                </FormLabel>
                <Switch id='show-types-switch' isChecked={showTypes} onChange={() => setShowTypes(!showTypes)} sx={{
                  '&>span': {background: showTypes == false ? '#8a8989' : switchCheck}}} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color={switchLabelColor} htmlFor='show-promise-loader-switch' mb='0' fontSize='sm' mr='0.25rem'>
                  promises
                </FormLabel>
                <Switch id='show-promise-loader-switch' isChecked={promiseLoader} onChange={() => setPromiseLoader(!promiseLoader)} sx={{
                  '&>span': {background: promiseLoader == false ? '#8a8989' : switchCheck}}} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color={switchLabelColor} htmlFor='show-traveler-switch' mb='0' fontSize='sm' mr='0.25rem'>
                  traveler
                </FormLabel>
                <Switch id='show-traveler-switch' isChecked={traveler} onChange={() => setTraveler(!traveler)} sx={{
                  '&>span': {background: traveler == false ? '#8a8989' : switchCheck}}} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color={switchLabelColor} htmlFor='breadcrumbs-switch' mb='0' fontSize='sm' mr='0.25rem'>
                  breadcrumbs
                </FormLabel>
                <Switch id='breadcrumbs-switch' isChecked={breadcrumbs} onChange={() => setBreadcrumbs(!breadcrumbs)} sx={{
                  '&>span': {background: breadcrumbs == false ? '#8a8989' : switchCheck}}} />
              </FormControl>
              {/* <FormControl display='flex' alignItems='center'>
                <FormLabel htmlFor='reserved switch' mb='0' fontSize='sm' mr='0.25rem'>
                  reserved
                </FormLabel>
                <Switch id='reserved switch' isChecked={reserved} onChange={() => setReserved(!reserved)}/>
              </FormControl> */}
            </HStack>
            <HStack>
              <MenuSearch cyRef={cyRef} bg={buttonBg} />
            </HStack>
          </VStack>
          {/* <Button bgColor='primary' color='white' size='sm' w='4rem' mt={10} mr={4} justifySelf='flex-end' rightIcon={<IoExitOutline />} onClick={openPortal}>Exit</Button> */}
        </Box>
      </>
    </Appearance>
  </Box>);
}

export const MenuSearch = ({ cyRef, bg }: { cyRef?: any; bg?: any; }) => {
  const deep = useDeep();
  const [value, setValue] = useState('');

  const byId = deep.useMinilinksQuery({
    _or: [
      { id: { _eq: parseInt(value) } },
    ],
  });
  const byValue = deep.useMinilinksQuery({
    value: {
      value: { _ilike: value },
    },
  });
  const byContain = deep.useMinilinksQuery({
    _or: [
      { in: {
        type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
        value: { value: {
          _ilike: value,
          _neq: '',
        } },
      } },
    ],
  });
  const all = [...byId, ...byValue, ...byContain];
  const [index, setIndex] = useState(-1);
  const [selected, setSelected] = useState(0);
  // useHotkeys('up,right,down,left', e => {
  //   const cy = cyRef?.current;
  //   e.preventDefault();
  //   // e.stopPropagation();
  //   if (index == -1) {
  //     setIndex(0);
  //   } else if (e.key == 'ArrowUp' || e.key == 'ArrowLeft') {
  //     setIndex(index => index < 0 ? all.length - 1 : 0);
  //   } else if (e.key == 'ArrowDown' || e.key == 'ArrowRight') {
  //     setIndex(index => index > all.length - 1 ? 0 : index + 1);
  //   }
  // }, { enableOnTags: ["TEXTAREA", "INPUT"] });
  useEffect(() => {
    setSelected(all[index]?.id);
  }, [index]);
  console.log({ all });

  // useHotkeys<any>('enter', e => {
  //   e.preventDefault();
  //   e.stopPropagation();
  // }, { enableOnTags: ["TEXTAREA", "INPUT"] });
  return <>
    <Popover placement='bottom-start' autoFocus={false}>
      <PopoverTrigger>
        <Input value={value} onChange={(e) => setValue(e.target.value)} borderColor='gray.400' background={bg} />
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight='semibold'>Search local</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody
          sx={{
            height: '30rem',
            overflow: 'scroll',
          }}
        >
          <Text as="h1">byId</Text>
          {byId.map(link => (console.log({ selected, link }),
            <Tag
              borderRadius='full'
              variant='solid'
              colorScheme={selected === link.id ? 'primary' : 'default'}
              onClick={(() => {
                const cy = cyRef?.current;
                console.log('cy', cy);
                console.log('cy el', `#${link?.id}`, cy.$(`#${link?.id}`));
                cy.center(cy.$(`#${link?.id}`));
              })}
            >
              <TagLabel>{deep.nameLocal(link.id) || link.id}</TagLabel>
            </Tag>
          ))}
          <Text as="h1">byContain</Text>
          {byContain.map(link => (
            <Tag
              borderRadius='full'
              variant='solid'
              colorScheme={selected === link.id ? 'primary' : 'default'}
              onClick={(() => {
                const cy = cyRef?.current;
                console.log('cy', cy);
                console.log('cy el', `#${link?.id}`, cy.$(`#${link?.id}`));
                cy.center(cy.$(`#${link?.id}`));
              })}
            >
              <TagLabel>{deep.nameLocal(link.id) || link.id}</TagLabel>
            </Tag>
          ))}
          <Text as="h1">byValue</Text>
          {byValue.map(link => (
            <Tag
              borderRadius='full'
              variant='solid'
              colorScheme={selected === link.id ? 'primary' : 'default'}
              onClick={(() => {
                const cy = cyRef?.current;
                console.log('cy', cy);
                console.log('cy el', `#${link?.id}`, cy.$(`#${link?.id}`));
                cy.center(cy.$(`#${link?.id}`));
              })}
            >
              <TagLabel>{deep.nameLocal(link.id) || link.id}</TagLabel>
            </Tag>
          ))}
        </PopoverBody>
      </PopoverContent>
    </Popover>
  </>;
};