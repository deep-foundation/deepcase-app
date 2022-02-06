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
import { useCallback } from "react";

export function DeepLoaderFocus({
  focus,
  onChange,
}: {
  focus: any;
  onChange: (results: Link<number>[]) => any;
}) {
  const deep = useDeep();
  const subQuery = useMemo(() => {
    const v = (focus?.value?.value);
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
  }, [focus, focus?.value?.value]);
  const subQueryResults = useQuery(subQuery.query, { variables: subQuery.variables });
  const [sintSubQueryResults, setSintSubQueryResults] = useState<any>(subQueryResults);
  const subQueryPrimary = sintSubQueryResults || subQueryResults;
  
  useDelayedInterval(() => new Promise((res) => {
    subQueryResults.refetch(subQuery.variables).then((r) => {
      setSintSubQueryResults(r);
      res(undefined);
    });
  }));

  useEffect(() => {
    if (subQueryPrimary?.data?.q0) onChange(subQueryPrimary?.data?.q0);
  }, [subQueryPrimary]);

  return <></>;
}

export function DeepLoader({
  onChange,
  spaceId,

  minilinks,

  onUpdateScreenQuery,
}: {
  onChange: (results: { [key: string]: any[] }) => any;
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
      name: 'FOCUSES',
    });
    onUpdateScreenQuery && onUpdateScreenQuery(query);
    return query;
  }, [JSON.stringify(baseTypes)]);
  const screenResults = useQuery(screenQuery.query, { variables: screenQuery.variables });
  const [r, setR] = useState<any>();
  const screenLinks = (r?.data?.q0 || screenResults?.data?.q0);
  const onlyFocusLinks = useMemo(() => {
    // console.log(minilinks.ml);
    return minilinks.ml.byId?.[spaceId]?.out?.filter(out => out.type_id === baseTypes.Focus && out?.to?.type_id === baseTypes.Query && out?.to)?.map(l => l?.to) || [];
  }, [screenLinks, spaceId]);

  // console.log({ screenLinks, screenResults, r, onlyFocusLinks, Query: baseTypes?.Query });
  
  useDelayedInterval(() => new Promise((res) => {
    screenResults.refetch(screenQuery.variables).then((r) => {
      setR(r);
      res(undefined);
    });
  }));

  const [results, setResults] = useState<any>({});
  // console.log('results', results);

  const applyChanges = useCallback((newResults) => {
    const all = {};
    const fks = Object.keys(newResults || {});
    for (let f = 0; f < fks.length; f++) {
      const fk = fks[f];
      for (let i = 0; i < newResults?.[fk]?.length; i++) {
        const link = newResults?.[fk]?.[i];
        all[link?.id] = link;
      }
    }
    minilinks.ml.apply(Object.values(all));
  }, []);

  useEffect(() => {
    if (screenLinks?.length) {
      setResults((results) => {
        let newResults;
        newResults = {
          ...results,
          focuses: screenLinks,
        };
        applyChanges(newResults);
        onChange(newResults);
        return newResults;
      });
    }
  }, [screenLinks]);

  return <>
    {onlyFocusLinks?.map((f, i) => (<DeepLoaderFocus
      key={f.id}
      focus={f}
      onChange={(r) => {
        setResults((results) => {
          const newResults = {
            ...results,
            [f.id]: r,
          };
          applyChanges(newResults);
          onChange(newResults);
          return newResults;
        });
      }}
    />))}
    <DeepLoaderFocus
      focus={useMemo(() => ({
        value: {
          value: { _by_item: {
            group_id: { _eq: baseTypes.containTree },
            path_item_id: { _eq: spaceId },
          } },
        },
      }), [baseTypes, spaceId])}
      onChange={(r) => {
        setResults((results) => {
          const newResults = {
            ...results,
            packages: r,
          };
          applyChanges(newResults);
          onChange(newResults);
          return newResults;
        });
      }}
    />
  </>;
}