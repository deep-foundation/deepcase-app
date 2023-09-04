import { call } from '@deep-foundation/deeplinks/imports/engine';
import Debug from 'debug';
import getConfig from 'next/config'

const debug = Debug('deepcase:pages:api:deeplinks');
const log = debug.extend('log');
const error = debug.extend('error');
// Force enable this file errors output
const namespaces = Debug.disable();
Debug.enable(`${namespaces ? `${namespaces},` : ``}${error.namespace}`);

const { publicRuntimeConfig } = getConfig();

export default async (req, res) => {
  const NEXT_PUBLIC_ENGINES_ROUTE = publicRuntimeConfig?.NEXT_PUBLIC_ENGINES_ROUTE || '1';
  if (!+NEXT_PUBLIC_ENGINES_ROUTE) return res.send('engines deactivated');
  const PATH = [];
  if (req?.body?.envs?.PATH) PATH.push(req?.body?.envs?.PATH);
  if (process?.env?.PATH) PATH.push(process?.env?.PATH);
  log('engine route', { body: req?.body, PATH });
  res.send(await call({ ...req?.body, envs: { ...req?.body?.envs, PATH: PATH.join(':')}}));
};
