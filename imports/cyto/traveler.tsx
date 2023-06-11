import _flatten from 'lodash/flatten';
import _isEqual from 'lodash/isEqual';

export function initializeTraveler(ncy, deepRef, spaceIdRef) {
  let Traveler;
  (async () => {
    const deep = deepRef.current;
    try {
      Traveler = await deep.id('@deep-foundation/deepcase', 'Traveler');
    } catch(e) {
      console.log(e, deep.linkId, deep);
    }
  })();
  const insertTraveler = async (query, linkId: number) => {
    const spaceId = spaceIdRef.current;
    const deep = deepRef.current;
    await deep.insert({
      type_id: Traveler,
      from_id: linkId,
      in: { data: {
        type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
        from_id: spaceId,
      } },
      to: { data: {
        type_id: deep.idLocal('@deep-foundation/core', 'Query'),
        object: { data: { value: query } },
        in: { data: [
          {
            type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
            from_id: spaceId,
          },
          {
            type_id: deep.idLocal('@deep-foundation/core', 'Active'),
            from_id: spaceId,
            in: { data: {
              type_id: deep.idLocal('@deep-foundation/core', 'Contain'),
              from_id: spaceId,
            } },
          },
        ] },
      } },
    });
  };
  const deleteTraveler = async (query, linkId: number) => {
    const deep = deepRef.current;
    const travelers = findTravlers(query, linkId);
    if (!travelers?.length) return;
    const queries = travelers.map(t => t.to).filter(l => !!l);
    const actives = queries.map(q => q.inByType?.[deep.idLocal('@deep-foundation/core', 'Active')]?.[0]).filter(l => !!l);
    await deepRef.current.delete([
      ...travelers.map(l => l.id),
      ..._flatten(travelers.map(l => l.inByType[deep.idLocal('@deep-foundation/core', 'Contain')].map(l => l.id))),
      ...queries.map(l => l.id),
      ..._flatten(queries.map(l => l.inByType[deep.idLocal('@deep-foundation/core', 'Contain')].map(l => l.id))),
      ...actives.map(l => l.id),
      ..._flatten(actives.map(l => l.inByType[deep.idLocal('@deep-foundation/core', 'Contain')].map(l => l.id))),
    ]);
  };

  const switchTraveler = async (query, linkId: number) => {
    const travelers = findTravlers(query, linkId);
    if (travelers?.length) {
      await deleteTraveler(query, linkId);
    } else {
      await insertTraveler(query, linkId);
    }
  }

  const findTravlers = (query: any, linkId: number) => {
    const spaceId = spaceIdRef.current;
    const deep = deepRef.current;
    if (!Traveler) return [];
    if (query) return deep.minilinks?.byId[linkId]?.outByType?.[Traveler]?.filter(t => _isEqual(t?.to?.value?.value, query));
    else return deep.minilinks?.byId[linkId]?.outByType?.[Traveler];
  }

  const nodeMenuTraveler = ncy.cxtmenu({
    selector: '.link-node',
    outsideMenuCancel: 10,
    openMenuEvents: 'ctxmenu-travelerMenu-open',
    closeMenuEvents: 'ctxmenu-travelerMenu-close',
    commands: [
      ((query) => ({
        content: (ele) => `in ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
        select: async function(ele){ 
          const id = ele.data('link')?.id;
          if (id) {
            // await switchTraveler(query(id), id);
            generateMenuByTypes(ele, query(id));
          }
        }
      }))((id) => ({
        to_id: deepRef.current.minilinks.byId[id].id,
      })),
      ((query) => ({
        content: (ele) => `out ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
        select: async function(ele){ 
          const id = ele.data('link')?.id;
          if (id) {
            // await switchTraveler(query(id), id);
            generateMenuByTypes(ele, query(id));
          }
        }
      }))((id) => ({
        from_id: deepRef.current.minilinks.byId[id].id,
      })),
      ((query) => ({
        content: (ele) => `up ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
        select: async function(ele){ 
          const id = ele.data('link')?.id;
          if (id) {
            // await switchTraveler(query(id), id);
            generateMenuByTrees(ele, query(id), 'down');
          }
        }
      }))((id) => ({
        down: {
          link_id: deepRef.current.minilinks.byId[id].id,
        },
      })),
      ((query) => ({
        content: (ele) => `down ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
        select: async function(ele){ 
          const id = ele.data('link')?.id;
          if (id) {
            // await switchTraveler(query(id), id);
            generateMenuByTrees(ele, query(id), 'up');
          }
        }
      }))((id) => ({
        up: {
          parent_id: deepRef.current.minilinks.byId[id].id,
        },
      })),
      ((query) => ({
        content: (ele) => `typed ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
        select: async function(ele){ 
          const id = ele.data('link')?.id;
          if (id) {
            // await switchTraveler(query(id), id);
            generateMenuByTypes(ele, query(id));
          }
        }
      }))((id) => ({
        type_id: deepRef.current.minilinks.byId[id].id,
      })),
      ((query) => ({
        content: (ele) => `from ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
        select: async function(ele){ 
          const id = ele.data('link')?.id;
          if (id) {
            await switchTraveler(query(id), id);
          }
        }
      }))((id) => ({
        id: deepRef.current.minilinks.byId[id].from_id,
      })),
      ((query) => ({
        content: (ele) => `to ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
        select: async function(ele){ 
          const id = ele.data('link')?.id;
          if (id) {
            await switchTraveler(query(id), id);
          }
        }
      }))((id) => ({
        id: deepRef.current.minilinks.byId[id].to_id,
      })),
      ((query) => ({
        content: (ele) => `types ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
        select: async function(ele){ 
          const id = ele.data('link')?.id;
          if (id) {
            await switchTraveler(query(id), id);
          }
        }
      }))((id) => ({
        down: {
          tree_id: { _eq: deepRef.current.idLocal('@deep-foundation/core', 'typesTree') },
          link_id: { _eq: deepRef.current.minilinks.byId[id].type_id },
        },
      })),
    ],
  });

  const generateMenuByTypes = async (ele, subQuery) => {
    const deep = deepRef.current;
    const { data: types = [] } = await deep.select({
      ...subQuery,
      distinct_on: ['type_id'],
    });
    const menuByTypes = ncy.cxtmenu({
      selector: '.link-node',
      outsideMenuCancel: 10,
      openMenuEvents: 'ctxmenu-travelerMenu-byTypes-open',
      closeMenuEvents: 'ctxmenu-travelerMenu-byTypes-close',
      onClose: () => menuByTypes.destroy(),
      commands: [
        ((query) => ({
          content: (ele) => `all ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              await switchTraveler(query(id), id);
            }
          }
        }))((id) => ({
          ...subQuery
        })),
        ...types?.map(l => ((query) => ({
          content: (ele) => `${deep.nameLocal(l.type_id)} ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              await switchTraveler(query(id), id);
            }
          }
        }))((id) => ({
          ...subQuery,
          type_id: l.type_id,
        }))),
      ],
    });
    ele.emit('ctxmenu-travelerMenu-byTypes-open');
    return {
      destroy: () => {
        ele.emit('ctxmenu-travelerMenu-byTypes-close');
        menuByTypes.destroy();
      },
    };
  }

  const generateMenuByTrees = async (ele, subQuery, key) => {
    const deep = deepRef.current;
    const { data: trees } = await deep.select({
      distinct_on: ['tree_id'],
      link_id: ele.data('link')?.id
    }, { table: 'tree', returning: 'tree_id' });
    const treesIds = trees.map(t => t.tree_id);
    const menuByTypes = ncy.cxtmenu({
      selector: '.link-node',
      outsideMenuCancel: 10,
      openMenuEvents: 'ctxmenu-travelerMenu-byTypes-open',
      closeMenuEvents: 'ctxmenu-travelerMenu-byTypes-close',
      onClose: () => menuByTypes.destroy(),
      commands: [
        ((query) => ({
          content: (ele) => `all ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              await switchTraveler(query(id), id);
            }
          }
        }))((id) => ({
          ...subQuery
        })),
        ...treesIds?.map(treeId => ((query) => ({
          content: (ele) => `${deep.nameLocal(treeId) || 'types'} ${findTravlers(query(ele.data('link')?.id), ele.data('link')?.id)?.length ? 'x' : '+'}`,
          select: async function(ele){ 
            const id = ele.data('link')?.id;
            if (id) {
              await switchTraveler(query(id), id);
            }
          }
        }))((id) => {
          const q = { ...subQuery };
          q[key].tree_id = treeId;
          return q;
        })),
      ],
    });
    ele.emit('ctxmenu-travelerMenu-byTypes-open');
    return {
      destroy: () => {
        ele.emit('ctxmenu-travelerMenu-byTypes-close');
        menuByTypes.destroy();
      },
    };
  }

  return {
    destroy: () => {
      nodeMenuTraveler.destroy();
    },
    insertTraveler,
    deleteTraveler,
    switchTraveler,
    findTravlers,
  };
}