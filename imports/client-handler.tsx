import { DeepClient, useDeep } from "@deep-foundation/deeplinks/imports/client";
import { evalClientHandler as deepclientEvalClientHandler } from '@deep-foundation/deeplinks/imports/client-handler';
import * as chakra from '@chakra-ui/react';
import * as React from 'react';
import * as axios from 'axios';
import * as classnames from 'classnames';
import * as reacticons from 'react-icons/all';

const r = (path) => {
  if (r.list[path]) return r.list[path];
  throw new Error(`Module not found: Can't resolve 'abc'`);
};
r.list = {
  '@chakra-ui/react': chakra,
  'react': React,
  'axios': axios,
  'classnames': classnames,
  'react-icons/all': reacticons,
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

export function ClientHandlerRenderer({
  Component,
}: {
  Component: any
}) {
  return <>{!!Component && <Component />}</>;
}

export function ClientHandler({
}: {
}) {
  const [Component, setComponent] = React.useState<any>(null);
  const deep = useDeep();
  React.useEffect(() => {
    evalClientHandler();
  }, []);
  return <ClientHandlerRenderer Component={Component} />;
}
