import { Box, Center } from '@chakra-ui/react';
import { DeepProvider, useDeep, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { useState } from 'react';
import { AutoGuest } from '../imports/auto-guest';
import { ClientHandler } from '../imports/client-handler';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { useSpaceId } from '../imports/hooks';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { useQueryStore } from '@deep-foundation/store/query';
import getConfig from 'next/config'
import { DotsLoader } from '../imports/dot-loader';

const { publicRuntimeConfig } = getConfig();

export function Content({
  openPortal,
}: {
  openPortal?: () => any;
}) {
  const [spaceId, setSpaceId] = useSpaceId();
  const deep = useDeep();
  global.deep = deep;

  global.ml = deep.minilinks;

  const [props, setProps] = useQueryStore('props', { linkId: 0, handlerId: 0 });

  const { data, loading, error } = useDeepSubscription({
    up: {
      parent_id: { _eq: props.linkId }
    },
  });

  console.log('props.linkId', props.linkId, 'data.length', data.length, 'loading', loading, 'error', error)

  return (<>
    {[<DeepLoader
      key={spaceId}
      spaceId={spaceId}
      />]}
      <Box w='100vw' h='100vh'>
        { props.linkId > 0 && data.length > 0 ?
          [<ClientHandler key={props.linkId} fillSize={true} ml={deep.minilinks} {...props}/>] :

          props.linkId > 0  && !loading && data.length <= 0 ? 
          [<Center height='100%'>
            <Box 
              display='flex'
              alignItems='center'
              justifyContent='center'
              h='100%'>
                Link {props.linkId} is not found.
            </Box>
          </Center>] :

          [<Center height='100%'><DotsLoader /></Center>]
        } 
      </Box>
    <ColorModeSwitcher/>
  </>); 
};

export default function Page(props: {
  gqlPath: string;
  gqlSsl: boolean;
}) {
  const [gqlPath, setGqlPath] = useState(props.gqlPath);
  const [gqlSsl, setGqlSsl] = useState(props.gqlSsl);
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

export async function getStaticProps() {
  return {
    props: {
      gqlPath: publicRuntimeConfig?.NEXT_PUBLIC_GQL_PATH || 'localhost:3006/gql',
      gqlSsl: !!+publicRuntimeConfig?.NEXT_PUBLIC_GQL_SSL || false,
    },
  };
}