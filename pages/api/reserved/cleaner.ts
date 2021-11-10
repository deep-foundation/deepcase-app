import Cors from 'cors';
import { generateApolloClient } from '@deep-foundation/hasura/client';
import { corsMiddleware } from '@deep-foundation/hasura/cors-middleware';
import { HasuraApi } from "@deep-foundation/hasura/api";

const SCHEMA = 'public';

export const api = new HasuraApi({
  path: process.env.MIGRATIONS_HASURA_PATH,
  ssl: !!+process.env.MIGRATIONS_HASURA_SSL,
  secret: process.env.MIGRATIONS_HASURA_SECRET,
});

const client = generateApolloClient({
  path: `${process.env.MIGRATIONS_HASURA_PATH}/v1/graphql`,
  ssl: !!+process.env.MIGRATIONS_HASURA_SSL,
  secret: process.env.MIGRATIONS_HASURA_SECRET,
});

const cors = Cors({ methods: ['GET', 'HEAD', 'POST'] });
export default async (req, res) => {
  await corsMiddleware(req, res, cors);
  try {
    const event = req?.body?.event;
    console.log(event);
    return res.json({ result: 'exaplained' });
  } catch(error) {
    return res.status(500).json({ error: error.toString() });
  }
};