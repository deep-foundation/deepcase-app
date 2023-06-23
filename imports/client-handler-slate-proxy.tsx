import { useDeep, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { useState } from 'react';
import { ClientHandler } from './client-handler';
import { CatchErrors } from './react-errors';


export const ClientHandlerSlateProxy = ({ children }) => {
  const [handlerId, setHandlerId] = useState();
  const deep = useDeep();

  // const types = [];
  // const handlers = deep.useMinilinksQuery({
  //   type_id: deep.idLocal('@deep-foundation/core', 'Handler'),
  //   in: {
  //     type_id: deep.idLocal('@deep-foundation/core', 'HandleClient'),
  //     _or: types.map(type => ({ from_id: { _eq: type } })),
  //   },
  // });

  // useEffect(() => {
  //   if (!handlerId) {
  //     const handler: any = handlers?.[0];
  //     if (handler) {
  //       setHandlerId(handler.id);
  //     }
  //   }
  // }, [handlers]);

  // const handler = handlers.find(h => h.id === handlerId);
  // const elements = handlers?.map(t => ({
  //   id: t?.id,
  //   src:  t?.inByType[deep.idLocal('@deep-foundation/core', 'Symbol')]?.[0]?.value?.value || t.id,
  //   linkName: t?.inByType[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || t.id,
  //   containerName: t?.inByType[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.from?.value?.value || '',
  // })) || [];
  const ml = deep.minilinks;

  function extractFirstGroup(text) {
    const regex = /##(\d+)/g;
    const match = regex.exec(text);
    const firstGroup = match ? match[1] : null;
  
    return firstGroup ? parseInt(firstGroup, 10) : null;
  }

  const text = children?.[0]?.props?.parent?.children?.[0]?.text || '';
  const linkId = extractFirstGroup(text);
  const { data, loading, error } = useDeepSubscription({
    up: {
      parent_id: { _eq: linkId }
    },
  });

  console.log('DEEPW', text, linkId, children);
  // if(linkId) {
    return (<>
      <ClientHandler handlerId={739} linkId={linkId} ml={ml} />
      {children}
    </>)
  // } else { 
  //   return children
  // }
}