import Cors from 'cors';
import { generateApolloClient } from '@deep-foundation/hasura/client';
import { corsMiddleware } from '@deep-foundation/hasura/cors-middleware';
import { HasuraApi } from '@deep-foundation/hasura/api';
import { generateQuery, generateQueryData } from '@deep-foundation/deeplinks/imports/gql'
import { deleteReserved, deleteLinksIfReserved } from '../../../imports/gql';

const RESERVED_LIFETIME_MS = +process.env.RESERVED_LIFETIME || 24 * 60 * 60 * 1000;

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
    const body = req?.body;
    const result = await client.query(generateQuery({
      queries: [
        generateQueryData({ tableName: 'reserved', returning: `id reserved_ids`, variables: { where: {
          created_at: {
            _lt: new Date(Date.now() - RESERVED_LIFETIME_MS)
          }
        } } }),
      ],
      name: 'CRON_RESERVED',
    }));
    const reserved = result.data['q0'];
    let cleaned = [];
    if (!reserved.length) return res.json({ cleaned });
    
    const reservedIds = reserved.map(reserved => reserved.id);
    let linksIds = [];
    for (let i = 0; i < reserved.length; i++) linksIds = linksIds.concat(reserved[i]?.reserved_ids);

    if (linksIds.length) {
      const deleteLinksResult = await client.mutate(deleteLinksIfReserved(linksIds));  
      cleaned = deleteLinksResult.data['m0']?.returning?.map(link => link.id);  
    }
    await client.mutate(deleteReserved(reservedIds));

    return res.json({ cleaned });
  } catch(error) {
    return res.status(500).json({ error: error.toString() });
  }
};