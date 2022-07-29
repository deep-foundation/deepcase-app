
import { Link, useMinilinksConstruct, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { ConnectionController } from '.';
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto/types';
import { MessageTextArea } from '../imports/cyto-message-textarea';
import { CytoReactMessage } from '../imports/cyto-react-message';
import { DeepLoader } from '../imports/loader';
import { Provider } from '../imports/provider';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto/graph').then((m) => m.default),
  { ssr: false }
);

export default function Page() {
  // const [spaceId, setSpaceId] = useSpaceId();
  const spaceId = 234;
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;

  return (<>
    <Provider chakra>
      <ColorModeSwitcher/>
      <CytoReactMessage />
      <MessageTextArea />
    </Provider>
  </>);
}