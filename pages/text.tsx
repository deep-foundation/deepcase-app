
import { Box } from '@chakra-ui/react';
import { useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import { ColorModeSwitcher } from '../imports/color-mode-toggle';
import { CytoGraphProps } from '../imports/cyto/types';
import { Example } from '../imports/popover-text/popover-text';
import { Provider } from '../imports/provider';
import { TextInput, TooltipExample } from '../imports/text-cursor-tooltip/text-cursor-tooltip';
import { elements } from './card';

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
      <Box w='100%' h='4rem' />
      <Example />
      <Box w='100%' h='10rem' />
      <TextInput />
      <TooltipExample data={elements} />
    </></Provider>
  </>);
}