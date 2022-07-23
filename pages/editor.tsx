
import { useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { ConnectionController } from '.';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto-graph-props';
import { EditorGrid } from '../imports/editor/editor-grid';
import { EditorTextArea } from '../imports/editor/editor-textarea';
import { EditorTabs } from '../imports/editor/editor-tabs';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';
import { Box, ChakraProvider } from '../imports/framework';
import themeChakra from '../imports/theme/theme';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto-graph-react').then((m) => m.default),
  { ssr: false }
);

const tabs = [
  {
    id: 1,
    title: 123,
    saved: true,
    onClick: () => console.log(1),
    onClose: () => console.log(1),
  },
  {
    id: 2,
    title: 456,
    saved: true,
    onClick: () => console.log(2),
    onClose: () => console.log(2),
  },
  {
    id: 3,
    title: 789,
    saved: true,
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
    saved: true,
    onClick: () => console.log(5),
    onClose: () => console.log(5),
  },
];

export default function Page() {
  // const [spaceId, setSpaceId] = useSpaceId();
  const spaceId = 234;
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;

  return (<>
    <ChakraProvider theme={themeChakra}>
      <>
        
        <ColorModeSwitcher/>
        <Box h='5rem' />
        <Box pos='relative' width='100%' height='80vh'>
          <EditorGrid editorTextAreaElement={<EditorTextArea />} editorTabsElement={<EditorTabs tabs={tabs} />} />
        </Box>
      </>
    </ChakraProvider>
  </>);
}