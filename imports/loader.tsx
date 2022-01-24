import { useQuery, useSubscription } from "@apollo/client";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { generateQuery, generateQueryData } from "@deep-foundation/deeplinks/imports/gql";
import { Link, LinkRelations } from "@deep-foundation/deeplinks/imports/minilinks";
import { useLocalStore } from "@deep-foundation/store/local";
import { useDebounceCallback } from "@react-hook/debounce";
import { useEffect, useMemo, useState } from "react";
import { useBaseTypes } from "./gui";

export function DeepLoaderFocus({
  focus,
  onChange,
}: {
  focus: any;
  onChange: (results: Link<number>[]) => any;
}) {
  const deep = useDeep();

  const query = useMemo(() => {
    const v = (focus?.value?.value);
    const variables = deep.serializeQuery(v);
    return generateQuery({
      operation: 'query',
      queries: [generateQueryData({
        tableName: 'links',
        returning: `
          id type_id from_id to_id value
          _by_item {
            id
            item_id
            path_item_depth
            path_item_id
            position_id
            root_id
          }
        `,
        variables: v
        ? { ...variables, where: { _or: [variables.where] } }
        : { where: {}, limit: 0 },
      })],
      name: 'DEEPCASE',
    });
  }, [focus, focus?.value?.value]);
  const s = useQuery(query.query, { variables: query.variables, fetchPolicy: 'no-cache', pollInterval: 1000 });

  // console.log('s', s);

  useEffect(() => {
    if (s?.data?.q0) onChange(s?.data?.q0);
  }, [s]);

  return <></>;
}

export function DeepLoader({
  onChange,
  spaceId,
}: {
  onChange: (results: { [key: string]: any[] }) => any;
  spaceId?: number;
}) {
  const deep = useDeep();
  const { linkId } = useDeep();

  const [baseTypes, setBaseTypes] = useBaseTypes();
  const focusesCriteria = useMemo(() => {
    const whereTypes = {
      _or: [
        { type_id: { _in: [baseTypes.Focus, baseTypes.Contain] }, from_id: { _eq: spaceId } },
        { in: { type_id: { _in: [baseTypes.Focus, baseTypes.Contain] }, from_id: { _eq: spaceId } } },
      ],
    };
    return generateQuery({
      operation: 'query',
      queries: [
        generateQueryData({
          tableName: 'links',
          returning: `
            id type_id from_id to_id value
            _by_item {
              id
              item_id
              path_item_depth
              path_item_id
              position_id
              root_id
            }
          `,
          variables: {
            where: whereTypes,
            // limit: baseTypes?.Focus ? 100 : 0,
          } }),
      ],
      name: 'FOCUSES',
    });
  }, [baseTypes]);
  const focusesQ = useQuery(focusesCriteria.query, { variables: focusesCriteria.variables, fetchPolicy: 'no-cache', pollInterval: 1000 });
  const focuses = (focusesQ?.data?.q0 || []);
  const onlyFocusLinks = useMemo(() => focuses?.filter(f => f.type_id === baseTypes?.Query), [focuses]);

  // console.log('focusesQ', focusesQ);

  const [results, setResults] = useState<any>({});

  useEffect(() => {
    setResults((results) => {
      if (focuses.length) {
        const newResults = {
          ...results,
          focuses,
        };
        onChange(newResults);
        return newResults;
      }
      return results;
    });
  }, [focuses]);

  const setResultsDebounced = useDebounceCallback((value) => {
    setResults(value);
  }, 1000);

  return <>
    {onlyFocusLinks?.map((f, i) => (<DeepLoaderFocus
      key={f.id}
      focus={f}
      onChange={(r) => {
        setResultsDebounced((results) => {
          const newResults = {
            ...results,
            [f.id]: r,
          };
          onChange(newResults);
          return newResults;
        });
      }}
    />))}
  </>;
}