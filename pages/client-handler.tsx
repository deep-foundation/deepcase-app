import { Box, Center } from '@chakra-ui/react';
import { DeepProvider, useDeep, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { useQueryStore } from '@deep-foundation/store/query';
import getConfig from 'next/config';
import { useEffect, useState } from 'react';
import { AutoGuest } from '@deep-foundation/deepcase/imports/auto-guest';
import { ClientHandler } from '@deep-foundation/deepcase/imports/client-handler';
import { DotsLoader } from '@deep-foundation/deepcase/imports/dot-loader';
import { useSpaceId } from '@deep-foundation/deepcase/imports/hooks';
import { DeepLoader } from '@deep-foundation/deepcase/imports/loader';
import { Provider } from '@deep-foundation/deepcase/imports/provider';
import { parseUrl } from '@deep-foundation/deepcase/imports/connector/connector';

const { publicRuntimeConfig } = getConfig();

export function Content({
  openPortal,
}: {
  openPortal?: () => any;
}) {
  const [spaceId, setSpaceId] = useSpaceId();
  const deep = useDeep();
  const globalAny:any = global;
  globalAny.deep = deep;
  globalAny.ml = deep.minilinks;

  const [props, setProps] = useQueryStore('props', { linkId: 0, handlerId: 0 });

  const { data, loading, error } = useDeepSubscription({
    up: {
      parent_id: { _eq: props.linkId }
    },
  });

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
  </>); 
};

export default function Page(props: {
  gqlPath: string;
  gqlSsl: boolean;
}) {
  const [gqlPath, setGqlPath] = useState(props.gqlPath);
  const [gqlSsl, setGqlSsl] = useState(props.gqlSsl);
  const [portal, setPortal] = useState(true);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const browserURI = window?.location?.origin;
      if (browserURI) {
        const [browserPath, browserSsl] = parseUrl(browserURI);
        setGqlPath(browserPath + "/api/gql");
        setGqlSsl(browserSsl);
      }
    }
  }, []);

  console.log("client-handler-page-urls", {
    gqlPath,
    gqlSsl
  });

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