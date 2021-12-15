import { useQuery, useApolloClient } from '@apollo/client';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { useTokenController } from '@deep-foundation/deeplinks/imports/react-token';
import { useLocalStore } from '@deep-foundation/store/local';
import { useEffect } from 'react';
import { GUEST, JWT } from './gql';

export function useAuthNode() {
  return useLocalStore('use_auth_link_id', 0);
}

export const adminToken = `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwczovL2hhc3VyYS5pby9qd3QvY2xhaW1zIjp7IngtaGFzdXJhLWFsbG93ZWQtcm9sZXMiOlsibGluayJdLCJ4LWhhc3VyYS1kZWZhdWx0LXJvbGUiOiJsaW5rIiwieC1oYXN1cmEtdXNlci1pZCI6IjM5In0sImlhdCI6MTYzNzAzMjQwNn0.EtYolslSV66xKe7Bx4x3MkS-dQL5hPqaUqE0eStH3KE`;

export function AuthProvider({
  children,
}: {
  children: JSX.Element;
}) {
  const [linkId] = useAuthNode();
  const [token, setToken] = useTokenController();

  return children;
}

export function useAuth() {
  const [linkId, setLinkId] = useAuthNode();
  const [token, setToken] = useTokenController();
  const gql = useQuery(JWT, { variables: {}, skip: true });
  const client = useApolloClient();
  const deep = useDeep();

  return {
    token,
    linkId,
    setLinkId: async (linkId) => {
      if (!+linkId) {
        setLinkId(await deep.id('@deep-foundation/core', 'admin'));
        setToken(adminToken);
        return;
      }
      const result = await gql.refetch({ linkId });
      const { linkId: lid, token } = result?.data?.jwt;
      if (token && linkId) {
        setLinkId(lid);
        setToken(token);
      }
    },
    guest: async () => {
      const result = await client.query({ query: GUEST });
      const { linkId, token } = result?.data?.guest;
      if (token && linkId) {
        setLinkId(linkId);
        setToken(token);
      }
    },
  };
}