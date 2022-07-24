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

const tabs = [
  {
    id: 1,
    title: 'много букв',
    saved: true,
  },
  {
    id: 2,
    title: 456,
    saved: false,
    active: true,
  },
  {
    id: 3,
    title: 'буква',
    saved: true,
    loading: true,
  },
  {
    id: 4,
    title: 423,
    saved: true,
  },
  {
    id: 5,
    title: 523,
    saved: false,
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
  const [sync, setSync] = useState(false);

  return (<>
    <ChakraProvider theme={themeChakra}>
      <>
        <ColorModeSwitcher/>
        <Box h='5rem' />
        <Box pos='relative' width='100%' height='80vh'>
          <EditorGrid 
            editorTextAreaElement={<EditorTextArea />} 
            editorTabsElement={<EditorTabs
              tabs={tabs}
              onClick={(tab) => console.log(tab)}
              onClose={(tab) => console.log(tab)}
            />}
            closeButtonElement={<CloseButton />} 
            editorRight={<EditorHandlers>
              <EditorHandler 
                reasons={reasons} 
                avatarElement={<CytoReactLinkAvatar emoji='💥' />}
                title='first'
                sync={sync}
                onChangeSync={() => setSync(!sync)}
              >123</EditorHandler>
            </EditorHandlers>}
          />
        </Box>
      </>
    </ChakraProvider>
  </>);
}