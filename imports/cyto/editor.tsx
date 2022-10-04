import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Box } from '@chakra-ui/react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, MinilinksInstance, MinilinksResult, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import { ClientHandlerRenderer, evalClientHandler } from '../client-handler';
import { useLocalStore } from '@deep-foundation/store/local';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useCytoEditor } from './hooks';
import { CytoReactLinkAvatar } from '../cyto-react-avatar';
import { EditorComponentView } from '../editor/editor-component-view';
import { EditorGrid } from '../editor/editor-grid';
import { EditorHandler } from '../editor/editor-handler';
import { EditorHandlers } from '../editor/editor-handlers';
import { EditorSwitcher } from '../editor/editor-switcher';
import { CloseButton, EditorTabs } from '../editor/editor-tabs';
import { EditorTextArea } from '../editor/editor-textarea';
import json5 from 'json5';
import { useDebounceCallback } from '@react-hook/debounce';
import { CatchErrors } from '../react-errors';
import { CytoEditorHandlers } from './handlers';

// global._callClientHandler = callClientHandler;
export interface EditorTab {
  id: number;
  saved: boolean;
  active?: boolean;
  loading?: boolean;
  initialValue?: string;
}

export function useEditorValueSaver(tab) {
  const [values, setValues] = useLocalStore<any>('editor-values', {});
  const tempValueRef = useRef<any>();
  const valuesRef = useRef<any>();
  valuesRef.current = values;
  const setValuesDebounced = useDebounceCallback((value) => {
    setValues(value);
  }, 500);
  return {
    valuesRef,
    tempValueRef,
    value: values[tab],
    setValue: useCallback((id, value) => {
      tempValueRef.current = { ...valuesRef.current, [id]: value };
      setValuesDebounced({ ...valuesRef.current, [id]: value });
    }, []),
  };
}

export function useEditorTabs() {
  const [tabs, setTabs] = useLocalStore<EditorTab[]>('editor-tabs', []);
  const [tab, setTab] = useLocalStore<number>('editor-tab', 0);
  const tabsRef = useRef<any>();
  tabsRef.current = tabs;
  return {
    tabs,
    addTab: useCallback((tab) => {
      if (!tabsRef.current.find((t) => t.id === tab.id)) {
        setTabs([...tabsRef.current, tab]);
      }
    }, []),
    closeTab: useCallback((id) => {
      const newTabs = tabsRef.current.filter((tab) => tab.id !== id);
      setTabs(newTabs);
      if (newTabs.length) setTab(newTabs[newTabs.length - 1].id);
      else setTab(0);
    }, []),
    tabId: tab,
    tab: tabs.find((t) => +t.id === +tab),
    activeTab: useCallback((id) => {
      setTab(id);
    }, []),
    setTab: useCallback((tab) => {
      setTabs(tabsRef.current.map((t) => (t.id === tab.id ? tab : t)));
    }, []),
    setTabs,
  };
}

const reasons = [
  {
    id: 1,
    name: 'type',
  },
  {
    id: 2,
    name: 'selector',
  },
  {
    id: 3,
    name: 'route',
  },
  {
    id: 4,
    name: 'schedule',
  },
];

