import dynamic from 'next/dynamic';
import { DeepClient, useDeep, useDeepId, useDeepSubscription } from "@deep-foundation/deeplinks/imports/client";
import { evalClientHandler as deepclientEvalClientHandler } from '@deep-foundation/deeplinks/imports/client-handler';
import React, { useCallback, useEffect, useRef, PropsWithChildren, useState, useMemo } from 'react';
import { CatchErrors } from './react-errors';
import { evalClientHandler, r } from './client-handler';
import { useDebounceCallback } from '@react-hook/debounce';
import { useCytoHandlersSwitch, useInsertingCytoStore } from './hooks';
import { useCytoHandlersRules } from './cyto/hooks';
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });

export interface CytoHandlerRendererProps {
  Component: any;
  onClose?: () => any;
  [key: string]: any;
};

export interface CytoHandlerProps extends Partial<CytoHandlerRendererProps> {
  linkId: number;
  handlerId?: number;
  onChange?: (id: number, handled?: {
    handlerId?: number;
    error?: any;
    elements?: any[];
    stylesheets?: any[];
  }) => void;
  elementsById: { [key: string]: any };
  cy?: any;
  HandleCyto?: number;
}

export function useCytoHandlers() {
  const ref = useRef({});
  const drawedCytoHandlers = useRef({});
  const [iterator, setIterator] = useState(0);
  const onChangeDebounce = useDebounceCallback(() => {
    setIterator(i => i + 1);
  }, 300);
  const onChange = useCallback((id, r) => {
    if (!r) {
      delete ref.current[id];
      onChangeDebounce();
    } else if (!r.error) {
      ref.current[id] = r;
      onChangeDebounce();
    }
  }, []);
  return { cytoHandlersRef: ref, drawedCytoHandlers, iterator, setIterator, onChange };
}

export function useCytoHandlersApply(cyh, elements, stylesheets, iterator) {
  const [cytoHandlers, setCytoHandlers] = useCytoHandlersSwitch();
  const deep = useDeep();
  const [chr, setChr] = useCytoHandlersRules();
  const { data: HandleCyto } = useDeepId('@deep-foundation/handle-cyto', 'HandleCyto');

  cyh.drawedCytoHandlers.current = {};
  const addElements = [];
  const stylesheetsByHandler = {};
  if (cytoHandlers) {
    for (let key in cyh?.cytoHandlersRef?.current) {
      const el = cyh?.cytoHandlersRef?.current[key];
      const cyHandle = deep.minilinks?.byType[HandleCyto]?.find(l => l.from_id === deep.minilinks.byId?.[key]?.type_id);
      if (el && chr[cyHandle?.id]) {
        cyh.drawedCytoHandlers.current[key] = el;
        addElements.push(...el.elements || []);
        stylesheetsByHandler[el?.handlerId] = el.stylesheets || [];
      }
    }
    elements.push(...addElements);
    for (let key in stylesheetsByHandler) {
      stylesheets.push(...stylesheetsByHandler[key]);
    }
  }
}

export function CytoHandlers({
  onChange,
  handled,
  elementsById,
  cy,
}: {
  onChange: (id: number, result: any) => void;
  handled: { [key: string]: number };
  elementsById: { [key: string]: any };
  cy?: any;
}) {
  const { data: HandleCyto } = useDeepId('@deep-foundation/handle-cyto', 'HandleCyto');
  const arr = [];
  for (let key in handled) {
    arr.push(<CytoHandler
      key={+key}
      linkId={+key} handlerId={handled[key]}
      onChange={onChange}
      elementsById={elementsById}
      HandleCyto={HandleCyto}
    />);
  }
  return <>
    {HandleCyto ? arr : []}
  </>;
}

export const CytoHandler = React.memo(function CytoHandler({
  linkId,
  handlerId,
  onChange,
  elementsById,
  cy,
  HandleCyto,
  ...props
}: CytoHandlerProps) {
  const deep = useDeep();
  const ml = deep?.minilinks;
  const [file] = deep.useMinilinksSubscription({
    in: {
      type_id: deep.idLocal('@deep-foundation/core', 'Handler'),
      in: {
        type_id: HandleCyto,
        from_id: ml.byId[linkId].type_id,
      },
    },
  });

  const [Component, setComponent] = React.useState<any>(null);
  const lastEvalRef = useRef(0);
  useEffect(() => {
    const value = file?.value?.value;
    console.log('CytoHandler evalClientHandler', { file, value });
    if (!value) {
      return;
    }
    const evalId = ++lastEvalRef.current;
    evalClientHandler({ value, deep }).then(({ data, error }) => {
      if (evalId === lastEvalRef.current) {
        console.log('CytoHandler evalClientHandler setComponent', { file, data, error });
        if (!error) setComponent(() => data);
        else setComponent(undefined);
      } else {
        console.log('CytoHandler evalClientHandler outdated', { file, data, error, evalId, 'lastEvalRef.current': lastEvalRef.current });
      }
    });

    return () => {
      onChange(linkId);
    };
  }, [file?.value?.value]);

  try {
    const r = Component ? Component({ link: ml.byId[linkId], elementsById, cy, ...props }) : {};
    onChange(linkId, { ...r, handlerId });
  } catch(error) {
    onChange(linkId, { error, handlerId })
  }

  return <></>;
}, () => true);
