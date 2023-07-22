import { Box, IconButton, Modal, ModalContent, ModalOverlay, useColorMode } from '@chakra-ui/react';
import { useDeep, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import { useLocalStore } from '@deep-foundation/store/local';
import { useDebounceCallback } from '@react-hook/debounce';
import json5 from 'json5';
import dynamic from 'next/dynamic';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { VscClearAll } from 'react-icons/vsc';
import { ClientHandler, ClientHandlerRenderer, evalClientHandler } from '../client-handler';
import { EditorComponentView } from '../editor/editor-component-view';
import { EditorGrid } from '../editor/editor-grid';
import { ListLanguages } from '../editor/editor-lang-list';
import { EditorResults } from '../editor/editor-results';
import { EditorSwitcher } from '../editor/editor-switcher';
import { CloseButton, EditorTabs } from '../editor/editor-tabs';
import { EditorTextArea } from '../editor/editor-textarea';
import { CatchErrors } from '../react-errors';
import { CytoEditorHandlers } from './handlers';
import { useCytoEditor } from './hooks';


const MonacoEditor = dynamic(() => import('@monaco-editor/react').then(m => m.default), { ssr: false });

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

export function CytoEditor() {
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

  const [currentLinkId, setCurrentLinkId] = useState(tab?.id || 0);
  const { data: [currentLink = deep?.minilinks?.byId[tab?.id]] = [] } = useDeepSubscription({
    id: currentLinkId || 0,
  });

  const onCloseAll = useCallback(() => {
    setTabs([]);
  }, []);

  const {
    tempValueRef,
    valuesRef,
    value,
    setValue,
  } = useEditorValueSaver(tabId);

  // console.log('editor', 'GeneratedFrom idLocal', deep.idLocal('@deep-foundation/core', 'GeneratedFrom'));
  // console.log('editor', 'tabId', tabId);

  const handlers = deep.useMinilinksSubscription({
    type_id: deep.idLocal('@deep-foundation/core', 'Handler'),
    _or: [
      {
        to: {
          out: {
            type_id: deep.idLocal('@deep-foundation/core', 'GeneratedFrom'),
            to_id: tabId
          }
        },
      },
      {
        to: {
          to_id: tabId
        },
      },
    ],
  });
  const handler = handlers?.[0];

  const generatedLink = useMinilinksFilter(
    deep.minilinks,
    (link) => {
      const filterResult = link?.outByType?.[deep.idLocal('@deep-foundation/core', 'GeneratedFrom')]?.[0]?.to_id === tabId;
      return filterResult;
    },
    (link, ml) => {
      return ml?.byId[tabId]?.inByType[deep.idLocal('@deep-foundation/core', 'GeneratedFrom')]?.[0]?.from;
    },
  )

  const [currentLanguage, setCurrentLanguage] = useLocalStore('df-dc-editor-currentLanguage', 'plaintext');
  useEffect(() => {
    refEditor.current?.monaco.editor.setModelLanguage(refEditor.current?.monaco.editor.getModels()[0], currentLanguage);
  }, [currentLanguage]);

  const currentValue = valuesRef?.current?.[tabId] || typeof tab?.initialValue !== 'undefined' ? tab?.initialValue : '';

  const refEditor = useRef<any>();

  const [rightArea, setRightArea] = useState('preview');
  const [generated, setGenerated] = useState('src');
  const [fillSize, setFillSize] = useState(false);
  const [viewSize, setViewSize] = useState<any>({ width: '50%', height: '100%' });
  const [editorMounted, setEditorMounted] = useState(false);

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
    import('@monaco-editor/react').then(m => { });
  }, []);


  const languages = refEditor.current?.monaco.languages.getLanguages();
  const validationTS = refEditor.current?.monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({
    noSemanticValidation: true,
    noSyntaxValidation: true,
  });

  const { colorMode } = useColorMode();

  return <>
    <Modal isOpen={cytoEditor} onClose={onClose} size='full' onEsc={onClose}>
      <ModalOverlay />
      <ModalContent sx={{ height: '100vh', overflow: 'initial' }}>
        <EditorGrid
          sash
          editorTextAreaElement={<>{[
            <Box
              key={tabId}
              sx={{
                pos: 'relative',
                height: '100%'
              }}
            >
              <EditorTextArea
                refEditor={refEditor}
                value={currentValue}
                defaultLanguage={currentLanguage}
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
                  const table = Value === deep.idLocal('@deep-foundation/core', 'String') ? 'strings' : Value === deep.idLocal('@deep-foundation/core', 'Number') ? 'numbers' : Value === deep.idLocal('@deep-foundation/core', 'Object') ? 'objects' : undefined;
                  const type = Value === deep.idLocal('@deep-foundation/core', 'String') ? 'string' : Value === deep.idLocal('@deep-foundation/core', 'Number') ? 'number' : Value === deep.idLocal('@deep-foundation/core', 'Object') ? 'object' : 'undefined';

                  let _value;
                  try {
                    _value = table === 'strings' ? value : table === 'numbers' ? parseFloat(value) : table === 'objects' ? json5.parse(value) : undefined;
                  } catch (error) {
                    console.log('error123', error);
                  }

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
                onMount={() => setEditorMounted(true)}
              />
              <Box
                w='100%'
                pos='absolute'
                bottom='0'
                borderTopColor='borderColor'
                borderTopWidth='thin'
                p='0.5rem'
                height='auto'
                bg='lightDark'
              >
                <Box pos='relative' height='100%'>
                  <ListLanguages
                    languages={languages}
                    currentLanguage={currentLanguage}
                    setLanguage={(i) => {
                      if (i == 'typescript') validationTS
                      setCurrentLanguage(i);
                    }}
                  />
                </Box>
              </Box>
            </Box>
          ]}</>}
          editorTabsElement={<EditorTabs
            tabs={tabs.map((tab) => ({
              ...tab,
              title: `${tab.id} ${deep.minilinks.byId[tab.id]?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || ''}`.trim(),
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
            onSaveTab={async (savedValue) => {
              const value = tempValueRef?.current?.[tabId] || savedValue;
              const Value = await deep.id({ in: { type_id: { _id: ['@deep-foundation/core', 'Value'] }, from: { typed: { id: { _eq: tab.id } } } } });
              const table = Value === deep.idLocal('@deep-foundation/core', 'String') ? 'strings' : Value === deep.idLocal('@deep-foundation/core', 'Number') ? 'numbers' : Value === deep.idLocal('@deep-foundation/core', 'Object') ? 'objects' : undefined;
              const type = Value === deep.idLocal('@deep-foundation/core', 'String') ? 'string' : Value === deep.idLocal('@deep-foundation/core', 'Number') ? 'number' : Value === deep.idLocal('@deep-foundation/core', 'Object') ? 'object' : 'undefined';

              let _value;
              try {
                _value = table === 'strings' ? value : table === 'numbers' ? parseFloat(value) : table === 'objects' ? json5.parse(value) : undefined;
              } catch (error) { }

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
              console.log('onclick');
            }}
          />}
          closeAllButtonElement={<IconButton icon={<VscClearAll />} onClick={onCloseAll} aria-label='Close all tabs' />}
          closeButtonElement={<CloseButton onClick={onClose} />}
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
              <CytoEditorHandlers linkId={generated && generatedLink ? generatedLink?.id : tab?.id} />
            ) ||
            rightArea === 'preview' && <Box
              pos='relative'
              sx={{
                backgroundColor: 'editorPreviewBackground',
                backgroundImage: `linear-gradient(-90deg, ${'editorPreviewBackgroundGrid'} 1px, transparent 1px), linear-gradient(0deg, ${'editorPreviewBackgroundGrid'} 1px, transparent 1px), linear-gradient(transparent 0px, ${'editorPreviewBackground'} 1px, ${'editorPreviewBackground'} 20px, transparent 20px), linear-gradient(-90deg, ${'editorPreviewBackgroundGrid'} 1px, transparent 1px), linear-gradient(-90deg, transparent 0px, ${'editorPreviewBackground'} 1px, ${'editorPreviewBackground'} 20px, transparent 20px), linear-gradient(0deg, ${'editorPreviewBackgroundGrid'} 1px, transparent 1px)`,
                backgroundSize: '20px 20px, 20px 20px, 20px 20px, 20px 20px, 20px 20px, 20px 20px',
              }}
            >
              {[<EditorComponentView
                key={`${currentLink?.id || 0}-${tabId}-${handler?.id}`}
                size={viewSize}
                onChangeSize={(viewSize) => setViewSize(viewSize)}
                fillSize={fillSize}
                setFillSize={setFillSize}
              >
                {handler && [<ClientHandler key={handler?.id} handlerId={handler?.id} fillSize={fillSize} linkId={currentLink?.id} ml={deep.minilinks} />]}
              </EditorComponentView>]}
            </Box> ||
            rightArea === 'results' && <EditorResults id={tab.id} />
          }
          editorRightSwitch={<EditorSwitcher
            fillSize={fillSize}
            setFillSize={(newFillSize) => {
              setFillSize(newFillSize);
              if (!fillSize) setViewSize({ width: 250, height: 250 });
            }}
            currentLinkId={currentLinkId}
            setCurrentLinkId={(newCurrentLinkId) => {
              setCurrentLinkId(newCurrentLinkId)
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
