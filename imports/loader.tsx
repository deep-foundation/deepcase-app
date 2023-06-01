import { useQuery, useSubscription } from "@apollo/client";
import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { generateQuery, generateQueryData } from "@deep-foundation/deeplinks/imports/gql";
import { Link, useMinilinksFilter } from "@deep-foundation/deeplinks/imports/minilinks";
import { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useBreadcrumbs, usePromiseLoader } from "./hooks";
import { CatchErrors } from "./react-errors";
import { useDelayedInterval } from "./use-delayed-interval";

export function DeepLoaderActive({
  name,
  query: queryLink,
  onChange,
  debounce = 1000,
  subscription = true,
}: {
  name: string;
  query: any;
  onChange: (results: Link<number>[]) => any;
  debounce?: number;
  subscription?: boolean;
}) {
  const useApolloLoader = subscription ? useSubscription : useQuery;
  const deep = useDeep();
  const [promiseLoader, setPromiseLoader] = usePromiseLoader();
  const subQuery = useMemo(() => {
    const v = (queryLink?.value?.value);
    const variables = deep.serializeQuery(v);
    const where = {
      _and: [
        ...(!promiseLoader ? [{
          type_id: {
            _nin: [
              deep.idLocal('@deep-foundation/core', 'Then'),
              deep.idLocal('@deep-foundation/core', 'Promise'),
              deep.idLocal('@deep-foundation/core', 'Resolved'),
              deep.idLocal('@deep-foundation/core', 'Rejected'),
              deep.idLocal('@deep-foundation/core', 'PromiseResult'),
            ],
          },
        }] : [{}]),
        variables?.where,
      ],
    };
    return generateQuery({
      operation: subscription ? 'subscription' : 'query',
      queries: [generateQueryData({
        tableName: 'links',
        returning: `
          id type_id from_id to_id value string { id value } number { id value } object { id value }
        `,
        variables: v
        ? { ...variables, where }
        : { where: {}, limit: 0 },
      })],
      name: name,
    });
  }, [queryLink, queryLink?.value?.value, promiseLoader]);
  const subQueryResults = useApolloLoader(subQuery.query, { variables: subQuery.variables });
  const [sintSubQueryResults, setSintSubQueryResults] = useState<any>(subQueryResults);
  const subQueryPrimary = subscription ? subQueryResults : sintSubQueryResults || subQueryResults;

  const delayedSubQueryRef = useRef<any>();
  delayedSubQueryRef.current = subQuery;
  useDelayedInterval(useCallback(() => new Promise((res, rej) => {
    if (subscription) rej();
    // @ts-ignore
    else subQueryResults?.refetch(delayedSubQueryRef.current.variables).then((r) => {
      setSintSubQueryResults(r);
      res(undefined);
    });
  }), [queryLink, queryLink?.value?.value]), debounce);

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
}: {
  spaceId?: number;
}) {
  const deep = useDeep();
  const userId = deep.linkId;
  const [promiseLoader, setPromiseLoader] = usePromiseLoader();
  const [breadcrumbs] = useBreadcrumbs();
  // console.log({ breadcrumbs });

  const spaceQuery = useMemo(() => ({ value: { value: {
    up: {
      tree_id: { _eq: deep.idLocal('@deep-foundation/core', 'containTree') },
      parent_id: { _eq: spaceId },
    },
    ...(!promiseLoader ? {
      type_id: {
        _nin: [
          deep.idLocal('@deep-foundation/core', 'Then'),
          deep.idLocal('@deep-foundation/core', 'Promise'),
          deep.idLocal('@deep-foundation/core', 'Resolved'),
          deep.idLocal('@deep-foundation/core', 'Rejected'),
          deep.idLocal('@deep-foundation/core', 'PromiseResult'),
        ],
      },
    } : {}),
    _not: {
      _and: [
        // {
        //   _not: {
        //     up: {
        //       tree_id: { _eq: deep.idLocal('@deep-foundation/core', 'containTree') },
        //       parent_id: { _eq: spaceId },
        //       depth: { _lte: 2 },
        //       self: { _eq: false }
        //     },
        //   }
        // },
        {
          _not: {
            in: {
              type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
              from_id: { _eq: spaceId }
            }
          }
        },
        {
          up: {
            tree_id: { _eq: deep.idLocal('@deep-foundation/core', 'containTree') },
            self: { _eq: false },
            parent: {
              type_id: { _in: [deep.idLocal('@deep-foundation/core', 'Space'), deep.idLocal('@deep-foundation/core', 'Package')] },
              up: {
                tree_id: { _eq: deep.idLocal('@deep-foundation/core', 'containTree') },
                self: { _eq: false },
                parent_id: { _eq: spaceId },
              },
            },
          },
        }
      ]
    },
    // _by_item: {
    //   _not: {
    //     tree_id: { _eq: deep.idLocal('@deep-foundation/core', 'containTree') },
    //     self: { _eq: false },
    //     parent: {
    //       type_id: { _in: [deep.idLocal('@deep-foundation/core', 'Space'), deep.idLocal('@deep-foundation/core', 'Package')] },
    //       up: {
    //         tree_id: { _eq: deep.idLocal('@deep-foundation/core', 'containTree') },
    //         self: { _eq: false },
    //         parent_id: { _eq: spaceId },
    //       },
    //     },
    //   },
    // },
  } } }), [promiseLoader]);

  const breadcrumbsQuery = useMemo(() => ({ value: { value: {
    down: {
      tree_id: { _eq: deep.idLocal('@deep-foundation/core', 'containTree') },
      link_id: { _eq: spaceId },
    },
  } } }), [promiseLoader]);

  let queries = useMinilinksFilter(
    deep.minilinks,
    useCallback((l, ...args) => {
      // console.log('ABC', l, ...args);
      // console.trace('ABC');
      return [deep.idLocal('@deep-foundation/core', 'Query'), deep.idLocal('@deep-foundation/core', 'Active')].includes(l.type_id);
    }, [spaceId]),
    useCallback((l, ml) => {
      return ml.byType[deep.idLocal('@deep-foundation/core', 'Query')]?.filter((l) => {
        return l?.type_id === deep.idLocal('@deep-foundation/core', 'Query') && !!l?.inByType?.[deep.idLocal('@deep-foundation/core', 'Active')]?.find(a => a?.from_id === spaceId) && l?.value?.value;
      });
    }, [spaceId]),
  );
  queries = queries || [];

  const insertableTypesQuery = useMemo(() => ({ value: { value: {
    _or: [
      {
        can_object: {
          action_id: { _eq: 121 },
          subject_id: { _eq: userId }
        }
      }, {
        type_id: { _in: [
          deep.idLocal('@deep-foundation/core', 'Type'),
          deep.idLocal('@deep-foundation/core', 'HandleOperation'),
          deep.idLocal('@deep-foundation/core', 'Operation'),
          deep.idLocal('@deep-foundation/core', 'TreeInclude'),
          deep.idLocal('@deep-foundation/core', 'File'),
        ] }
      },
    ],
  } } }), [userId]);

  const insertableTypes = useMinilinksFilter(
    deep.minilinks,
    useCallback((l) => !!l?._applies?.includes('insertable-types'), []),
    useCallback((l, ml) => (ml.links.filter(l => l._applies.includes('insertable-types')).map(l => l.id)), []),
  ) || [];

  const typeIds = useMinilinksFilter(
    deep.minilinks,
    useCallback((l) => true, []),
    useCallback((l, ml) => {
      return Object.keys(ml.byType).map(type => parseInt(type));
    }, []),
  ) || [];

  const ids = useMinilinksFilter(
    deep.minilinks,
    useCallback((l) => true, []),
    useCallback((l, ml) => {
      return Object.keys(ml.byId).map(link => parseInt(link));
    }, []),
  ) || [];

  const queryAndSpaceLoadedIds = useMinilinksFilter(
    deep.minilinks,
    useCallback((l) => !!l?._applies?.find(a => a.includes('query-') || a.includes('space')), []),
    useCallback((l, ml) => (ml.links.filter(l => l._applies?.find(a => a.includes('query-') || a.includes('space'))).map(l => l.id)), []),
  ) || [];

  const containsAndSymbolsQuery = useMemo(() => {
    const ids = [...typeIds, ...insertableTypes, ...queryAndSpaceLoadedIds];
    return { value: { value: {
      to_id: { _in: ids },
      type_id: { _in: [deep.idLocal('@deep-foundation/core', 'Contain'), deep.idLocal('@deep-foundation/core', 'Symbol')] },
    } } };
  }, [typeIds, insertableTypes, queryAndSpaceLoadedIds]);

  const valuesQuery = useMemo(() => {
    const ids = [...typeIds, ...insertableTypes, ...queryAndSpaceLoadedIds];
    return { value: { value: {
      from_id: { _in: ids },
      type_id: { _eq: deep.idLocal('@deep-foundation/core', 'Value') },
    } } };
  }, [typeIds, insertableTypes, queryAndSpaceLoadedIds]);

  const typesQuery = useMemo(() => {
    return { value: { value: {
      down: {
        tree_id: { _eq: 0 },
        link_id: { _in: ids }
      },
    } } };
  }, [ids]);

  // const all = useMinilinksFilter(deep.minilinks, () => true, () => Object.keys(deep.minilinks.byId));

  // Not an efficient implementation. You have to load wood.
  const clientHandlersQuery = useMemo(() => {
    const _ids = [...ids, ...queryAndSpaceLoadedIds];
    return { value: { value: {
      _or: [
        { 
          type_id: deep.idLocal('@deep-foundation/core', 'Handler'),
          in: {
            type_id: deep.idLocal('@deep-foundation/core', 'HandleClient'),
          },
        },
        { type_id: deep.idLocal('@deep-foundation/core', 'HandleClient') },
      ]
    } } };
  }, [queryAndSpaceLoadedIds, ids]);

  return <>
    <><DeepLoaderActive
      key="DEEPCASE_SPACE"
      name="DEEPCASE_SPACE"
      query={spaceQuery}
      onChange={(r) => {
        deep.minilinks?.apply(r, 'space');
      }}
    /></>
    {!!breadcrumbs && <><DeepLoaderActive
      key="DEEPCASE_BREADCRUMBS"
      name="DEEPCASE_BREADCRUMBS"
      query={breadcrumbsQuery}
      onChange={(r) => {
        deep.minilinks?.apply(r, 'breadcrumbs');
      }}
    /></>}
    <><DeepLoaderActive
      key="DEEPCASE_CLIENT_HANDLERS"
      name="DEEPCASE_CLIENT_HANDLERS"
      query={clientHandlersQuery}
      onChange={(r) => {
        deep.minilinks?.apply(r, 'client-handlers');
      }}
    /></>
    {queries?.map((f, i) => (<DeepLoaderActive
      key={`DEEPCASE_QUERY_${f.id}`}
      name={`DEEPCASE_QUERY_${f.id}`}
      query={f}
      onChange={(r) => {
        deep.minilinks?.apply(r, `query-${f.id}`);
      }}
    />))}
    <><DeepLoaderActive
      key={`DEEPCASE_INSERTABLE_TYPES`}
      name={`DEEPCASE_INSERTABLE_TYPES`}
      query={insertableTypesQuery}
      onChange={(r) => {
        deep.minilinks?.apply(r, 'insertable-types');
      }}
    /></>
    <><DeepLoaderActive
      key={`DEEPCASE_TYPES`}
      name={`DEEPCASE_TYPES`}
      query={typesQuery}
      onChange={(r) => {
        deep.minilinks?.apply(r, 'types');
      }}
    /></>
    {!!typeIds && <><DeepLoaderActive
      key={`DEEPCASE_CONTAINS_AND_SYMBOLS`}
      name={`DEEPCASE_CONTAINS_AND_SYMBOLS`}
      query={containsAndSymbolsQuery}
      debounce={2000}
      onChange={(r) => {
        deep.minilinks?.apply(r, 'contains_and_symbols');
      }}
    /></>}
    {!!typeIds && <><DeepLoaderActive
      key={`DEEPCASE_VALUES`}
      name={`DEEPCASE_VALUES`}
      query={valuesQuery}
      onChange={(r) => {
        deep.minilinks?.apply(r, 'values');
      }}
    /></>}
  </>;
});