import { CloseIcon } from "@chakra-ui/icons";
import { HStack, ButtonGroup, Button, IconButton, FormControl, FormLabel, Switch, Box, VStack } from "@chakra-ui/react";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import copy from "copy-to-clipboard";
import { useState, useEffect } from "react";
import { useSpaceId, useShowTypes, useLayout, useContainer, useShowExtra, useShowFocus, usePromiseLoader, useTraveler } from "../hooks";
import { useCytoEditor } from "./hooks";

const NEXT_PUBLIC_GQL_PATH = process.env.NEXT_PUBLIC_GQL_PATH || 'localhost:3006/gql';
const NEXT_PUBLIC_GQL_SSL = process.env.NEXT_PUBLIC_GQL_SSL || '0';

export function CytoMenu() {
  const [spaceId, setSpaceId] = useSpaceId();
  const [showTypes, setShowTypes] = useShowTypes();
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const { layout, setLayout, layoutName } = useLayout();
  const [promiseLoader, setPromiseLoader] = usePromiseLoader();

  const [pastError, setPastError] = useState(false);
  const [valid, setValid] = useState<any>(undefined);
  const [container, setContainer] = useContainer();
  const [extra, setExtra] = useShowExtra();
  const [focus, setFocus] = useShowFocus();
  const [traveler, setTraveler] = useTraveler();
  const deep = useDeep();

  useEffect(() => {
    const timer = setTimeout(() => {
      setPastError(false);
      setValid(undefined);
    }, 3000);
    return () => clearTimeout(timer);
  }, [pastError, valid]);

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
          <Button colorScheme={pastError ? 'red' : valid ? 'blue' : undefined} onClick={async () => {
          if (valid) await deep.login({ token: valid });
          else {
            setPastError(false);
            const token: string = await navigator?.clipboard?.readText();
            const { linkId, error } = await deep.jwt({ token });
            if (error && !linkId) setPastError(true);
            else if (linkId) setValid(token);
          }
          }}>{valid ? 'login token' : 'past token'}</Button>
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
      </HStack>
    </VStack>
  </Box>;
}