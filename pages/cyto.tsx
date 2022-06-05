
import { Provider } from '../imports/provider';
import React, { useState } from 'react';
import dynamic from "next/dynamic";
import { DeepLoader } from '../imports/loader';
import { useSpaceId } from '../imports/gui';
import { Link, useMinilinksConstruct } from '@deep-foundation/deeplinks/imports/minilinks';
import { ConnectionController } from '.';
import { CytoGraphProps } from '../imports/cyto-graph-props';

const CytoGraph = dynamic<CytoGraphProps>(
  () => import('../imports/cyto-graph').then((m) => m.default),
  { ssr: false }
);

export default function Page() {
  // const [spaceId, setSpaceId] = useSpaceId();
  const spaceId = 352;
  const minilinks = useMinilinksConstruct();
  const { ref: mlRef, ml } = minilinks;
  const [links, setLinks] = useState<Link<number>[]>(ml.links);

  console.log({ ml, spaceId });

  return (<>
    <Provider>
      <ConnectionController>
        {[<DeepLoader
          key={spaceId}
          spaceId={spaceId}

          minilinks={minilinks}

          onChange={() => {
            setLinks(ml.links);
          }}

          // onUpdateScreenQuery={query => console.log('updateScreenQuery', query)}
        />]}
        <CytoGraph links={links} ml={ml}/>
      </ConnectionController>
    </Provider>
  </>);
}