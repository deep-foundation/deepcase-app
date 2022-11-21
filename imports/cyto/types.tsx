import { Link, MinilinksResult } from '@deep-foundation/deeplinks/imports/minilinks';

export interface CytoGraphProps {
  links: Link<number>[];
  cytoViewportRef?: any;
  cyRef?: any;
};
