import { call } from '@deep-foundation/deeplinks/imports/engine';

export default async (req, res) => {
  const PATH = [];
  if (req?.body?.envs?.PATH) PATH.push(req?.body?.envs?.PATH);
  if (process?.env?.PATH) PATH.push(process?.env?.PATH);
  res.send(await call({ ...req?.body, envs: { ...req?.body?.envs, PATH: PATH.join(':')}}));
};
