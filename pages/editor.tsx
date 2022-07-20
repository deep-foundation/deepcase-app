
import { useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { ConnectionController } from '.';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto-graph-props';
import { EditorGrid } from '../imports/editor/editor-grid';
import { EditorTextArea } from '../imports/editor/editor-textarea';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto-graph-react').then((m) => m.default),
  { ssr: false }
);

export default function Page() {
  // const [spaceId, setSpaceId] = useSpaceId();
  const spaceId = 234;
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;

  return (<>
    <Provider chakra>
      <ConnectionController>
        {[<DeepLoader
          key={spaceId}
          spaceId={spaceId}
          minilinks={minilinks}
          // onUpdateScreenQuery={query => console.log('updateScreenQuery', query)}
          />]}
        <ColorModeSwitcher/>
        <EditorGrid editorTextAreaElement={<EditorTextArea />} />
      </ConnectionController>
    </Provider>
  </>);
}