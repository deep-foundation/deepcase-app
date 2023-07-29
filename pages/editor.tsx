import { useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { ColorModeSwitcher } from '@deep-foundation/deepcase/imports/color-mode-toggle';
import { CytoGraphProps } from '@deep-foundation/deepcase/imports/cyto/types';
import { EditorGrid } from '@deep-foundation/deepcase/imports/editor/editor-grid';
import { EditorHandlers } from '@deep-foundation/deepcase/imports/editor/editor-handlers';
import { EditorHandler } from '@deep-foundation/deepcase/imports/editor/editor-handler';
import { CloseButton, EditorTabs } from '@deep-foundation/deepcase/imports/editor/editor-tabs';
import { EditorTextArea } from '@deep-foundation/deepcase/imports/editor/editor-textarea';
import { Box, ChakraProvider } from '@chakra-ui/react';
import themeChakra from '@deep-foundation/deepcase/imports/theme/theme';
import { CytoReactLinkAvatar } from '@deep-foundation/deepcase/imports/cyto-react-avatar';
import { useState } from 'react';
import { EditorSwitcher } from '@deep-foundation/deepcase/imports/editor/editor-switcher';
import { EditorComponentView } from '@deep-foundation/deepcase/imports/editor/editor-component-view';

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
  const [rightArea, setRightArea] = useState('preview');
  const [viewSize, setViewSize] = useState({width: 124, height: 123});
  const [selectedTab, setSelectedTab] = useState(tabs[0]);

  return (<>
    <ChakraProvider theme={themeChakra}>
      <>
        <ColorModeSwitcher/>
        <Box h='5rem' />
        <Box pos='relative' width='100%' height='80vh'>
          {/* <EditorGrid 
            editorTextAreaElement={<EditorTextArea />} 
            editorTabsElement={<EditorTabs
              tabs={tabs}
              onClick={(tab) => setSelectedTab(tab)}
              onClose={(tab) => console.log(tab)}
            />}
            closeButtonElement={<CloseButton />} 
            editorRight={
              rightArea === 'handlers' && <EditorHandlers>
                <EditorHandler 
                  reasons={reasons} 
                  avatarElement={<CytoReactLinkAvatar emoji='💥' />}
                  title='first'
                  sync={sync}
                  onChangeSync={() => setSync(!sync)}
                >123</EditorHandler>
              </EditorHandlers> ||
              rightArea === 'preview' && <Box pos='relative'><EditorComponentView
                size={viewSize}
                onChangeSize={(viewSize) => setViewSize(viewSize)}
              /></Box>
            }
            editorRightSwitch={<EditorSwitcher setArea={(rightArea) => {
              setRightArea(rightArea);
            }} />}
          /> */}
        </Box>
      </>
    </ChakraProvider>
  </>);
}