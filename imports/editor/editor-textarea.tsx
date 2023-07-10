import { useColorMode } from '@chakra-ui/react';
import dynamic from 'next/dynamic';
import React from 'react';
import _ from 'lodash';
import { AutoTypings, LocalStorageCache } from "monaco-editor-auto-typings";
import { OnMount } from '@monaco-editor/react';

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
  const handleEditorDidMount: OnMount = (editor, monaco) => {
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

    monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
      target: monaco.languages.typescript.ScriptTarget.ESNext,
      allowNonTsExtensions: true,
      moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
      module: monaco.languages.typescript.ModuleKind.ESNext,
      noEmit: true,
      typeRoots: ["node_modules/@types"]
    })

    monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
      noSemanticValidation: false,
      noSyntaxValidation: false,
    })
    
    const autoTypings = AutoTypings.create(editor, {
      sourceCache: new LocalStorageCache(), // Cache loaded sources in localStorage. May be omitted
      monaco: monaco,
    });
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