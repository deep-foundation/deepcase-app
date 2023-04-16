import { Box } from '@chakra-ui/react';
import { DeepProvider, useDeep, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { useState } from 'react';
import { AutoGuest } from '../imports/auto-guest';
import { ClientHandler } from '../imports/client-handler';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { useHandlerId, useLinkId, useSpaceId } from '../imports/hooks';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { useRouter } from 'next/router';
import { useQueryStore } from '@deep-foundation/store/query';


export function Content({
  openPortal,
}: {
  openPortal?: () => any;
}) {
  const [spaceId, setSpaceId] = useSpaceId();
  const deep = useDeep();
  global.deep = deep;

  global.ml = deep.minilinks;

  const [handlerId, setHandlerId] = useHandlerId();
  const [linkId, setLinkId] = useLinkId();

  const [props, setProps] = useQueryStore('props', { linkId: 0, handlerId: 0 });

  const { data: files } = useDeepSubscription({
    up: {
      parent: {
        id: linkId
      }
    },
  });

  return (<>
    {[<DeepLoader
      key={spaceId}
      spaceId={spaceId}
      />]}
      <Box w='100vw' h='100vh'>
        <ClientHandler fillSize={true} ml={deep.minilinks} {...props}/>
      </Box>
    <ColorModeSwitcher/>
  </>); 
};

export default function Page() {
  const [gqlPath, setGqlPath] = useState('');
  const [gqlSsl, setGqlSsl] = useState('');
  const [portal, setPortal] = useState(true);

  return (<>
    <Provider gqlPath={gqlPath} gqlSsl={gqlSsl}>
      <DeepProvider>
        <AutoGuest>
          <Content openPortal={()=>setPortal(true)} />
        </AutoGuest>
      </DeepProvider>
    </Provider>
  </>);
}