import { CloseIcon } from "@chakra-ui/icons";
import { HStack, ButtonGroup, Button, IconButton, FormControl, FormLabel, Switch, Box, VStack, Popover, PopoverArrow, PopoverBody, PopoverCloseButton, PopoverContent, PopoverHeader, PopoverTrigger, Input, Tag, TagLabel, Text } from "@chakra-ui/react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import copy from "copy-to-clipboard";
import { useState, useEffect, useMemo } from "react";
import { useHotkeys } from "react-hotkeys-hook";
import { useSpaceId, useShowTypes, useLayout, useContainer, useShowExtra, useShowFocus, usePromiseLoader, useTraveler, useMediaQuery, useAutoFocusOnInsert, useBreadcrumbs } from "../hooks";
import { useCytoEditor } from "./hooks";

const NEXT_PUBLIC_GQL_PATH = process.env.NEXT_PUBLIC_GQL_PATH || 'localhost:3006/gql';
const NEXT_PUBLIC_GQL_SSL = process.env.NEXT_PUBLIC_GQL_SSL || '0';

export function CytoMenu({
  cyRef,
}: {
  cyRef?: any;
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
  const [breadcrumbs, setBreadcrumbs] = useBreadcrumbs();
  const deep = useDeep();
  const [max300] = useMediaQuery('(max-width: 300px)');

  useEffect(() => {
    const timer = setTimeout(() => {
      setPasteError(false);
      setValid(undefined);
    }, 3000);
    return () => clearTimeout(timer);
  }, [pasteError, valid]);

  return <Box pos='absolute' left={0} top={0}>
    <VStack spacing='1rem' m='1rem' align={'flex-start'}>
      <HStack>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button disabled>auth</Button>
          <Button>{deep.linkId}</Button>
          <IconButton aria-label='Reauth as guest' icon={<CloseIcon />} onClick={async () => {
            const guest = await deep.guest();
            setSpaceId(guest.linkId);
            setContainer(guest.linkId);
          }}/>
        </ButtonGroup>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button disabled>space</Button>
          <Button>{spaceId}</Button>
          <IconButton aria-label='Quit to user space' icon={<CloseIcon />} onClick={() => {
            setSpaceId(deep.linkId);
            setContainer(deep.linkId);
          }}/>
        </ButtonGroup>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button disabled>container</Button>
          <Button>{container}</Button>
          <IconButton aria-label='Quit to user space' icon={<CloseIcon />} onClick={() => {
            setContainer(deep.linkId);
          }}/>
        </ButtonGroup>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button onClick={() => {
            copy(deep.token);
          }}>copy token</Button>
          <Button colorScheme={pasteError ? 'red' : valid ? 'blue' : undefined} onClick={async () => {
          if (valid) await deep.login({ token: valid });
          else {
            setPasteError(false);
            const token: string = await navigator?.clipboard?.readText();
            const { linkId, error } = await deep.jwt({ token });
            if (error && !linkId) setPasteError(true);
            else if (linkId) setValid(token);
          }
          }}>{valid ? 'login token' : 'paste token'}</Button>
        </ButtonGroup>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button as='a' href={`http${+NEXT_PUBLIC_GQL_SSL ? 's' : ''}://${NEXT_PUBLIC_GQL_PATH}`} target="_blank">gql</Button>
        </ButtonGroup>
        <ButtonGroup size='sm' isAttached variant='outline'>
          <Button onClick={() => setCytoEditor(true)}>editor</Button>
        </ButtonGroup>
      </HStack>
      <HStack>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='autofocus-on-insert' mb='0'>
            autofocus
          </FormLabel>
          <Switch id='autofocus-on-insert' isChecked={autoFocus} onChange={() => setAutoFocus(!autoFocus)}/>
        </FormControl>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='show-focus' mb='0'>
            focus
          </FormLabel>
          <Switch id='show-focus' isChecked={focus} onChange={() => setFocus(!focus)}/>
        </FormControl>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='show-extra-switch' mb='0'>
            debug
          </FormLabel>
          <Switch id='show-extra-switch' isChecked={extra} onChange={() => setExtra(!extra)}/>
        </FormControl>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='show-types-switch' mb='0'>
            types
          </FormLabel>
          <Switch id='show-types-switch' isChecked={showTypes} onChange={() => setShowTypes(!showTypes)}/>
        </FormControl>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='show-promise-loader-switch' mb='0'>
            promises
          </FormLabel>
          <Switch id='show-promise-loader-switch' isChecked={promiseLoader} onChange={() => setPromiseLoader(!promiseLoader)}/>
        </FormControl>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='show-traveler-switch' mb='0'>
            traveler
          </FormLabel>
          <Switch id='show-traveler-switch' isChecked={traveler} onChange={() => setTraveler(!traveler)}/>
        </FormControl>
        <FormControl display='flex' alignItems='center'>
          <FormLabel htmlFor='breadcrumbs-switch' mb='0'>
            breadcrumbs
          </FormLabel>
          <Switch id='breadcrumbs-switch' isChecked={breadcrumbs} onChange={() => setBreadcrumbs(!breadcrumbs)}/>
        </FormControl>
      </HStack>
      <HStack>
        <MenuSearch cyRef={cyRef}/>
      </HStack>
    </VStack>
  </Box>;
}

export const MenuSearch = ({ cyRef }: { cyRef?: any; }) => {
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

  useHotkeys('enter', e => {
    e.preventDefault();
    e.stopPropagation();
  }, { enableOnTags: ["TEXTAREA", "INPUT"] });
  return <>
    <Popover placement='bottom-start' autoFocus={false}>
      <PopoverTrigger>
        <Input value={value} onChange={(e) => setValue(e.target.value)}/>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader fontWeight='semibold'>Search local</PopoverHeader>
        <PopoverArrow />
        <PopoverCloseButton />
        <PopoverBody>
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