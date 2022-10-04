import { useSubscription } from '@apollo/client';
import { Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Box, Flex, SimpleGrid, Text, Button, Spacer, useColorMode, InputGroup, Input, InputRightElement } from '@chakra-ui/react';
import { useDeep, useDeepQuery, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { generateQuery, generateQueryData } from '@deep-foundation/deeplinks/imports/gql';
import { Link, useMinilinksApply, useMinilinksQuery, useMinilinksSubscription } from '@deep-foundation/deeplinks/imports/minilinks';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { CytoReactLinkAvatar } from '../cyto-react-avatar';
import { EditorHandler } from '../editor/editor-handler';
import { useChackraColor } from '../get-color';

const reasons = [
  {
    id: 1,
    name: 'type',
  },
  {
    id: 2,
    name: 'selector',
  },
  {
    id: 3,
    name: 'route',
  },
  {
    id: 4,
    name: 'schedule',
  },
];

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
  const onInsert = useCallback(async () => {
    setInserting(true);
    await deep.insert({
      type_id: handle.id,
      from_id: support.id,
      to_id: +value
    });
    setInserting(false);
  }, [value]);

  const handles = useMinilinksSubscription(deep.minilinks, {
    type_id: handle.id,
    to_id: handler.id,
  });

  return <div>
    <Box borderWidth='1px' borderRadius='lg'>
      <Flex p={3} position='relative'>
        <Text p={1}>
          {HandleName}
        </Text>
        <Spacer />
        <Button size='sm' variant='outline' onClick={() => setAdding(true)}>
          +
        </Button>
        {adding && <InputGroup
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
        </InputGroup>}
      </Flex>
      {!!handles?.length && <>
        <hr/>
        <Box p={3}>
          {handles.map((h) => {
            return <Box>{h.id}</Box>;
          })}
        </Box>
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
  const handlers = useMinilinksSubscription(deep.minilinks, {
    type_id: deep.idSync('@deep-foundation/core', 'Handler'),
    from_id: support.id,
    to_id: linkId,
  });

  return <AccordionItem>
    <AccordionButton>
      <Box flex='1' textAlign='left'>
        Support: {support.id} {support.inByType[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value}
      </Box>
      <AccordionIcon />
    </AccordionButton>
    <AccordionPanel p={3}>
      {handlers.map((h: any) => (
        <Box borderWidth='2px' borderRadius='lg' borderStyle='dashed' p={2}>
          Handler: {h.id} {h.inByType[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || ''}
          <SimpleGrid columns={2} spacing={3} width={'100%'}>
            {support?.outByType[deep.idSync('@deep-foundation/core', 'SupportsCompatable')]?.map(({ to: handle }) => (
              <CytoEditorHandlersSupportHandle support={support} handler={h} handle={handle}/>
            ))}
          </SimpleGrid>
        </Box>
      ))}
    </AccordionPanel>
  </AccordionItem>;
});

export const CytoEditorHandlers = React.memo<any>(function CytoEditorHandlers({
  linkId,
}: {
  linkId: number;
}) {
  const deep = useDeep();
  const { data } = useDeepQuery({
    down: {
      link: {
        type_id: { _in: [
          deep.idSync('@deep-foundation/core', 'Supports'),
          deep.idSync('@deep-foundation/core', 'SupportsCompatable'),
          deep.idSync('@deep-foundation/core', 'Handler'),
        ] },
      },
    },
  });
  useMinilinksApply(deep.minilinks, 'cyto-editor-handlers', data || []);

  const supports = useMinilinksSubscription(deep.minilinks, { type_id: deep.idSync('@deep-foundation/core', 'Supports') });

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
