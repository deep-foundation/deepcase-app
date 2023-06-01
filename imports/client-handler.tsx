import * as chakra from '@chakra-ui/react';
import * as icons from '@chakra-ui/icons';
import dynamic from 'next/dynamic';
import { DeepClient, useDeep, useDeepSubscription } from "@deep-foundation/deeplinks/imports/client";
import { evalClientHandler as deepclientEvalClientHandler } from '@deep-foundation/deeplinks/imports/client-handler';
import { useMinilinksFilter } from "@deep-foundation/deeplinks/imports/minilinks";
import * as axios from 'axios';
import * as axiosHooks from 'axios-hooks';
import * as classnames from 'classnames';
import React, { useCallback, useEffect, useRef, PropsWithChildren } from 'react';
// import * as reacticons from 'react-icons';
import * as motion from 'framer-motion';
import Linkify from 'react-linkify';
import * as reactHotkeysHook from 'react-hotkeys-hook';
import * as debounce from '@react-hook/debounce';
import * as json5 from 'json5';
import * as bs from 'react-icons/bs';
import * as fi from 'react-icons/fi';
import * as tb from 'react-icons/tb';
import * as ci from 'react-icons/ci';
import * as editor from 'slate';
import * as slate from 'slate-react';
import SoftBreak from 'slate-soft-break';
import { slateToHtml, htmlToSlate } from 'slate-serializers';
import isHotkey from 'is-hotkey';
import Resizable from 're-resizable';
import { useContainer, useSpaceId } from './hooks';
import { CytoEditorPreview } from './cyto/editor-preview';
import { CustomizableIcon } from './icons-provider';
import { EditorTextArea } from './editor/editor-textarea';
import { BubbleArrowLeft } from './svg/bubble-arrow-left';
import { CytoReactLinkAvatar } from './cyto-react-avatar';
import { DeepWysiwyg, BlockButton, MarkButton, useStringSaver } from './deep-wysiwyg';
import { Resize } from './resize';
const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });


const r = (path) => {
  if (r.list[path]) return r.list[path];
  throw new Error(`Module not found: Can't resolve ${path}`);
};
r.list = {
  '@chakra-ui/react': chakra,
  'react': React,
  'axios': axios,
  'axios-hooks': axiosHooks,
  'classnames': classnames,
  'slate-soft-break': SoftBreak,
  'slate-serializers': {slateToHtml, htmlToSlate},
  'react-hotkeys-hook': reactHotkeysHook,
  '@react-hook/debounce': debounce,
  'json5': json5,
  'framer-motion': motion,
  'slate': editor,
  'slate-react': slate,
  'is-hotkey': isHotkey,
  're-resizable': Resizable,
  '@monaco-editor/react': MonacoEditor,
  '@chakra-ui/icons': icons,
  '@deep-foundation/deepcase': {
    useContainer,
    useSpaceId,
    CytoEditorPreview,
    CustomizableIcon,
    Resize,
    EditorTextArea,
    ClientHandler,
    BubbleArrowLeft,
    CytoReactLinkAvatar,
    DeepWysiwyg,
    useStringSaver,
    BlockButton,
    MarkButton,
  },
  'react-icons/bs': bs,
  'react-icons/fi': fi,
  'react-icons/ci': ci,
  'react-icons/tb': tb,
  'react-linkify': Linkify,
};

export async function evalClientHandler({
  value,
  deep,
  input = {},
}: {
  value: string;
  deep: DeepClient;
  input?: any;
}): Promise<{
  error?: any;
  data?: any;
}> {
  return await deepclientEvalClientHandler({
    value, deep, input: {
      require: r,
      ...input,
    },
  });
}

export interface ClientHandlerRendererProps {
  Component: any;
  fillSize?: boolean;
  onClose?: () => any;
  [key: string]: any;
};

export function ClientHandlerRenderer({
  Component,
  fillSize = false,
  onClose,
  ...props
}: ClientHandlerRendererProps) {
  return <>{typeof(Component) === 'function' && <Component
    onClose={onClose}
    fillSize={fillSize}
    {...props}
    style={{
      ...(fillSize ? { width: '100%', height: '100%' } : {}),
      ...props?.style,
    }}
  />}</>;
}

export interface ClientHandlerProps extends Partial<ClientHandlerRendererProps> {
  handlerId: number;
  linkId: number;
  ml: any;
  onClose?: () => any,
}

export function ClientHandler({
  handlerId,
  linkId,
  ml,
  onClose,
  fillSize,
  ...props
}: ClientHandlerProps) {
  const deep = useDeep();
  const { data: files } = useDeepSubscription({
    in: {
      id: handlerId
    },
  });
  const file = files?.[0];

  const [Component, setComponent] = React.useState<any>(null);

  const lastEvalRef = useRef(0);
  useEffect(() => {
    const value = file?.value?.value;
    console.log('ClientHandler evalClientHandler', { file, value });
    if (!value) {
      return;
    }
    const evalId = ++lastEvalRef.current;
    evalClientHandler({ value, deep }).then(({ data, error }) => {
      if (evalId === lastEvalRef.current) {
        console.log('ClientHandler evalClientHandler setComponent', { file, data, error });
        if (!error) setComponent(() => data);
        else setComponent(undefined);
      } else {
        console.log('ClientHandler evalClientHandler outdated', { file, data, error, evalId, 'lastEvalRef.current': lastEvalRef.current });
      }
    });
  }, [file?.value?.value]);

  return (<>
    {(typeof(Component) === 'function')
    ? <>{[<ClientHandlerRenderer key={Component.toString()} Component={Component} {...props} fillSize={fillSize} link={ml.byId[linkId]} ml={ml} onClose={onClose}/>]}</>
    : <div>
        
      </div>}
  </>);
}
