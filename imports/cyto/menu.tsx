import { CloseIcon } from "@chakra-ui/icons";
import { Box, Button, ButtonGroup, FormControl, FormLabel, HStack, IconButton, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Switch, Tag, TagLabel, Text, VStack, Select } from "@chakra-ui/react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import copy from "copy-to-clipboard";
import { motion, useAnimation } from 'framer-motion';
import React, { useEffect, useState, ChangeEvent } from "react";
import { HiMenuAlt2 } from 'react-icons/hi';
import { SlClose } from 'react-icons/sl';
import { Appearance } from "../component-appearance";
import { useAutoFocusOnInsert, useBreadcrumbs, useContainer, useLayout, useMediaQuery, usePromiseLoader, useReserved, useShowExtra, useShowFocus, useShowTypes, useSpaceId, useTraveler, useLayoutAnimation } from "../hooks";
import { useCytoEditor } from "./hooks";

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

const DeepSwitch = React.memo(({
  id,
  isChecked,
  onChange,
}: {
  id: string;
  isChecked: boolean;
  onChange: () => any;
}) => {

  return (<Switch
    id={id}
    isChecked={isChecked}
    onChange={onChange}
    sx={{
      '& > span': {
        background: isChecked == false ? '#8a8989' : 'switchOn'
      },
      '& > span span': {
        background: 'switchThumb'
      }
    }}
  />
  )
})

