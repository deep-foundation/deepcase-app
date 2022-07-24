import { useQuery, useSubscription } from "@apollo/client";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { generateQuery, generateQueryData } from "@deep-foundation/deeplinks/imports/gql";
import { Link, LinkRelations, MinilinkCollection, MinilinksGeneratorOptionsDefault, useMinilinksFilter } from "@deep-foundation/deeplinks/imports/minilinks";
import { useLocalStore } from "@deep-foundation/store/local";
import { useDebounceCallback } from "@react-hook/debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBaseTypes } from "./hooks";
import { useInterval } from 'usehooks-ts';
import { useDelayedInterval } from "./use-delayed-interval";
import { useCallback, memo } from "react";

export function DeepLoaderActive({
  query: queryLink,
  onChange,
}: {
  query: any;
  onChange: (results: Link<number>[]) => any;
}) {
  const deep = useDeep();
  const subQuery = useMemo(() => {
    const v = (queryLink?.value?.value);
    const variables = deep.serializeQuery(v);
    return generateQuery({
      operation: 'query',
      queries: [generateQueryData({
        tableName: 'links',
        returning: `
          id type_id from_id to_id value
        `,
        variables: v
        ? { ...variables, where: variables?.where }
        : { where: {}, limit: 0 },
      })],
      name: 'DEEPCASE',
    });
  }, [queryLink, queryLink?.value?.value]);
  const subQueryResults = useQuery(subQuery.query, { variables: subQuery.variables });
  const [sintSubQueryResults, setSintSubQueryResults] = useState<any>(subQueryResults);
  const subQueryPrimary = sintSubQueryResults || subQueryResults;

  const delayedSubQueryRef = useRef<any>();
  delayedSubQueryRef.current = subQuery;
  useDelayedInterval(useCallback(() => new Promise((res) => {
    subQueryResults.refetch(delayedSubQueryRef.current.variables).then((r) => {
      setSintSubQueryResults(r);
      res(undefined);
    });
  }), [queryLink, queryLink?.value?.value]));

  useEffect(() => {
    if (subQueryPrimary?.data?.q0) onChange && onChange(subQueryPrimary?.data?.q0);
  }, [subQueryPrimary]);

  useEffect(() => {
    return () => {
      onChange && onChange([]);
    }
  }, []);

  return <></>;
}

export const DeepLoader = memo(function DeepLoader({
  spaceId,
  minilinks,
}: {
  spaceId?: number;
  minilinks?: any;
}) {
  const [baseTypes, setBaseTypes] = useBaseTypes();

  const types = useMinilinksFilter(
    minilinks.ml,
    useCallback((l) => l?.type_id === 1, []),
    useCallback((l, links) => (links.byType[1] || []), []),
  ) || [];

  const spaceQuery = useMemo(() => ({ value: { value: { _by_item: {
    group_id: { _eq: baseTypes.containTree },
    path_item_id: { _eq: spaceId },
  } } } }), []);

  const onlyActiveQueries = useMemo(() => {
    return minilinks.ml.byId?.[spaceId]?.out?.filter(out => (
      out.type_id === baseTypes.Active && out?.to?.type_id === baseTypes.Query && out?.to && out?.to?.value
    ))?.map(l => l?.to) || [];
  }, [spaceId]);

  const typesQuery = useMemo(() => ({ value: { value: {
    type_id: { _in: [1, baseTypes.Package] },
  } } }), []);

  const additionalQuery = useMemo(() => ({ value: { value: {
    to_id: { _in: types.map(t => t.id) },
    type_id: { _in: [baseTypes.Contain, baseTypes.Symbol] },
  } } }), [types]);

  return <>
    <DeepLoaderActive
      query={spaceQuery}
      onChange={(r) => {
        minilinks.ml.apply(r, 'space');
      }}
    />
    {onlyActiveQueries?.map((f, i) => (<DeepLoaderActive
      key={f.id}
      query={f}
      onChange={(r) => {
        minilinks.ml.apply(r, `query-${f.id}`);
      }}
    />))}
    <DeepLoaderActive
      query={typesQuery}
      onChange={(r) => {
        minilinks.ml.apply(r, 'types');
      }}
    />
    {!!types?.length && <DeepLoaderActive
      query={additionalQuery}
      onChange={(r) => {
        minilinks.ml.apply(r, 'additional');
      }}
    />}
  </>;
});