import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button } from '@chakra-ui/react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, MinilinksInstance, MinilinksResult } from '@deep-foundation/deeplinks/imports/minilinks';
import { delay } from '@deep-foundation/deeplinks/imports/promise';
import { useLocalStore } from '@deep-foundation/store/local';
import { useCallback, useRef } from 'react';
import { useCytoEditor } from './cyto-graph-hooks';
import { EditorGrid } from './editor/editor-grid';
import { CloseButton, EditorTabs } from './editor/editor-tabs';
import { EditorTextArea } from './editor/editor-textarea';

export interface EditorTab {
  id: number;
  title: string;
  saved: boolean;
  active?: boolean;
  loading?: boolean;
  value?: string;
}

export function useEditorTabs() {
  const [tabs, setTabs] = useLocalStore<EditorTab[]>('editor-tabs', []);
  const [tab, setTab] = useLocalStore<number>('editor-tab', 0);
  const [values, setValues] = useLocalStore<any>('editor-values', {});
  const tabsRef = useRef<any>();
  tabsRef.current = tabs;
  const valuesRef = useRef<any>();
  valuesRef.current = values;
  return {
    tabs,
    addTab: useCallback((tab) => {
      if (!tabsRef.current.find((t) => t.id === tab.id)) {
        setTabs([...tabsRef.current, tab]);
        setValues({ ...valuesRef.current, [tab.id]: tab.value });
      }
    }, []),
    closeTab: useCallback((id) => {
      setTabs(tabsRef.current.filter((tab) => tab.id !== id));
      setValues({ ...valuesRef.current, [id]: undefined });
    }, []),
    tabId: tab,
    tab: tabs.find((t) => +t.id === +tab),
    activeTab: useCallback((id) => {
      setTab(id);
    }, []),
    setTab: useCallback((tab) => {
      setTabs(tabsRef.current.map((t) => (t.id === tab.id ? tab : t)));
    }, []),
    value: values[tab],
    setValue: useCallback((id, value) => {
      setValues({ ...valuesRef.current, [id]: value });
    }, []),
  };
}

export function CytoEditor({
  ml
}: {
  ml: MinilinksResult<Link<number>>;
}) {
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const onClose = useCallback(() => {
    setCytoEditor(false);
  }, []);
  const deep = useDeep();

  const {
    tab,
    tabs,
    closeTab,
    setTab,
    activeTab,
    tabId,
    value,
    setValue
  } = useEditorTabs();

  return <>
    <Modal isOpen={cytoEditor} onClose={onClose} size='full'>
      <ModalOverlay />
      <ModalContent style={{ height: '100%' }}>
        <EditorGrid
          editorTextAreaElement={<>{[<EditorTextArea
            key={tabId}
            value={value}
            onChange={(value) => {
              setValue(tabId, value);
              setTab({ ...tab, saved: tab.value === value });
            }}
            onSave={async (value) => {
              const type = typeof(ml.byId[tab.id]?.value?.value);
              setTab({ ...tab, loading: true, saved: false });
              console.log('onSave', { link_id: { _eq: tab.id } }, {
                value: type === 'string' ? value : type === 'number' ? parseFloat(value) : type === 'object' ? JSON.parse(value) : undefined,
              }, {
                table: `${type}s`,
              });
              if (type !== 'undefined') {
                await deep.update({ link_id: { _eq: tab.id } }, {
                  value: type === 'string' ? value : type === 'number' ? parseFloat(value) : type === 'object' ? JSON.parse(value) : undefined,
                }, {
                  table: `${type}s`,
                });
                setTab({ ...tab, value, loading: false, saved: true });
              } else {
                setTab({ ...tab, value, loading: false, saved: false });
              }
            }}
          />]}</>}
          editorTabsElement={<EditorTabs tabs={tabs.map((tab) => ({
            ...tab,
            active: tabId === tab.id,
          }))} onClose={(tab) => {
            if (tabs.length === 1 && tabs[0]?.id === tab.id) onClose();
            closeTab(tab.id);
          }} onClick={tab => activeTab(tab.id)} />}
          closeButtonElement={<CloseButton onClick={onClose}/>}
        />
      </ModalContent>
    </Modal>
  </>;
}