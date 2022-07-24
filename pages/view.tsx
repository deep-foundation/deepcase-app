import { useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto-graph-props';
import { EditorGrid } from '../imports/editor/editor-grid';
import { EditorHandlers } from '../imports/editor/editor-handlers';
import { EditorHandler } from '../imports/editor/editor-handler';
import { CloseButton, EditorTabs } from '../imports/editor/editor-tabs';
import { EditorTextArea } from '../imports/editor/editor-textarea';
import { Box, ChakraProvider } from '../imports/framework';
import themeChakra from '../imports/theme/theme';
import { CytoReactLinkAvatar } from '../imports/cyto-react-avatar';
import { useState } from 'react';
import { EditorComponentView } from '../imports/editor/editor-component-view';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto-graph-react').then((m) => m.default),
  { ssr: false }
);

const tabs = [
  {
    id: 1,
    title: 'много букв',
    saved: true,
    onClick: () => console.log(1),
    onClose: () => console.log(1),
  },
  {
    id: 2,
    title: 456,
    saved: false,
    active: true,
    onClick: () => console.log(2),
    onClose: () => console.log(2),
  },
  {
    id: 3,
    title: 'буква',
    saved: true,
    loading: true,
    onClick: () => console.log(3),
    onClose: () => console.log(3),
  },
  {
    id: 4,
    title: 423,
    saved: true,
    onClick: () => console.log(4),
    onClose: () => console.log(4),
  },
  {
    id: 5,
    title: 523,
    saved: false,
    onClick: () => console.log(5),
    onClose: () => console.log(5),
  },
];

const reasons = [
  {
    id: 1,
    name: 'selector',
  },
  {
    id: 2,
    name: 'route',
  },
  {
    id: 3,
    name: 'schedule',
  },
  {
    id: 4,
    name: 'sync',
  },
];

const handlers = [
  {
    id: 1,

  },
];

export default function Page() {
  // const [spaceId, setSpaceId] = useSpaceId();
  const spaceId = 234;
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;
  const [viewSize, setViewSize] = useState({width: 124, height: 123});

  return (<>
    <ChakraProvider theme={themeChakra}>
      <>
        <ColorModeSwitcher/>
        <Box h='5rem' />
        <Box pos='relative' width='100%' height='80vh'>
          <EditorComponentView 
            defaultSize={viewSize}
            viewSize={viewSize} 
            onChangeSize={() => {
              setViewSize(viewSize)
              console.log(viewSize)
            }} />
        </Box>
      </>
    </ChakraProvider>
  </>);
}