export function CytoEditor({
}: {
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
    setTabs,
  } = useEditorTabs();

  const {
    tempValueRef,
    valuesRef,
    value,
    setValue,
  } = useEditorValueSaver(tabId);

  const generatedLink = useMinilinksFilter(
    deep.minilinks,
    (link) => {
      return link?.outByType[deep.idSync('@deep-foundation/core', 'GeneratedFrom')]?.[0]?.to_id === tabId;
    },
    (link, ml) => {
      return ml.byId[tabId]?.inByType[deep.idSync('@deep-foundation/core', 'GeneratedFrom')]?.[0]?.from;
    },
  )

  useEffect(() => {
    const value = generatedLink?.value?.value || tab?.initialValue;
    evalClientHandler({ value, deep }).then(({ data, error }) => {
      setComponent(() => data);
    });
  }, [tab?.initialValue, generatedLink]);

  const currentValue = valuesRef?.current?.[tabId] || tab?.initialValue || '';

  const refEditor = useRef();

  const [rightArea, setRightArea] = useState('preview');
  const [generated, setGenerated] = useState('src');
  const [fillSize, setFillSize] = useState(false);
  const [viewSize, setViewSize] = useState({width: 124, height: 123});

  const [Component, setComponent] = useState({});

  const errorRenderer = useMemo(() => {
    return (error, reset) => {
      return <div>{json5.stringify(error)}</div>
    };
  }, []);

  const focusEditor = useCallback(() => {
    // @ts-ignore
    refEditor?.current?.editor?.focus();
  }, []);

  useEffect(() => {
    import('@monaco-editor/react').then(m => {});
  }, []);

  return <>
    <Modal isOpen={cytoEditor} onClose={onClose} size='full'>
      <ModalOverlay />
      <ModalContent style={{ height: '100%' }}>
        <EditorGrid
          editorTextAreaElement={<>{[<div key={tabId}><EditorTextArea
            refEditor={refEditor}
            value={currentValue}
            onChange={(value) => {
              setValue(tabId, value);
              setTab({ ...tab, saved: tab.initialValue === value });
            }}
            onClose={() => {
              if (tabs.length === 1 && tabs[0]?.id === tab.id) onClose();
              closeTab(tabId);
              setValue(tabId, undefined);
              focusEditor();
            }}
            onSave={async (savedValue) => {
              const value = tempValueRef?.current?.[tabId] || savedValue;
              const Value = await deep.id({ in: { type_id: { _id: ['@deep-foundation/core', 'Value'] }, from: { typed: { id: { _eq: tab.id } } } } });
              const table = Value === deep.idSync('@deep-foundation/core', 'String') ? 'strings' : Value === deep.idSync('@deep-foundation/core', 'Number') ? 'numbers' : Value === deep.idSync('@deep-foundation/core', 'Object') ? 'objects' : undefined;
              const type = Value === deep.idSync('@deep-foundation/core', 'String') ? 'string' : Value === deep.idSync('@deep-foundation/core', 'Number') ? 'number' : Value === deep.idSync('@deep-foundation/core', 'Object') ? 'object' : 'undefined';

              let _value;
              try {
                _value = table === 'strings' ? value : table === 'numbers' ? parseFloat(value) : table === 'objects' ? json5.parse(value) : undefined;
              } catch(error) {}

              if (!deep.minilinks.byId[tab.id]?.value) {
                await deep.insert({ link_id: tab.id, value: _value }, {
                  table: table,
                });
                setTab({ ...tab, initialValue: value, loading: false, saved: true });
              } else if (type !== 'undefined') {
                await deep.update({ link_id: { _eq: tab.id } }, {
                  value: _value,
                }, {
                  table: `${type}s`,
                });
                setTab({ ...tab, initialValue: value, loading: false, saved: true });
              } else {
                setTab({ ...tab, initialValue: value, loading: false, saved: false });
              }
            }}
          /></div>]}</>}
          editorTabsElement={<EditorTabs
            tabs={tabs.map((tab) => ({
              ...tab,
              title: `${tab.id} ${deep.minilinks.byId[tab.id]?.inByType?.[deep.idSync('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || ''}`.trim(),
              active: tabId === tab.id,
            }))}
            setTabs={(tabs) => setTabs(tabs)}
            onClose={(tab) => {
              if (tabs.length === 1 && tabs[0]?.id === tab.id) onClose();
              closeTab(tab.id);
              setValue(tabId, undefined);
              focusEditor();
            }}
            onClick={(tab) => {
              activeTab(tab.id);
              focusEditor();
            }}
          />}
          closeButtonElement={<CloseButton onClick={onClose}/>}
          editorRight={
            // rightArea === 'handlers' && (<EditorHandlers generated={generated} setGenerated={setGenerated}>
            // <EditorHandler
            //   reasons={reasons}
            //   avatarElement={<CytoReactLinkAvatar emoji='💥' />}
            //   title='first'
            //   sync={false}
            //   onChangeSync={() => {}}
            // ></EditorHandler>
            // </EditorHandlers>) ||
            rightArea === 'handlers' && (
              <CytoEditorHandlers linkId={generated && generatedLink ? generatedLink?.id : tab.id}/>
            ) ||
            rightArea === 'preview' && <Box pos='relative'>
              <EditorComponentView
                size={viewSize}
                onChangeSize={(viewSize) => setViewSize(viewSize)}
                fillSize={fillSize}
                setFillSize={setFillSize}
              >
                {typeof(Component) === 'function' && [<CatchErrors key={Component.toString()} errorRenderer={() => <div></div>}>
                  <ClientHandlerRenderer Component={Component} fillSize={fillSize}/>
                </CatchErrors>]}
              </EditorComponentView>
            </Box>
        }
          editorRightSwitch={<EditorSwitcher
            fillSize={fillSize}
            setFillSize={(newFillSize) => {
              setFillSize(newFillSize);
              if (!fillSize) setViewSize({ width: 250, height: 250 });
            }}
            generated={generated} setGenerated={setGenerated}
            area={rightArea}
            setArea={(rightArea) => {
              setRightArea(rightArea);
            }}
          />}
        />
      </ModalContent>
    </Modal>
  </>;
}