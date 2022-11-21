import { useSubscription } from '@apollo/client';
import { ChevronDownIcon } from '@chakra-ui/icons';
import { Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Box, Flex, SimpleGrid, Text, Button, Spacer, useColorMode, InputGroup, Input, InputRightElement, Tag, TagCloseButton, TagLabel, HStack, VStack, Select, Menu, MenuButton, MenuItem, MenuList } from '@chakra-ui/react';
import { useDeep, useDeepQuery, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { generateQuery, generateQueryData } from '@deep-foundation/deeplinks/imports/gql';
import { Link, useMinilinksApply, useMinilinksQuery, useMinilinksSubscription } from '@deep-foundation/deeplinks/imports/minilinks';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CytoReactLinkAvatar } from '../cyto-react-avatar';
import { EditorHandler } from '../editor/editor-handler';
import { useChackraColor } from '../get-color';
import { useContainer } from '../hooks';

export const CytoEditorHandlersSupportHandle = React.memo<any>(function CytoEditorHandlersSupport({
  support,
  handler,
  handle,
}: {
  support: Link<number>;
  handler: Link<number>;
  handle: Link<number>;
}) {
  const deep = useDeep();
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const { colorMode } = useColorMode();
  const [value, setValue] = useState('');

  const [adding, setAdding] = useState(false);

  const mouseoutRef = useRef<any>();

  const onLeave = (e) => {
    clearTimeout(mouseoutRef.current);
    if (document.activeElement !== e.target) mouseoutRef.current = setTimeout(() => {
      setAdding(false);
      setInserting(false);
    }, 1000);
  };

  const HandleName = handle?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value;

  const [inserting, setInserting] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [container] = useContainer();

  const onInsert = useCallback(async () => {
    setInserting(true);
    await deep.insert({
      type_id: handle.id,
      from_id: +value,
      to_id: handler.id,
      in: { data: {
        type_id: deep.idSync('@deep-foundation/core', 'Contain'),
        from_id: container,
      } }
    });
    setInserting(false);
  }, [value, container]);

  const onDelete = useCallback(async (handleId) => {
    const link = deep.minilinks.byId[handleId];
    if (confirm(`Delete ${handleId} (${link.type_id}) = ${link.from_id} > ${link.to_id}?`)) {
      await deep.delete(handleId);
    }
  }, []);

  const { data: handles } = useDeepSubscription({
    type_id: handle?.id,
    to_id: handler?.id,
  });

  const { data: ports } = useDeepSubscription({
    type_id: deep.idSync('@deep-foundation/core', 'Port'),
  });

  const isLink = ['HandleInsert', 'HandleUpdate', 'HandleDelete'].includes(HandleName);
  const isRoute = HandleName === 'HandleRoute';
  const isPort = HandleName === 'HandlePort';
  const isShedule = HandleName === 'HandleShedule';
  const isClient = HandleName === 'HandleClient';

  const Handle = useCallback((
    isLink
    ? (h) => {
      return <Tag size='lg' borderRadius='full' variant='solid'>
        <TagLabel>{h.from_id}</TagLabel>
        <TagCloseButton onClick={() => onDelete(h.id)}/>
      </Tag>;
    }
    : (h) => {
      return <Tag size='lg' borderRadius='full' variant='solid'>
        <TagLabel>{h.from_id}</TagLabel>
        <TagCloseButton onClick={() => onDelete(h.id)}/>
      </Tag>;
    }
  ), [deleting]);

  const Form = useCallback((
    isLink || isClient
    ? ({ value, onInsert }: { value: string, onInsert: () => void }) => {
      return <InputGroup
        position='absolute' w='100%' h='100%' left={0} top={0} borderWidth='1px' borderRadius='lg' bgColor={colorMode == 'light' ? white : gray900}
        onMouseMove={() => {
          clearTimeout(mouseoutRef.current);
        }}
      >
        <Input
          autoFocus
          h='100%'
          type={'number'}
          placeholder='id'
          onMouseLeave={onLeave}
          onMouseOver={() => {
            clearTimeout(mouseoutRef.current);
            !adding && setAdding(true);
          }}
          onBlur={onLeave}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <InputRightElement h='100%'>
          <Button
            marginRight={5} size='md' variant='ghost' onClick={onInsert}
            isLoading={inserting}
          >
            +
          </Button>
        </InputRightElement>
      </InputGroup>;
    }
    : isPort
    ? ({ value, onInsert }: { value: string, onInsert: () => void }) => {
      return <InputGroup
        position='absolute' w='100%' h='100%' left={0} top={0} borderWidth='1px' borderRadius='lg' bgColor={colorMode == 'light' ? white : gray900}
        onMouseMove={() => {
          clearTimeout(mouseoutRef.current);
        }}
      >
        <Menu>
          <MenuButton
            as={Button}
            rightIcon={<ChevronDownIcon />}
            h={'100%'}
            w={`calc(100% - 60px)`}
          >
            Port
          </MenuButton>
          <MenuList>
            <MenuItem>+</MenuItem>
            {ports.map(port => (<MenuItem key={port.id}>{port.id}</MenuItem>))}
          </MenuList>
        </Menu>
        <InputRightElement h='100%'>
          <Button
            marginRight={5} size='md' variant='ghost' onClick={onInsert}
            isLoading={inserting}
          >
            +
          </Button>
        </InputRightElement>
      </InputGroup>;
    }
    : ({ value, onInsert }: { value: string, onInsert: () => void }) => {
      return <InputGroup
        position='absolute' w='100%' h='100%' left={0} top={0} borderWidth='1px' borderRadius='lg' bgColor={colorMode == 'light' ? white : gray900}
        onMouseMove={() => {
          clearTimeout(mouseoutRef.current);
        }}
      >
        <Input
          disabled
          autoFocus
          h='100%'
          type={'number'}
          placeholder='id'
          onMouseLeave={onLeave}
          onMouseOver={() => {
            clearTimeout(mouseoutRef.current);
            !adding && setAdding(true);
          }}
          onBlur={onLeave}
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <InputRightElement h='100%'>
          <Button
            marginRight={5} size='md' variant='ghost' onClick={onInsert}
            isLoading={inserting}
          >
            +
          </Button>
        </InputRightElement>
      </InputGroup>;
    }
  ), []);

  return <div>
    <Box borderWidth='1px' borderRadius='lg'>
      <Flex p={3} position='relative'>
        <Text p={1}>
          {HandleName}
        </Text>
        <Spacer />
        <Button size='sm' variant='outline' onClick={() => setAdding(true)} disabled={!(isLink || isPort || isClient)}>
          +
        </Button>
        {adding && <Form value={value} onInsert={onInsert}/>}
      </Flex>
      {!!handles?.length && <>
        <hr/>
        <HStack spacing={3} p={3}>
          {handles.map(Handle)}
        </HStack>
      </>}
    </Box>
  </div>;
});

