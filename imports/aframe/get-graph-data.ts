import json5 from 'json5';
import { useSpaceId } from '../hooks';

export const getGraphData = (deep, links) => {
  const [spaceId, setSpaceId] = useSpaceId();

  let graphData = { nodes: [], edges: [] };
  console.log({ links });
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    const ml = deep.minilinks;

    const focus = link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Focus')]?.find(f => f.from_id === spaceId);
    const isFocusSpace = (link.type_id === deep.idLocal('@deep-foundation/core', 'Focus') && link._applies.includes('space')) || (link?.to?.type_id === deep.idLocal('@deep-foundation/core', 'Focus') && link._applies.includes('space'));

    let _value = '';
    let _name = '';
    let _type = '';
    let _symbol = '';

    if (typeof link?.value?.value !== 'undefined') {
      let json;
      try { json = json5.stringify(link?.value.value); } catch (error) { }
      _value = (
        typeof (link?.value.value) === 'object' && json
          ? json : link?.value.value
      );
      if (typeof (_value) === 'string') _value = _value.split('\n')[0];
      if (_value.length > 20) _value = _value.slice(0, 11) + '...' + _value.slice(-9, _value.length);
    }
    if (link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value) {
      _name = `name:${link?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value}`;
    }
    if (ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idLocal('@deep-foundation/core', 'Contain'))?.value?.value) {
      _type = `type:${ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idLocal('@deep-foundation/core', 'Contain'))?.value?.value}`;
    }
    if (ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idLocal('@deep-foundation/core', 'Symbol'))?.value?.value) {
      _symbol = ml.byTo[link?.type_id]?.find(l => l.type_id === deep.idLocal('@deep-foundation/core', 'Symbol'))?.value?.value;
    }

    const has_focus = !!focus?.value?.value?.x;

    const graphNode = {
      "id": link.id,
      "from_id": link.from_id,
      "to_id": link.to_id,
      "type_id": link.type_id,
      "name": (_name ? `${_name}` : undefined),
      "type": (_type ? `${_type}` : undefined),
      "idstring": `${link.id}`,
      position: has_focus ? focus?.value?.value : {},
      focused: !!focus,
    };

    graphData.nodes.push(graphNode);
  }
  console.log(graphData.nodes);
  const linkIds = links.map((link) => (link.id));
  const linkTypeIds = links.map((link) => (link.type_id));
  const spaceTypes = links.filter((link) => (link.type_id === 1)).map((link) => link.id);
  const typedLinks = links.filter((link) => (spaceTypes.includes(link.type_id)));
  console.log({ spaceTypes })
  console.log({ typedLinks })

  const typedEdges = typedLinks.map((l) => ({ "source": l.id, "target": l.type_id, "type": "type" }));

  const edges = links.filter((l) =>
  ((l.to_id && l.from_id !== 0) &&
    (linkIds.includes(l.to_id) &&
      linkIds.includes(l.from_id)))).map((l) =>
        [{ "source": l.from_id, "target": l.id, "type": "from" }, { "source": l.id, "target": l.to_id, "type": "to" }]
      ).flat();


  edges.push(...typedEdges);

  graphData.edges = edges;
  console.log(graphData);
  return graphData;
}