import { useQuery, useSubscription } from "@apollo/client";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { generateQuery, generateQueryData } from "@deep-foundation/deeplinks/imports/gql";
import { Link, LinkRelations, MinilinkCollection, MinilinksGeneratorOptionsDefault } from "@deep-foundation/deeplinks/imports/minilinks";
import { useLocalStore } from "@deep-foundation/store/local";
import { useDebounceCallback } from "@react-hook/debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBaseTypes } from "./gui";
import { useInterval } from 'usehooks-ts';
import { useDelayedInterval } from "./use-delayed-interval";
import { useCallback, memo } from "react";

export function DeepLoaderActive({
  query,
  onChange,
}: {
  query: any;
  onChange: (results: Link<number>[]) => any;
}) {
  const deep = useDeep();
  const subQuery = useMemo(() => {
    const v = (query?.value?.value);
    const variables = deep.serializeQuery(v);
    return generateQuery({
      operation: 'query',
      queries: [generateQueryData({
        tableName: 'links',
        returning: `
          id type_id from_id to_id value
        `,
        variables: v
        ? { ...variables, where: variables.where }
        : { where: {}, limit: 0 },
      })],
      name: 'DEEPCASE',
    });
  }, [query, query?.value?.value]);
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
  }), [query, query?.value?.value]));

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
  onChange,
  spaceId,

  minilinks,

  onUpdateScreenQuery,
}: {
  onChange?: (results: { [key: string]: any[] }) => any;
  spaceId?: number;

  minilinks?: any;

  onUpdateScreenQuery?: (query: any) => any;
}) {
  const deep = useDeep();
  const { linkId } = useDeep();

  const [baseTypes, setBaseTypes] = useBaseTypes();
  const screenQuery = useMemo(() => {
    const whereTypes = {
      id: { _in: [spaceId] },
    };
    const query = generateQuery({
      operation: 'query',
      queries: [
        generateQueryData({
          tableName: 'links',
          returning: `
            id type_id from_id to_id value
          `,
          variables: {
            where: whereTypes,
            // limit: baseTypes?.Focus ? 100 : 0,
          } }),
      ],
      name: 'ACTIVES',
    });
    onUpdateScreenQuery && onUpdateScreenQuery(query);
    return query;
  }, [JSON.stringify(baseTypes)]);
  const screenResults = useQuery(screenQuery.query, { variables: screenQuery.variables });
  const [r, setR] = useState<any>();
  const screenLinks = (r?.data?.q0 || screenResults?.data?.q0);
  const [results, setResults] = useState<any>({});
  const onlyActiveQueries = useMemo(() => {
    return minilinks.ml.byId?.[spaceId]?.out?.filter(out => out.type_id === baseTypes.Active && out?.to?.type_id === baseTypes.Query && out?.to)?.map(l => l?.to) || [];
  }, [results, r, screenLinks, spaceId]);
  const types = useMemo(() => {
    const all = {};
    const typesObject = {};
    const typesArray = [];
    const fks = Object.keys(results || {});
    for (let f = 0; f < fks.length; f++) {
      const fk = fks[f];
      for (let i = 0; i < results?.[fk]?.length; i++) {
        const link = results?.[fk]?.[i];
        all[link?.id] = link;
        if (fk !== 'types') {
          if (!typesObject[link.type_id]) {
            typesObject[link.type_id] = true;
            typesArray.push(link.type_id);
          }
        }
      }
    }
    const arr = Object.values(all);
    minilinks.ml.apply(Object.values(arr));

    return typesArray;
  }, [results]);

  // console.log({ screenLinks, screenResults, r, onlyActiveQueries, Query: baseTypes?.Query });
  
  const useDelayedIntervalRef = useRef<any>();
  useDelayedIntervalRef.current = screenQuery;
  useDelayedInterval(() => new Promise((res) => {
    screenResults.refetch(useDelayedIntervalRef.current.variables).then((r) => {
      setR(r);
      res(undefined);
    });
  }));
  // console.log('results', results);

  useEffect(() => {
    if (screenLinks?.length) {
      setResults((results) => {
        let newResults;
        newResults = {
          ...results,
          actives: screenLinks,
        };
        // applyChanges(newResults);
        onChange && onChange(newResults);
        return newResults;
      });
    }
  }, [screenLinks]);

  // unmount empty useEffect
  useEffect(() => {
    return () => {
      minilinks.ml.apply([]);
    };
  }, []);

  return <>
    {onlyActiveQueries?.map((f, i) => (<DeepLoaderActive
      key={f.id}
      query={f}
      onChange={(r) => {
        setResults((results) => {
          const newResults = {
            ...results,
            [f.id]: r,
          };
          // applyChanges(newResults);
          onChange && onChange(newResults);
          return newResults;
        });
      }}
    />))}
    <DeepLoaderActive
      query={useMemo(() => ({
        value: {
          value: { _by_item: {
            group_id: { _eq: baseTypes.containTree },
            path_item_id: { _eq: spaceId },
          } },
        },
      }), [spaceId])}
      onChange={(r) => {
        setResults((results) => {
          const newResults = {
            ...results,
            packages: r,
          };
          // applyChanges(newResults);
          onChange && onChange(newResults);
          return newResults;
        });
      }}
    />
    <DeepLoaderActive
      query={useMemo(() => ({
        value: { value: {
          id: { _in: types },
        } },
      }), [types])}
      onChange={(r) => {
        setResults((results) => {
          const newResults = {
            ...results,
            types: r,
          };
          // applyChanges(newResults);
          onChange && onChange(newResults);
          return newResults;
        });
      }}
    />
  </>;
});