import { useSubscription } from '@apollo/client';
import { Accordion, AccordionItem, AccordionButton, AccordionIcon, AccordionPanel, Box, Flex } from '@chakra-ui/react';
import { useDeep, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { generateQuery, generateQueryData } from '@deep-foundation/deeplinks/imports/gql';
import { useMinilinksApply } from '@deep-foundation/deeplinks/imports/minilinks';
import React, { useEffect, useMemo } from 'react';
import { CytoReactLinkAvatar } from '../cyto-react-avatar';
import { EditorHandler } from '../editor/editor-handler';

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

export const CytoEditorHandlers = React.memo<any>(function CytoEditorHandlers({
  linkId,
  ml,
}: {
  linkId: number;
  ml?: any;
}) {
  const deep = useDeep();
  const { data } = useDeepSubscription({
    to_id: linkId,
    type_id: deep.idSync('@deep-foundation/core', 'Handler'),
  });
  const handlers = useMinilinksApply(ml, 'cyto-editor-handlers', data || []);
  return <>
    <Box position="relative">
      <Box h='100%' w='100%' overflowY="scroll" position="absolute">
        <Accordion>
          {handlers?.map((handler) => {
            return <AccordionItem>
              <h2>
                <AccordionButton>
                  <Box flex='1' textAlign='left'>
                    handlerId: {handler.id} supportId: {handler.from_id}
                  </Box>
                  <AccordionIcon />
                </AccordionButton>
              </h2>
              <AccordionPanel p={1}>
                <EditorHandler
                  reasons={reasons} 
                  avatarElement={<CytoReactLinkAvatar emoji='💥' />}
                  title='first'
                  sync={false}
                  onChangeSync={() => {}}
                ></EditorHandler>
              </AccordionPanel>
            </AccordionItem>;
          })}
        </Accordion>
      </Box>
    </Box>
  </>;
});
