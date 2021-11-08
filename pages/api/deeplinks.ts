import { call } from '@deep-foundation/deeplinks/imports/engine';

export default async (req, res) => {
  res.send(await call({ ...req.body }));
};
