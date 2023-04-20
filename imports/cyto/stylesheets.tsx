import { useColorModeValue } from '@chakra-ui/react';
import { useMemo } from 'react';
import { useChackraColor, useChackraGlobal } from '../get-color';
import { useInsertingCytoStore } from '../hooks';

export function useCytoStylesheets(): any {
  const globalStyle = useChackraGlobal();
  const textColor = useChackraColor(globalStyle.body.color);
  const gray900 = useChackraColor('gray.900');
  const blue500 = useChackraColor('blue.500');
  const gray500 = useChackraColor('gray.500');
  const white = useChackraColor('white');
  const colorClicked = useChackraColor('primary');
  const colorBgInsertNode = useColorModeValue(white, gray900);
  const colorFocus = blue500;

  const [insertingCyto, setInsertingCyto] = useInsertingCytoStore();

  const stylesheets = useMemo(() => ([
    {
      selector: 'node',
      style: {
        'background-opacity': 0,
      },
    },
    {
      selector: '.file',
      style: {
        color: textColor,
        width: 30,
        height: 30,
        'font-size': 16,
        'text-margin-y': 23, // -4
        'text-margin-x': -2,
        label: 'data(label)',
        "text-wrap": "wrap",
        // 'background-image': 'https://live.staticflickr.com/3063/2751740612_af11fb090b_b.jpg',
        'background-fit': 'cover',
        'background-opacity': 1,
        'background-color': '#fff',
      }
    },
    {
      selector: '.link-node',
      style: {
        color: textColor,
        width: 30,
        height: 30,
        'font-size': 16,
        'text-margin-y': 23, // -4
        'text-margin-x': -2,
        label: 'data(label)',
        "text-wrap": "wrap",
        // 'background-image': 'https://live.staticflickr.com/3063/2751740612_af11fb090b_b.jpg',
        'background-fit': 'cover',
        'background-opacity': 1,
        'background-color': '#fff',
      }
    },
    {
      selector: '.link-disabled',
      style: {
        opacity: 0.5,
      }
    },
    {
      selector: '.link-node.hover:not(.unhoverable)',
      style: {
        'z-compound-depth': 'top',
        'overlay-opacity': 0,
        // @ts-ignore
        'underlay-opacity': 0.8,
        'underlay-padding': 2,
        'underlay-color': '#0080ff',
        'underlay-shape': 'ellipse',
      }
    },
    {
      selector: '.link-from-to-not-contain',
      style: {
        'target-arrow-shape': 'triangle-tee',
      }
    },
    {
      selector: '.link-to',
      style: {
        'target-arrow-shape': 'triangle',
      }
    },
    {
      selector: '.link-from',
      style: {
        'target-arrow-shape': 'tee',
      }
    },
    {
      selector: '.link-type',
      style: {
        'target-arrow-shape': 'triangle',
        'line-style': 'dashed',
        'line-dash-pattern': [5, 5]
      }
    },
    {
      selector: 'edge',
      style: {
        width: 1,
        'curve-style': 'bezier',
        'target-distance-from-node': 8,
        'source-distance-from-node': 1,
      }
    },
    {
      selector: '.eh-ghost-edge,edge.eh-preview',
      style: {
        'width': 2,
        'line-color': colorClicked,
        'target-arrow-color': colorClicked,
        'source-arrow-color': colorClicked,
      },
    },
    {
      selector: '.query-link-node',
      style: {
        color: textColor,
        'background-color': colorBgInsertNode,
        'border-color': textColor,
        'border-width': 1,
        'border-style': 'solid',
        width: 16,
        height: 16,
        'font-size': 16,
        'text-margin-y': -4,
      }
    },
    {
      selector: '.query-link-from-node',
      style: {
        color: textColor,
        'background-color': colorBgInsertNode,
        'border-color': textColor,
        'border-width': 1,
        'border-style': 'solid',
        width: 8,
        height: 8,
        'font-size': 16,
        'text-margin-y': -4,
      }
    },
    {
      selector: '.query-link-to-node',
      style: {
        color: textColor,
        'background-color': colorBgInsertNode,
        'border-color': textColor,
        'border-width': 1,
        'border-style': 'solid',
        width: 8,
        height: 8,
        'font-size': 16,
        'text-margin-y': -4,
      }
    },
    {
      selector: '.query-link-type-node',
      style: {
        color: textColor,
        'background-color': colorBgInsertNode,
        'border-color': textColor,
        'border-width': 1,
        'border-style': 'solid',
        width: 8,
        height: 8,
        'font-size': 16,
        'text-margin-y': -4,
      }
    },
    {
      selector: '.query-link-in-node',
      style: {
        color: textColor,
        'background-color': colorBgInsertNode,
        'border-color': textColor,
        'border-width': 1,
        'border-style': 'solid',
        width: 8,
        height: 8,
        'font-size': 16,
        'text-margin-y': -4,
      }
    },
    {
      selector: '.query-link-out-node',
      style: {
        color: textColor,
        'background-color': colorBgInsertNode,
        'border-color': textColor,
        'border-width': 1,
        'border-style': 'solid',
        width: 8,
        height: 8,
        'font-size': 16,
        'text-margin-y': -4,
      }
    },
    {
      selector: '.query-link-out-edge',
      style: {
        'target-arrow-shape': 'tee',
      }
    },
    {
      selector: '.query-link-from-edge',
      style: {
        'target-arrow-shape': 'tee',
      }
    },
    {
      selector: '.query-link-in-edge',
      style: {
        'target-arrow-shape': 'triangle',
      }
    },
    {
      selector: '.query-link-to-edge',
      style: {
        'target-arrow-shape': 'triangle',
      }
    },
    {
      selector: '.query-link-type-edge',
      style: {
        'target-arrow-shape': 'triangle',
        'line-style': 'dashed',
        'line-dash-pattern': [5, 5],
      }
    },
    {
      selector: '.link-from.focused, .link-to.focused, .link-type.focused',
      style: {
        'width': 2,
        'line-color': colorFocus,
      }
    },
    {
      selector: '.link-node.focused',
      style: {
        'border-width': 4,
        'border-color': colorFocus,
      }
    },
    // {
    //   selector: '.link-from.clicked, .link-to.clicked, .link-type.clicked',
    //   style: {
    //     'line-color': colorClicked,
    //     'target-arrow-color': colorClicked,
    //     width: 2,
    //   }
    // },
    // {
    //   selector: '.link-node.clicked',
    //   style: {
    //     color: colorClicked,
    //     'background-color': colorClicked, 
    //   }
    // },
    {
      selector: ':parent',
      style: {
        'background-color': gray500,
        'background-opacity': 0.1,
        'border-width': 0,
        label: '',
      }
    },
    {
      selector: '.query-compound-connector',
      style: {
        width: 1,
        'curve-style': 'bezier',
        'target-distance-from-node': 0,
        'source-distance-from-node': 0,
        'line-style': 'dashed',
        'line-dash-pattern': [1, 5]
      },
    },
  ]), [globalStyle, textColor, gray900, blue500, white, colorClicked, colorBgInsertNode, colorFocus]);

  return stylesheets;
}
