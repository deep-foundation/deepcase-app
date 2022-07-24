import dynamic from 'next/dynamic';
import React from 'react';
import { useColorMode } from '../framework';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });

const monacoEditorOptions = {
  wordWrap: true,
}

interface IEditor {
  value?: '';
  onChange?: (value: string) => void;
  onSave?: (value: string) => void;
}

export const EditorTextArea = React.memo<any>(({
  value, 
  onChange,
  onSave,
}:IEditor) => {
  const refValue = React.useRef(value);
  refValue.current = value;

  const { colorMode } = useColorMode();
  function handleEditorDidMount(editor, monaco) {
    editor.getModel().updateOptions({ tabSize: 2 });
    editor.addAction({
      id: "save",
      label: "Save",
      keybindings: [monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS],
      contextMenuGroupId: "save",
      run: () => {
        onSave && onSave(refValue.current);
      },
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