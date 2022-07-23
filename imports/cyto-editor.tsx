import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, CloseButton } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { useCallback, useRef } from 'react';
import { useCytoEditor } from './cyto-graph-hooks';
import { EditorGrid } from './editor/editor-grid';
import { EditorTabs } from './editor/editor-tabs';
import { EditorTextArea } from './editor/editor-textarea';

export function useEditorTabs() {
  const [tabs, setTabs] = useLocalStore<any[]>('editor-tabs', []);
  const [tab, setTab] = useLocalStore<any[]>('editor-tab', 0);
  const ref = useRef<any>();
  ref.current = tabs;
  return {
    tabs,
    addTab: useCallback((tab) => {
      if (!ref.current.find((t) => t.id === tab.id)) {
        setTabs([...ref.current, tab]);
      }
    }, []),
    closeTab: useCallback((id) => {
      setTabs(ref.current.filter((tab) => tab.id !== id));
    }, []),
    tabId: tab,
    tab: tabs.find((t) => t.id === tab),
    setTab: useCallback((id) => {
      setTab(id);
    }, []),
  };
}

export function CytoEditor() {
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const onClose = useCallback(() => {
    setCytoEditor(false);
  }, []);

  const {
    tabs,
    closeTab,
    setTab,
  } = useEditorTabs();

  return <>
    <Modal isOpen={cytoEditor} onClose={onClose} size='full'>
      <ModalOverlay />
      <ModalContent style={{ height: '100%' }}>
        <EditorGrid
          editorTextAreaElement={<EditorTextArea />}
          editorTabsElement={<EditorTabs tabs={tabs} onClose={(tab) => {
            if (tabs.length === 1 && tabs[0].id === tab.id) onClose();
            closeTab(tab.id);
          }} onClick={tab => setTab(tab)} />}
          closeButtonElement={<CloseButton onClick={onClose}/>}
        />
      </ModalContent>
    </Modal>
  </>;
}