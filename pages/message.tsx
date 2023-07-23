
import { useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { ColorModeSwitcher } from '@deep-foundation/deepcase/imports/color-mode-toggle';
import { MessageTextArea } from '@deep-foundation/deepcase/imports/cyto-message-textarea';
import { CytoReactMessage } from '@deep-foundation/deepcase/imports/cyto-react-message';
import { CytoGraphProps } from '@deep-foundation/deepcase/imports/cyto/types';
import { Provider } from '@deep-foundation/deepcase/imports/provider';

// const CytoGraph = dynamic<CytoGraphProps>(
//   () => import('@deep-foundation/deepcase/imports/cyto/graph').then((m) => m.default),
//   { ssr: false }
// );

export default function Page() {
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;

  return (<>
    <Provider><>
      <ColorModeSwitcher/>
      {/* <CytoReactMessage /> */}
      <MessageTextArea />
    </></Provider>
  </>);
}