export const CytoEditorHandlersSupport = React.memo<any>(function CytoEditorHandlersSupport({
  support,
  linkId,
}: {
  support: Link<number>;
  linkId: number;
}) {
  const deep = useDeep();
  const { data: handlers } = useDeepSubscription({
    type_id: deep.idSync('@deep-foundation/core', 'Handler'),
    from_id: support.id,
    to_id: linkId,
  });

  const [container] = useContainer();

  const onInsertHandler = useCallback(async () => {
    await deep.insert({
      to_id: linkId,
      from_id: support.id,
      type_id: deep.idSync('@deep-foundation/core', 'Handler'),
      in: { data: {
        type_id: deep.idSync('@deep-foundation/core', 'Contain'),
        from_id: container,
      } }
    });
  }, [container]);

  const onDeleteHandler = useCallback(async (handlerId) => {
    await deep.delete(handlerId);
  }, []);

  return <AccordionItem>
    <AccordionButton>
      <Flex w={'100%'}>
        <Box flex='1' textAlign='left'>
          Support: {support.id} {support.inByType[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value}
        </Box>
        <Spacer/>
        <Button size='sm' variant='outline' onClick={() => onInsertHandler()}>+</Button>
      </Flex>
      <AccordionIcon />
    </AccordionButton>
    <AccordionPanel><SimpleGrid spacing={3}>
      {handlers?.map((h: any) => (
        <Box borderWidth='2px' borderRadius='lg' borderStyle='dashed' p={2}>
          Handler: <Tag size='md' borderRadius='full' variant='solid'>
        <TagLabel>{h.id}</TagLabel>
        <TagCloseButton onClick={() => onDeleteHandler(h.id)}/>
      </Tag> {h.inByType[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || ''}
          <SimpleGrid marginTop={3} columns={2} spacing={3} width={'100%'}>
            {support?.outByType[deep.idSync('@deep-foundation/core', 'SupportsCompatable')]?.map(({ to: handle }) => (
              <CytoEditorHandlersSupportHandle support={support} handler={h} handle={handle}/>
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </SimpleGrid></AccordionPanel>
  </AccordionItem>;
});

export const CytoEditorHandlers = React.memo<any>(function CytoEditorHandlers({
  linkId,
}: {
  linkId: number;
}) {
  const deep = useDeep();

  useDeepSubscription({
    down: {
      link: { 
        type_id: { _in: [
          deep.idSync('@deep-foundation/core', 'Supports'),
          deep.idSync('@deep-foundation/core', 'SupportsCompatable'),
          deep.idSync('@deep-foundation/core', 'HandleOperation'),
        ] },
      },
    },
  });

  useDeepSubscription({
    up: {
      parent: { 
        type_id: { _in: [
          deep.idSync('@deep-foundation/core', 'Supports'),
          deep.idSync('@deep-foundation/core', 'SupportsCompatable'),
          deep.idSync('@deep-foundation/core', 'HandleOperation'),
        ] },
      },
    },
  });

  useDeepSubscription({
    in: { type_id: deep.idSync('@deep-foundation/core', 'SupportsCompatable') },
  });

  const supports = deep.useMinilinksSubscription({
    type_id: deep.idSync('@deep-foundation/core', 'Supports'),
  });

  return <>
    <Box position="relative">
      <Box h='100%' w='100%' overflowY="scroll" position="absolute">
        <Accordion>
          {supports?.map((support) => {
            return <CytoEditorHandlersSupport support={support} linkId={linkId}/>;
          })}
        </Accordion>
      </Box>
    </Box>
  </>;
});
