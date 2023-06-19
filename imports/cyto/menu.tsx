import { CloseIcon } from "@chakra-ui/icons";
import { Box, Button, ButtonGroup, FormControl, FormLabel, HStack, IconButton, Input, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Switch, Tag, TagLabel, Text, VStack, Select, StackDivider } from "@chakra-ui/react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import copy from "copy-to-clipboard";
import { AnimatePresence, motion, useAnimation, useCycle } from 'framer-motion';
import React, { useEffect, useState, ChangeEvent } from "react";
import { HiMenuAlt2 } from 'react-icons/hi';
import { SlClose } from 'react-icons/sl';
import { Appearance } from "../component-appearance";
import { useAutoFocusOnInsert, useBreadcrumbs, useContainer, useLayout, useMediaQuery, useReserved, useShowExtra, useShowFocus, useShowTypes, useSpaceId, useTraveler, useLayoutAnimation } from "../hooks";
import { useCytoEditor } from "./hooks";
import { variants, buttonVariant, iconVariants, sideVariants, itemVariants } from "./menu-animation-variants";
import { TbArrowRotaryFirstRight } from "react-icons/tb";
import { ClientHandler } from "../client-handler";

const ListLayout = React.memo<any>(({ 
  currentLayout = 'cola',
  setCurrentLayout,
}:{
  currentLayout?: string;
  setCurrentLayout?: any;
}) => {
  const [open, cycleOpen] = useCycle(false, true);

  return (<>
      <Box position="relative" sx={{ height: 0, width: "10rem" }}>
        <AnimatePresence>
          {open && (
            <Box
              as={motion.div}
              animate={{
                scale: 1,
                transition: { duration: 0.3, type: "spring" }
              }}
              exit={{
                scale: 0,
                y: "2rem",
                transition: { delay: 0.7, duration: 0.3, type: "spring" }
              }}
              sx={{
                height: "2rem",
                width: "10rem",
                top: 0,
                left: 0,
                position: "absolute"
              }}
            >
              <Box
                as={motion.ul}
                initial="closed"
                animate="open"
                exit="closed"
                variants={sideVariants}
                sx={{
                  borderRadius: "0.5rem",
                  position: "relative",
                  zIndex: 44,
                  background: 'bgColor',
                  listStyle: "none",
                  padding: '0.5rem',
                  height: '4.5rem',
                  overflowY: 'scroll',
                  overscrollBehavior: 'contain',
                  filter: 'drop-shadow(0px 0px 1px #5f6977)',
                  outline: `solid 4px`,
                  outlineColor: 'colorOutline',
                  outlineOffset: '-4px',
                  '&>*:not(:last-child)': {
                    pt: '0.2rem',
                    pb: '0.2rem',
                  }
                }}
              >
                <Box
                  as={motion.li}
                  whileHover={{ scale: 1.05 }}
                  variants={itemVariants}
                  // sx={{ color: "#131111" }}
                  onClick={(value) => {
                    setCurrentLayout(value);
                    cycleOpen();
                  }}
                >
                  <Text fontSize='sm'>cola</Text>
                </Box>
                <Box
                  as={motion.li}
                  whileHover={{ scale: 1.05 }}
                  variants={itemVariants}
                  // sx={{ color: "#131111" }}
                  onClick={(value) => {
                    setCurrentLayout(value);
                    cycleOpen();
                  }}
                >
                  <Text fontSize='sm'>deep-d3-force</Text>
                </Box>
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Box>
      <Box
        position="relative"
        sx={{
          height: "2rem",
          width: "max-content",
        }}
      >
        <Box position="absolute">
          <Button 
            as={motion.button} 
            bg='bgColor' 
            onClick={() => cycleOpen()}
            sx={{
              height: '2rem',
              width: '10rem',
              filter: 'drop-shadow(0px 0px 1px #5f6977)',
              justifyContent: 'space-between',
            }}
            rightIcon={<Box as={motion.div}
            variants={iconVariants}
            animate={open ? "open" : "closed"}
            >
              <TbArrowRotaryFirstRight />
            </Box>}
          >
            <Text fontSize='sm'>{currentLayout}</Text>
          </Button>
        </Box>
      </Box>
    </>
  )
})

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

  const handlerChangeLayout = (event) => {
    const value = event.target.childNodes[0].data;
    // const value = event.target.selectedOptions[0].value;
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
                <Button onClick={() => {
                  copy(deep.token);
                }} borderColor='gray.400' background='buttonBackgroundModal'>copy token</Button>
                <Button colorScheme={pasteError ? 'red' : valid ? 'blue' : undefined} onClick={async () => {
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
                <FormLabel mb='0' fontSize='sm' mr='0.55rem'>
                  layout
                </FormLabel>
                <Box width="max-content" margin="0 auto">
                  {/* <Select onChange={handlerChangeLayout} value={layoutName}>
                    <option value='cola'>cola</option>
                    <option value='deep-d3-force'>d3-force</option>
                  </Select> */}
                  <ListLayout 
                    layout={layoutName}
                    currentLayout={layoutName}
                    setCurrentLayout={handlerChangeLayout}
                    
                  />
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
              <Travelers/>
            </HStack>
          </VStack>
          {/* <Button bgColor='primary' color='white' size='sm' w='4rem' mt={10} mr={4} justifySelf='flex-end' rightIcon={<IoExitOutline />} onClick={openPortal}>Exit</Button> */}
        </Box>
      </>
    </Appearance>
  </Box>);
}

const Travelers = () => {
  const deep = useDeep();
  const [spaceId] = useSpaceId();
  let Traveler = 0;
  try {
    Traveler = deep.idLocal('@deep-foundation/deepcase', 'Traveler');
  } catch(e) {}
  const travelers = deep.useMinilinksSubscription({
    type_id: Traveler,
    in: {
      type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
      from_id: spaceId,
    },
  });
  return <ButtonGroup size='sm' isAttached variant='outline' color='text'>
    <Popover>
      <PopoverTrigger>
        <Button>Travelers</Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody style={{ overflowY: 'auto', maxHeight: 300 }}>
          <VStack
            divider={<StackDivider borderColor='gray.200' />}
            spacing={4}
            align='stretch'
          >
            {travelers.map(traveler => <Box>
              <IconButton
                aria-label={`Delete traveler ##${traveler.id}`} icon={<>❌</>}
                onClick={() => deep.delete({
                  _or: [
                    { id: traveler?.id, },
                    { id: traveler?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.find(l => l.from_id === spaceId)?.id, },
                    { id: traveler?.to_id, },
                    { id: traveler?.to?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.find(l => l.from_id === spaceId)?.id, },
                    { id: traveler?.to?.inByType?.[deep.idLocal('@deep-foundation/core', 'Active')]?.find(l => l.from_id === spaceId)?.id, },
                    { id: traveler?.to?.inByType?.[deep.idLocal('@deep-foundation/core', 'Active')]?.find(l => l.from_id === spaceId)?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.find(l => l.from_id === spaceId)?.id, },
                  ],
                })}
              /> {traveler.id}
              <Box><pre><code>{JSON.stringify(traveler?.to?.value?.value || {}, null, 2)}</code></pre></Box>
            </Box>)}
          </VStack>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  </ButtonGroup>
};

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