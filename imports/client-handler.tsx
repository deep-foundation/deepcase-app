import * as chakra from '@chakra-ui/react';
import { DeepClient, useDeep } from "@deep-foundation/deeplinks/imports/client";
import { evalClientHandler as deepclientEvalClientHandler } from '@deep-foundation/deeplinks/imports/client-handler';
import { useMinilinksFilter } from "@deep-foundation/deeplinks/imports/minilinks";
import * as axios from 'axios';
import * as classnames from 'classnames';
import React, { useCallback, useEffect, useRef } from 'react';
// import * as reacticons from 'react-icons/all';
import reactHotkeysHook from 'react-hotkeys-hook';
import * as debounce from '@react-hook/debounce';
import * as json5 from 'json5';

const r = (path) => {
  if (r.list[path]) return r.list[path];
  throw new Error(`Module not found: Can't resolve ${path}`);
};
r.list = {
  '@chakra-ui/react': chakra,
  'react': React,
  'axios': axios,
  'classnames': classnames,
  // 'react-icons/all': reacticons,
  'react-hotkeys-hook': reactHotkeysHook,
  '@react-hook/debounce': debounce,
  'json5': json5,
};

export async function evalClientHandler({
  value,
  deep,
  input = {},
}: {
  value: string;
  deep: DeepClient;
  input?: any;
}): Promise<{
  error?: any;
  data?: any;
}> {
  return await deepclientEvalClientHandler({
    value, deep, input: {
      require: r,
      ...input,
    },
  });
}

export interface ClientHandlerRendererProps {
  Component: any;
  fillSize?: boolean;
  [key: string]: any;
};

export function ClientHandlerRenderer({
  Component,
  fillSize = false,
  ...props
}: ClientHandlerRendererProps) {
  return <>{typeof(Component) === 'function' && <Component fillSize={fillSize} {...props} style={{
    ...(fillSize ? { width: '100%', height: '100%' } : {}),
    ...props?.style,
  }}/>}</>;
}

export interface ClientHandlerProps extends Partial<ClientHandlerRendererProps> {
  handlerId: number;
  linkId: number;
  ml: any;
}

export function ClientHandler({
  handlerId,
  linkId,
  ml,
  ...props
}: ClientHandlerProps) {
  const deep = useDeep();
  let file = useMinilinksFilter(
    ml,
    useCallback((l) => true, []),
    useCallback((l, ml) => {
      console.log('ClientHandler useMinilinksFilter', { linkId, handlerId });
      return ml.byType[deep.idSync('@deep-foundation/core', 'SyncTextFile')]
      ?.filter(l => (
        !!l?.inByType?.[deep.idSync('@deep-foundation/core', 'Handler')]?.filter(l => (
          l.id === handlerId
        ))?.length
      ))?.[0];
    }, [linkId, handlerId]),
  );

  const [Component, setComponent] = React.useState<any>(null);

  console.log('ClientHandler', { file });
  const lastEvalRef = useRef(0);
  useEffect(() => {
    const value = file?.value?.value;
    console.log('ClientHandler evalClientHandler', { file, value });
    if (value) {
      const evalId = ++lastEvalRef.current;
      evalClientHandler({ value, deep }).then(({ data, error }) => {
        if (evalId === lastEvalRef.current) {
          console.log('ClientHandler evalClientHandler setComponent', { file, data, error });
          if (!error) setComponent(() => data);
          else setComponent(undefined);
        } else {
          console.log('ClientHandler evalClientHandler outdated', { file, data, error, evalId, 'lastEvalRef.current': lastEvalRef.current });
        }
      });
    }
  }, [file?.value?.value]);

  return (<>
    {(typeof(Component) === 'function')
    ? <>{[<ClientHandlerRenderer key={Component.toString()} Component={Component} {...props} fillSize={false} link={ml.byId[linkId]} ml={ml}/>]}</>
    : <div>123</div>}
  </>);
}
