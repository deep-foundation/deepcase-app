import { jwt } from '@deep-foundation/deeplinks/imports/jwt';
import { generateRemoteSchema } from '@deep-foundation/hasura/remote-schema';
import gql from 'graphql-tag';

const JWT_SECRET = process.env.JWT_SECRET;
const jwt_secret = JSON.parse(JWT_SECRET);

const typeDefs = gql`
  type Query {
    jwt(input: JWTInput): JWTOutput
  }
  input JWTInput {
    linkId: Int
  }
  type JWTOutput {
    token: String
    linkId: Int
  }
`;

const resolvers = {
  Query: {
    jwt: async (source, args, context, info) => {
      const { linkId } = args.input;
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
module.exports = generateRemoteSchema({ typeDefs, resolvers, context, path: '/api/jwt' });
