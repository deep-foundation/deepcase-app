import gql from 'graphql-tag';
import { useMutation } from '@apollo/client';
import { useCallback } from 'react';
import { generateMutation, generateSerial, ISerialOptions } from '@deep-foundation/deeplinks/imports/gql';

export const JWT = gql`query JWT($linkId: Int) {
  jwt(input: {linkId: $linkId}) {
    linkId
    token
  }
}`;

export const GUEST = gql`query GUEST {
  guest {
    linkId
    token
  }
}`;

export const LINKS_BODY_string = `
  id type_id from_id to_id value
  _by_item {
    id
    item_id
    path_item_depth
    path_item_id
    position_id
    root_id
  }
`;

export const LINKS_WHERE_string = `subscription ($where: links_bool_exp){
  links(where: $where) {
    ${LINKS_BODY_string}
  }
}`;
export const LINKS_WHERE = gql`${LINKS_WHERE_string}`;

export const INSERT_LINKS = gql`mutation INSERT_LINKS($objects: [links_insert_input!]!) { insert_links: insert_links(objects: $objects) { returning { id } } }`;
export const UPDATE_LINKS = gql`mutation UPDATE_LINKS($set: links_set_input, $where: links_bool_exp!) { update_links: update_links(_set: $set, where: $where) { returning { id } } }`;
export const DELETE_LINKS = gql`mutation DELETE_LINKS($where: links_bool_exp!) { delete_links: delete_links(where: $where) { returning { id } } }`;

export const INSERT_STRING = gql`mutation INSERT_STRING($objects: [string_insert_input!]!) { insert_string: insert_string(objects: $objects) { returning { id } } }`;
export const UPDATE_STRING = gql`mutation UPDATE_STRING($set: string_set_input, $where: string_bool_exp!) { update_string: update_string(_set: $set, where: $where) { returning { id } } }`;

export const insertLinks = (links: { from_id?: number; to_id?: number; type_id: number; }[]) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'links', operation: 'insert',
        variables: { objects: links },
      }),
    ],
    name: 'INSERT_LINKS',
  });
}

export const deleteLinks = (ids: number[]) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'links', operation: 'delete',
        variables: { where: { id: { _in: ids } } },
      }),
    ],
    name: 'DELETE_LINKS',
  });
}

export const insertReserved = (reserved_ids: String[],  userId: Number ) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'reserved', operation: 'insert',
        variables: { objects: { reserved_ids, user_id: userId, created_at: new Date().toISOString() } },
      }),
    ],
    name: 'INSERT_RESERVED',
  });
}

export const deleteReserveds = (reserveds: number[]) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'reserved', operation: 'delete',
        variables: { where: { id: { _in: reserveds } } },
      }),
    ],
    name: 'DELETE_RESERVEDS',
  });
}

export const insertLink = (link: { from_id?: number; to_id?: number; type_id: number; }) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'links', operation: 'insert',
        variables: { objects: link },
      }),
    ],
    name: 'INSERT_LINK',
  });
}
export const deleteLink = (id: number) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'links', operation: 'delete',
        variables: { where: { id: { _eq: id } } },
      }),
    ],
    name: 'DELETE_LINK',
  });
}

export const insertString = (link_id: number, value: string) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'string', operation: 'insert',
        variables: { objects: { link_id, value } },
      }),
    ],
    name: 'INSERT_STRING',
  });
}
export const updateString = (id: number, value: string) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'string', operation: 'update',
        variables: { where: { id: { _eq: id } }, _set: { value: value } },
      }),
    ],
    name: 'UPDATE_STRING',
  });
}
export const deleteString = (id: number) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'string', operation: 'delete',
        variables: { where: { id: { _eq: id } } },
      }),
    ],
    name: 'DELETE_STRING',
  });
}

export const insertBoolExp = (link_id: number, value: string) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'bool_exp', operation: 'insert',
        variables: { objects: { link_id, gql: value } },
      }),
    ],
    name: 'INSERT_BOOL_EXP',
  });
}
export const updateBoolExp = (id: number, value: string) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'bool_exp', operation: 'update',
        variables: { where: { id: { _eq: id } }, _set: { gql: value } },
      }),
    ],
    name: 'UPDATE_BOOL_EXP',
  });
}
export const deleteBoolExp = (id: number) => {
  return generateSerial({
    actions: [
      generateMutation({
        tableName: 'bool_exp', operation: 'delete',
        variables: { where: { id: { _eq: id } } },
      }),
    ],
    name: 'DELETE_BOOL_EXP',
  });
}