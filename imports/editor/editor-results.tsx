import React from 'react';
import { VscAdd } from 'react-icons/vsc';
import { Flex, Box, Button, Divider, ButtonGroup, Spacer } from '@chakra-ui/react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';

export const EditorResultsResolvesRejects = React.memo<any>(({
  promiseId
}: {
  promiseId: number;
}) => {
  const deep = useDeep();
  const resolves = deep.useMinilinksSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Resolved'),
    from_id: promiseId,
  });
  const rejects = deep.useMinilinksSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Rejected'),
    from_id: promiseId,
  });
  return <Box>
    {resolves.map(resolved => <Box>
      {resolved.id} Resolved
      <pre><code>{resolved?.to?.value?.value}</code></pre>
    </Box>)}
    {rejects.map(rejected => <Box>
      {rejected.id} Resolved
      <pre><code>{rejected?.to?.value?.value}</code></pre>
    </Box>)}
  </Box>;
});

export const EditorResults = React.memo<any>(({
  id,
}:{
  id: number;
}) => {
  const deep = useDeep();
  deep.useDeepSubscription({
    up: {
      parent: {
        type_id: deep.idLocal('@deep-foundation/core', 'Then'),
        from_id: id,
      },
    }
  });
  const promises = deep.useMinilinksSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Promise'),
    in: {
      type_id: deep.idLocal('@deep-foundation/core', 'Then'),
      from_id: id,
    },
  });
  const sortedPromises = promises.sort((a,b) => b.id - a.id);
  return (<Flex direction='column' position="relative">
      <Box position="absolute" width="100%" height="100%" overflowY="scroll">
      <Box>
        {sortedPromises.map(promise => <Box>
          {promise.id} Promise
          <Box paddingLeft={4}>
            <EditorResultsResolvesRejects promiseId={promise.id} />
          </Box>
        </Box>)}
      </Box>
    </Box>
  </Flex>);
})