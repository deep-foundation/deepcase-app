import dynamic from 'next/dynamic';
import React from 'react';
import { useColorMode } from '../framework';

const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });

const monacoEditorOptions = {
  wordWrap: true,
}

interface IEditor {
  value?: '';
  onChange?: () => void;
}

export const EditorTextArea = React.memo<any>(({
  value, 
  onChange,
}:IEditor) => {

  const { colorMode, toggleColorMode } = useColorMode();
  function handleEditorDidMount(editor, monaco) {
    editor.getModel().updateOptions({ tabSize: 2 });
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
    />
  )
})