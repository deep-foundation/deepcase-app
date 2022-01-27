import { useQuery, useSubscription } from "@apollo/client";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { generateQuery, generateQueryData } from "@deep-foundation/deeplinks/imports/gql";
import { Link, LinkRelations, MinilinkCollection, MinilinksGeneratorOptionsDefault } from "@deep-foundation/deeplinks/imports/minilinks";
import { useLocalStore } from "@deep-foundation/store/local";
import { useDebounceCallback } from "@react-hook/debounce";
import { useEffect, useMemo, useRef, useState } from "react";
import { useBaseTypes } from "./gui";
import { useInterval } from 'usehooks-ts';

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
        ? { ...variables, where: { _or: [variables.where, { typed: variables.where }] } }
        : { where: {}, limit: 0 },
      })],
      name: 'DEEPCASE',
    });
  }, [focus, focus?.value?.value]);
  const s = useQuery(subQuery.query, { variables: subQuery.variables });
  const [r, setR] = useState<any>(s);

  useInterval(() => {
    s.refetch(subQuery).then((r) => {
      // console.log('subQuery setR', r?.data?.q0);
      setR(r);
    });
  }, 1000);

  useEffect(() => {
    if (r?.data?.q0) onChange(r?.data?.q0);
    else if (s?.data?.q0) onChange(s?.data?.q0);
  }, [s, r]);

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
      _or: [
        { type_id: { _in: [baseTypes.User] } },
        { type_id: { _in: [baseTypes.Focus, baseTypes.Contain] }, from_id: { _eq: spaceId } },
        { in: { type_id: { _in: [baseTypes.Focus, baseTypes.Contain] }, from_id: { _eq: spaceId } } },
      ],
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
  const screenLinks = (screenResults?.data?.q0 || r?.data?.q0 || []);
  const onlyFocusLinks = screenLinks?.filter(f => f.type_id === baseTypes?.Query);

  useInterval(() => {
    screenResults.refetch(screenQuery).then((r) => {
      // console.log('query setR', r?.data?.q0);
      setR(r);
    });
  }, 1000)

  const [results, setResults] = useState<any>({});

  useEffect(() => {
    setResults((results) => {
      let newResults;
      newResults = {
        ...results,
        focuses: screenLinks,
      };

      const all = {};
      const fks = Object.keys(newResults || {});
      for (let f = 0; f < fks.length; f++) {
        const fk = fks[f];
        for (let i = 0; i < newResults[fk].length; i++) {
          const link = newResults[fk][i];
          all[link?.id] = link;
        }
      }
      // console.log('minilinks.ml.apply', Object.values(all));
      minilinks.ml.apply(Object.values(all));

      onChange(newResults);

      return newResults;
    });
  }, [screenLinks]);

  // const setResultsDebounced = useDebounceCallback((value) => {
  //   setResults(value);
  // }, 1000);

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

          const all = {};
          const fks = Object.keys(newResults || {});
          for (let f = 0; f < fks.length; f++) {
            const fk = fks[f];
            for (let i = 0; i < newResults[fk].length; i++) {
              const link = newResults[fk][i];
              all[link?.id] = link;
            }
          }
          // console.log('minilinks.ml.apply', Object.values(all));
          minilinks.ml.apply(Object.values(all));
    
          onChange(newResults);

          return newResults;
        });
      }}
    />))}
  </>;
}