export function CytoMenu({
  cyRef,
  gqlPath,
  gqlSsl,
  openPortal,
}: {
  cyRef?: any;
  gqlPath: string,
  gqlSsl: boolean,
  openPortal?: () => any;
}) {
  const [spaceId, setSpaceId] = useSpaceId();
  const [showTypes, setShowTypes] = useShowTypes();
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const { layout, setLayout, layoutName } = useLayout();
  const [promiseLoader, setPromiseLoader] = usePromiseLoader();
  const [autoFocus, setAutoFocus] = useAutoFocusOnInsert();

  const [pasteError, setPasteError] = useState(false);
  const [valid, setValid] = useState<any>(undefined);
  const [container, setContainer] = useContainer();
  const [extra, setExtra] = useShowExtra();
  const [focus, setFocus] = useShowFocus();
  const [traveler, setTraveler] = useTraveler();
  const [reserved, setReserved] = useReserved();
  const [breadcrumbs, setBreadcrumbs] = useBreadcrumbs();
  const [layoutAnimation, setLayoutAnimation] = useLayoutAnimation();
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

const handlerChangeLayout = (event: ChangeEvent<HTMLSelectElement>) => {
  const value = event.target.selectedOptions[0].value;
  if (value !== 'cola' && value !== 'deep-d3-force') return;
  setLayout(value)
}

  return (<Box
    left={0}
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
          bg='backgroundModal'
          borderBottomLeftRadius='0.5rem'
          borderBottomRightRadius='0.5rem'
          sx={{
            borderWidth: 'thin',
            borderColor: 'borderColor',
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
              <ButtonGroup size='sm' isAttached variant='outline' color='text'>
                <Button disabled borderColor='gray.400' background='buttonBackgroundModal'>auth</Button>
                <Button borderColor='gray.400' background='buttonBackgroundModal'>{deep.linkId}</Button>
                <IconButton aria-label='close menu' icon={<CloseIcon />} onClick={async () => {
                  const guest = await deep.guest();
                  setSpaceId(guest.linkId);
                  setContainer(guest.linkId);
                }} borderColor='gray.400' background='buttonBackgroundModal'/>
              </ButtonGroup>
              <ButtonGroup size='sm' isAttached variant='outline' color='text'>
                <Button disabled borderColor='gray.400' background='buttonBackgroundModal'>space</Button>
                <Button borderColor='gray.400' background='buttonBackgroundModal'>{spaceId}</Button>
                <IconButton aria-label='Quit to user space' icon={<CloseIcon />} onClick={() => {
                  setSpaceId(deep.linkId);
                  setContainer(deep.linkId);
                }} borderColor='gray.400' background='buttonBackgroundModal' />
              </ButtonGroup>
              <ButtonGroup size='sm' isAttached variant='outline' color='text'>
                <Button disabled borderColor='gray.400' background='buttonBackgroundModal'>container</Button>
                <Button borderColor='gray.400' background='buttonBackgroundModal'>{container}</Button>
                <IconButton aria-label='Quit to user space' icon={<CloseIcon />} onClick={() => {
                  setContainer(deep.linkId);
                }} borderColor='gray.400' background='buttonBackgroundModal'/>
              </ButtonGroup>
              <ButtonGroup size='sm' isAttached variant='outline' color='text'>
                <Button colorScheme={pasteError ? 'red' : valid ? 'blue' : undefined} onClick={async () => {
                <Button onClick={() => {
                  copy(deep.token);
                }} borderColor='gray.400' background='buttonBackgroundModal'>copy token</Button>
                if (valid) await deep.login({ token: valid });
                else {
                  setPasteError(false);
                  const token: string = await navigator?.clipboard?.readText();
                  const { linkId, error } = await deep.jwt({ token });
                  if (error && !linkId) setPasteError(true);
                  else if (linkId) setValid(token);
                }
              }} borderColor='gray.400' background='buttonBackgroundModal'>{valid ? 'login token' : 'paste token'}</Button>
              </ButtonGroup>
              <ButtonGroup size='sm' isAttached variant='outline' color='text'>
                <Button borderColor='gray.400' background='buttonBackgroundModal' as='a' href={`http${gqlSsl ? 's' : ''}://${gqlPath}`} target="_blank">gql</Button>
              </ButtonGroup>
              <ButtonGroup size='sm' isAttached variant='outline' color='text'>
                <Button borderColor='gray.400' background='buttonBackgroundModal' onClick={() => setCytoEditor(true)}>editor</Button>
              </ButtonGroup>
            </HStack>
            <HStack spacing={5}>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color='text' htmlFor='autofocus-on-insert' mb='0' fontSize='sm' mr='0.25rem'>
                  autofocus
                </FormLabel>
                <DeepSwitch id='autofocus-on-insert' isChecked={autoFocus} onChange={() => setAutoFocus(!autoFocus)} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color='text' htmlFor='show-focus' mb='0' fontSize='sm' mr='0.25rem'>
                  focus
                </FormLabel>
                <DeepSwitch id='show-focus' isChecked={focus} onChange={() => setFocus(!focus)} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color='text' htmlFor='show-extra-switch' mb='0' fontSize='sm' mr='0.25rem'>
                  debug
                </FormLabel>
                <DeepSwitch id='show-extra-switch' isChecked={extra} onChange={() => setExtra(!extra)} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color='text' htmlFor='show-types-switch' mb='0' fontSize='sm' mr='0.25rem'>
                  types
                </FormLabel>
                <DeepSwitch id='show-types-switch' isChecked={showTypes} onChange={() => setShowTypes(!showTypes)} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color='text' htmlFor='show-promise-loader-switch' mb='0' fontSize='sm' mr='0.25rem'>
                  promises
                </FormLabel>
                <DeepSwitch id='show-promise-loader-switch' isChecked={promiseLoader} onChange={() => setPromiseLoader(!promiseLoader)} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color='text' htmlFor='show-traveler-switch' mb='0' fontSize='sm' mr='0.25rem'>
                  traveler
                </FormLabel>
                <DeepSwitch id='show-traveler-switch' isChecked={traveler} onChange={() => setTraveler(!traveler)} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel color='text' htmlFor='breadcrumbs-switch' mb='0' fontSize='sm' mr='0.25rem'>
                  breadcrumbs
                </FormLabel>
                <DeepSwitch id='breadcrumbs-switch' isChecked={breadcrumbs} onChange={() => setBreadcrumbs(!breadcrumbs)} />
              </FormControl>
              <FormControl display='flex' alignItems='center'>
              <FormLabel htmlFor='animation-layout-switch' mb='0' fontSize='sm' mr='0.25rem'>
                animation
              </FormLabel>
              <Switch id='animation-layout-switch' isChecked={layoutAnimation} onChange={() => setLayoutAnimation(!layoutAnimation)}/>
              </FormControl>
              <FormControl display='flex' alignItems='center'>
                <FormLabel mb='0' fontSize='sm' mr='0.25rem'>
                  layout
                </FormLabel>
                <Box width="120px" margin="0 auto">
                  <Select onChange={handlerChangeLayout} value={layoutName}>
                    <option value='cola'>cola</option>
                    <option value='deep-d3-force'>d3-force</option>
                  </Select>
                </Box>
              </FormControl>
              {/* <FormControl display='flex' alignItems='center'>
                <FormLabel htmlFor='reserved switch' mb='0' fontSize='sm' mr='0.25rem'>
                reserved
                </FormLabel>
                <Switch id='reserved switch' isChecked={reserved} onChange={() => setReserved(!reserved)}/>
              </FormControl> */}
            </HStack>
            <HStack>
              <MenuSearch cyRef={cyRef} bg='buttonBackgroundModal' />
              <ButtonGroup size='sm' isAttached variant='outline' color='text'>
                <Button onClick={async () => {
                  await deep.delete({ _or: [{ type_id: deep.idLocal('@deep-foundation/core', 'Focus'), from_id: spaceId }, { type_id: deep.idLocal('@deep-foundation/core', 'Contain'), from_id: spaceId, to: { type_id: deep.idLocal('@deep-foundation/core', 'Focus'), from_id: spaceId }}] });
                }} borderColor='gray.400' background='buttonBackgroundModal'>clear focuses</Button>
              </ButtonGroup>
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
      {
        in: {
          type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
          value: {
            value: {
              _ilike: value,
              _neq: '',
            }
          },
        }
      },
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
  // console.log({ all });

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
              key={link.id}
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
              key={link.id}
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
              key={link.id}
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