import dynamic from 'next/dynamic';
import React from 'react';

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

  function handleEditorDidMount(editor, monaco) {
    editor.getModel().updateOptions({ tabSize: 2 });
  }

  return (<MonacoEditor
      options={monacoEditorOptions}
      height="100%"
      width="100%"
      theme="vs-dark"
      defaultLanguage="javascript"
      defaultValue={value}
      onChange={onChange}
      onMount={handleEditorDidMount}
    />
  )
})