import dynamic from 'next/dynamic';
import React from 'react';
import { useColorMode } from '@chakra-ui/react';

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
}

export const EditorTextArea = React.memo<any>(({
  refEditor = { current: undefined },
  value, 
  onChange,
  onSave,
  onClose,
  onExit,
}:IEditor) => {
  const refValue = React.useRef(value);
  refValue.current = value;

  const { colorMode } = useColorMode();
  function handleEditorDidMount(editor, monaco) {
    refEditor.current = { editor, monaco };
    editor.getModel().updateOptions({ tabSize: 2 });
    editor.addCommand([monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS], () => {
      onSave && onSave(refValue.current);
    });
    editor.addCommand([monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyE], () => {
        onClose && onClose();
    });
    editor.addCommand([monaco.KeyMod.CtrlCmd | monaco.KeyCode.Escape], () => {
      onExit && onExit();
    });
  }

  return (<MonacoEditor
    options={monacoEditorOptions}
    height="100%"
    width="100%"
    theme={colorMode === 'light' ? 'light' : "vs-dark"}
    defaultLanguage="javascript"
    defaultValue={value}
    onChange={onChange}
    onMount={handleEditorDidMount}
  />)
})