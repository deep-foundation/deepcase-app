import { GLOBAL_ID_USER } from '@deep-foundation/deeplinks/imports/global-ids';
import { jwt } from '@deep-foundation/deeplinks/imports/jwt';
import { generateApolloClient } from '@deep-foundation/hasura/client';
import { generateRemoteSchema } from '@deep-foundation/hasura/remote-schema';
import gql from 'graphql-tag';
import { insertLink } from '../../imports/gql';

const JWT_SECRET = process.env.JWT_SECRET;
const jwt_secret = JSON.parse(JWT_SECRET);

const typeDefs = gql`
  type Query {
    guest: GuestOutput
  }
  type GuestOutput {
    token: String
    linkId: Int
  }
`;

const client = generateApolloClient({
  path: `${process.env.MIGRATIONS_HASURA_PATH}/v1/graphql`,
  ssl: !!+process.env.MIGRATIONS_HASURA_SSL,
  secret: process.env.MIGRATIONS_HASURA_SECRET,
});

const resolvers = {
  Query: {
    guest: async (source, args, context, info) => {
      const result = await client.mutate(insertLink({ type_id: GLOBAL_ID_USER }));
      const linkId = result?.data?.m0?.returning?.[0]?.id;
      const token = jwt({
        secret: jwt_secret.key,
        linkId,
      });
      return { token, linkId };
    },
  }
};

const context = ({ req }) => {
  return { headers: req.headers };
};
module.exports = generateRemoteSchema({ typeDefs, resolvers, context, path: '/api/guest' });
