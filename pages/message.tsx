
import { useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { MessageTextArea } from '../imports/cyto-message-textarea';
import { CytoReactMessage } from '../imports/cyto-react-message';
import { CytoGraphProps } from '../imports/cyto/types';
import { Provider } from '../imports/provider';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto/graph').then((m) => m.default),
  { ssr: false }
);

export default function Page() {
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;

  return (<>
    <Provider><>
      <ColorModeSwitcher/>
      <CytoReactMessage />
      <MessageTextArea />
    </></Provider>
  </>);
}