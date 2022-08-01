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
  const { linkId: userId } = useDeep();
  const [baseTypes, setBaseTypes] = useBaseTypes();

  const spaceQuery = useMemo(() => ({ value: { value: { _by_item: {
    group_id: { _eq: baseTypes.containTree },
    path_item_id: { _eq: spaceId },
  } } } }), []);

  let queries = useMinilinksFilter(
    minilinks.ml,
    useCallback((l) => {
      return [baseTypes.Query, baseTypes.Active].includes(l.type_id);
    }, [spaceId]),
    useCallback((l, ml) => {
      return ml.byType[baseTypes.Query]?.filter(l => l?.type_id === baseTypes.Query && !!l?.inByType?.[baseTypes.Active]?.find(a => a?.from_id === spaceId));
    }, [spaceId]),
  );
  console.log('queries', queries);
  queries = queries || [];

  const insertableTypesQuery = useMemo(() => ({ value: { value: {
    can_object: {
      action_id: { _eq: 121 },
      subject_id: { _eq: userId }
    }
  } } }), [userId]);

  const typeIds = useMinilinksFilter(
    minilinks.ml,
    useCallback((l) => true, []),
    useCallback((l, ml) => {
      return Object.keys(ml.byType).map(type => parseInt(type));
    }, []),
  ) || [];

  const insertableTypes = useMinilinksFilter(
    minilinks.ml,
    useCallback((l) => !!l?._applies?.includes('insertable-types'), []),
    useCallback((l, ml) => (ml.links.filter(l => l._applies.includes('insertable-types')).map(l => l.id)), []),
  ) || [];

  const queryAndSpaceLoadedIds = useMinilinksFilter(
    minilinks.ml,
    useCallback((l) => !!l?._applies?.find(a => a.includes('query-') || a.includes('space')), []),
    useCallback((l, ml) => (ml.links.filter(l => l._applies?.find(a => a.includes('query-') || a.includes('space'))).map(l => l.id)), []),
  ) || [];

  const additionalQuery = useMemo(() => {
    const ids = [...typeIds, ...insertableTypes, ...queryAndSpaceLoadedIds];
    return { value: { value: {
      _or: [
        {
          to_id: { _in: ids },
          type_id: { _in: [baseTypes.Contain, baseTypes.Symbol] },
        },
        {
          from_id: { _in: ids },
          type_id: { _in: [baseTypes.Value] },
        },
      ]
    } } };
  }, [typeIds, insertableTypes, queryAndSpaceLoadedIds]);

  return <>
    <DeepLoaderActive
      query={spaceQuery}
      onChange={(r) => {
        minilinks.ml.apply(r, 'space');
      }}
    />
    {queries?.map((f, i) => (<DeepLoaderActive
      key={f.id}
      query={f}
      onChange={(r) => {
        minilinks.ml.apply(r, `query-${f.id}`);
      }}
    />))}
    <DeepLoaderActive
      query={insertableTypesQuery}
      onChange={(r) => {
        minilinks.ml.apply(r, 'insertable-types');
      }}
    />
    {!!typeIds && <DeepLoaderActive
      query={additionalQuery}
      onChange={(r) => {
        minilinks.ml.apply(r, 'additional');
      }}
    />}
  </>;
});