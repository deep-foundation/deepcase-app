import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button } from '@chakra-ui/react';
import { useCallback } from 'react';
import { useCytoEditor } from './cyto-graph-hooks';
import { EditorGrid } from './editor/editor-grid';
import { EditorTextArea } from './editor/editor-textarea';

export function CytoEditor() {
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const onClose = useCallback(() => {
    setCytoEditor(false);
  }, []);

  return <>
    <Modal isOpen={cytoEditor} onClose={onClose} size='full'>
      <ModalOverlay />
      <ModalContent style={{ height: '100%' }}>
        <EditorGrid editorTextAreaElement={<EditorTextArea />} />
      </ModalContent>
    </Modal>
  </>;
}