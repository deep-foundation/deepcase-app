import { useColorMode } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React from 'react';
import _ from 'lodash';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });

const monacoEditorOptions = {
  wordWrap: true,
}

interface IEditor {
  refEditor?: any;
  value?: '';
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
  onClose?: () => void;
  onExit?: () => void;
  minimap?: boolean;
  lineNumbers?: string;
  defaultLanguage?: string;
  onMount?: (editor: any, monaco: any) => any;
}

export const EditorTextArea = React.memo<any>(({
  refEditor = { current: undefined },
  value, 
  onChange,
  onSave,
  onClose,
  onExit,
  minimap = true,
  lineNumbers = 'on',
  defaultLanguage="javascript",
  onMount,
}:IEditor) => {
  const refValue = React.useRef(value);
  refValue.current = value;

  const { colorMode } = useColorMode();
  function handleEditorDidMount(editor, monaco) {
    refEditor.current = { editor, monaco };
    editor.getModel().updateOptions({ tabSize: 2 });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onSave && onSave(refValue.current);
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE, () => {
        onClose && onClose();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Escape, () => {
      onExit && onExit();
    });
    onMount && onMount(editor, monaco);
  }

  return (<MonacoEditor
    options={{
      ...monacoEditorOptions,
      minimap: {
        enabled: minimap
      },
      // @ts-ignore
      lineNumbers: lineNumbers,
    }}
    height="100%"
    width="100%"
    theme={colorMode === 'light' ? 'light' : "vs-dark"}
    defaultLanguage={defaultLanguage}
    defaultValue={_.toString(value) || ''}
    onChange={onChange}
    onMount={handleEditorDidMount}
  />)
})