import { useMemo } from "react";

export interface RFGData {
  nodes: RFGNodeObject[];
  links: RFGLinkObject[];
}

export type RFGNodeObject = object & {
  id?: string | number;
  x?: number;
  y?: number;
  z?: number;
  vx?: number;
  vy?: number;
  vz?: number;
  fx?: number;
  fy?: number;
  fz?: number;
};


type RFGLinkObject = object & {
  source?: string | number | RFGNodeObject;
  target?: string | number | RFGNodeObject;
};

export function reactForceGraphData(
  
): RFGData {
  return useMemo(() => {
    return { nodes: [], links: [] };
  }, []);
}
