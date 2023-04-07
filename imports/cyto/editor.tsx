import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Box, HStack, Flex, IconButton, Text, Input } from '@chakra-ui/react';
import { useDeep, useDeepQuery, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { Link, MinilinksInstance, MinilinksResult, useMinilinksApply, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import { ClientHandlerRenderer, evalClientHandler } from '../client-handler';
import { useLocalStore } from '@deep-foundation/store/local';
import React, { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
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
import { VscClearAll } from 'react-icons/vsc';
import { EditorResults } from '../editor/editor-results';
import { motion } from 'framer-motion';
import { TbArrowRotaryFirstRight } from 'react-icons/tb';
import dynamic from 'next/dynamic';
import { Resizable } from 're-resizable';


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

const versionsListVariants = {
  open: {
    opacity: 1,
    y: 0, 
    transition: { type: "spring", stiffness: 300, damping: 24 }
  },
  closed: { opacity: 0, y: 20, transition: { duration: 0.2 } }
};

const ListLanguages = React.memo<any>(({ 
  languages = [],
  currentLanguage,
  setLanguage,
}) => {
  const [isOpenListLanguages, setIsOpenListLanguages] = useState(false);

  return (<Box as={motion.nav}
      initial={false}
      animate={isOpenListLanguages ? "open" : "closed"}
      sx={{
        filter: 'drop-shadow(0px 0px 1px #5f6977)',
        // border: 'thin solid #ebebeb',
        width: '50%',
        height: 10,
        // position: 'absolute',
        top: 0,
        right: 0,
      }}
    >
      <Box as={motion.button}
        whileTap={{ scale: 0.97 }}
        onClick={() => setIsOpenListLanguages(!isOpenListLanguages)}
        sx={{
          background: '#fff',
          color: '#0080ff',
          border: 'none',
          borderRadius: '0.3rem',
          p: '0.1rem 0.5rem',
          fontWeight: 700,
          cursor: 'pointer',
          w:'100%',
          h: 'inherit',
          textAlign: 'left',
          mb: '0.3rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Text fontSize='sm'>{currentLanguage}</Text>
        <Box as={motion.div}
          variants={{
            open: { rotate: -180 },
            closed: { rotate: 0 }
          }}
          animate={{ originY: 0.55 }}
          // @ts-ignore
          transition={{
            type: "tween",
            duration: 0.2
          }}
        >
          <TbArrowRotaryFirstRight />
        </Box>
      </Box>
      <Box
        as={motion.ul}
        variants={{
          open: {
            clipPath: "inset(0% 0% 0% 0% round 5px)",
            y: -300,
            originY: 0,
            originX: 0.5,
            transition: {
              type: "spring",
              bounce: 0,
              duration: 0.7,
              delayChildren: 0.3,
              staggerChildren: 0.05
            }
          },
          closed: {
            clipPath: "inset(10% 50% 90% 50% round 5px)",
            originY: 0,
            originX: 1,
            y: -60,
            transition: {
              type: "spring",
              bounce: 0,
              duration: 0.3,
              delay: 0.3,
            }
          }
        }}
        sx={{
          zIndex: 44,
          position: 'absolute',
          display: 'flex',
          height: '15.7rem',
          flexDirection: 'column',
          gap: '0.7rem',
          background: '#fff',
          p: 2,
          overflowY: 'scroll',
          overscrollBehavior: 'contain',
        }}
        style={{ pointerEvents: isOpenListLanguages ? "auto" : "none" }}
      >
        {languages.map(l => (
          <Box 
            as={motion.li} 
            sx={{listStyle: 'none', display: 'block', fontSize: '0.8rem'}} 
            variants={versionsListVariants}
            key={l.id}
            role='button'
            onClick={() => {
              setLanguage(l.id);
              setIsOpenListLanguages(false);
            }}
          >{l.id}</Box>
        ))}
      </Box>
    </Box>
  )
})

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

  const [currentLinkId, setCurrentLinkId] = useState(tab?.id);
  const { data: [currentLink = deep?.minilinks?.byId[tab?.id]] = [] } = useDeepSubscription({
    id: currentLinkId,
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

  const generatedLink = useMinilinksFilter(
    deep.minilinks,
    (link) => {
      const filterResult = link?.outByType?.[deep.idLocal('@deep-foundation/core', 'GeneratedFrom')]?.[0]?.to_id === tabId;
      // console.log('editor', 'filterResult', filterResult);
      return filterResult;
    },
    (link, ml) => {
      return ml?.byId[tabId]?.inByType[deep.idLocal('@deep-foundation/core', 'GeneratedFrom')]?.[0]?.from;
    },
  )

  // console.log('editor', 'generatedLink', generatedLink);
  
  useEffect(() => {
    // console.log('editor', 'evalClientHandler', 'generatedLink', generatedLink);
    // console.log('editor', 'evalClientHandler', 'generatedLink?.value?.value', generatedLink?.value?.value);
    // console.log('editor', 'evalClientHandler', 'tab', tab);
    // console.log('editor', 'evalClientHandler', 'tab?.initialValue', tab?.initialValue);
    const value = generatedLink?.value?.value || tab?.initialValue;
    // console.log('editor', 'evalClientHandler', 'useEffect', value);
    if (!value) {
      return;
    }
    evalClientHandler({ value, deep }).then(({ data, error }) => {
      // console.log('editor','evalClientHandler', 'error', error);
      // console.log('editor','evalClientHandler', 'data', data);
      if (error)
        throw error;
      setComponent(() => data);
    });
  }, [tab?.initialValue, generatedLink]);
  
  const currentValue = valuesRef?.current?.[tabId] || tab?.initialValue || '';

  const refEditor = useRef<any>();

  const [rightArea, setRightArea] = useState('preview');
  const [generated, setGenerated] = useState('src');
  const [fillSize, setFillSize] = useState(false);
  const [viewSize, setViewSize] = useState<any>({width: '50%', height: '100%'});

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
  
  const [currentLanguage, setCurrentLanguage] = useState(undefined);
  const model = refEditor.current?.monaco.editor.getModels()[0];
  const latestLanguage = model?._languageId;
  if (model) {
    model.onDidChangeAttached = () => {
      if (!currentLanguage && model._languageId) setCurrentLanguage(model._languageId);
    }
  }
  
  console.log('latestLanguageBefore', latestLanguage);
  
  useEffect(() => {
    if (!currentLanguage && latestLanguage) setCurrentLanguage(latestLanguage);
  }, [latestLanguage, currentLanguage])
  
  const languages = refEditor.current?.monaco.languages.getLanguages();
  
  console.log('getModels()', refEditor?.current?.monaco.editor.getModels().length);
  // const string = String(latestLanguage);
  // const copy = JSON.parse(JSON.stringify(latestLanguage));
  // console.log('copy', copy);
  // const getLanguage = refEditor?.current?.monaco.editor.setModelLanguage(refEditor?.current?.monaco.editor.getModel(), i)
  console.log('languages', languages);
  // console.log('string', string);
  console.log('currentLanguageF', currentLanguage);

  const [dockSize, setDockSize] = useState(0.3);

  const handleDockResize = (size) => {
    setDockSize(size);
  };


  return <>
    <Modal isOpen={cytoEditor} onClose={onClose} size='full'>
      <ModalOverlay />
      <ModalContent style={{ height: '100%' }}>
        <EditorGrid
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
                />
                <Box w='100%' bg='white' pos='absolute' bottom='0' borderTopColor='#ebebeb' borderTopWidth='thin' p='0.5rem'>
                  <Box pos='relative'>
                    <ListLanguages 
                      languages={languages} 
                      currentLanguage={currentLanguage} 
                      setLanguage={(i) => {
                        console.log('currentLanguage', currentLanguage);
                        console.log('idi', i);
                        console.log('latestLanguage', latestLanguage);
                        setCurrentLanguage(i);
                        refEditor.current?.monaco.editor.setModelLanguage(refEditor.current?.monaco.editor.getModels()[0], i);
                        console.log('currentLanguage1', currentLanguage);
                        console.log('idi1', i);
                        console.log('latestLanguage1', latestLanguage);
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
              console.log('onclick');
            }}
          />}
          closeAllButtonElement={<IconButton icon={<VscClearAll/>} onClick={onCloseAll} aria-label='Close all tabs'/>}
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
              <CytoEditorHandlers linkId={generated && generatedLink ? generatedLink?.id : tab?.id}/>
            ) ||
            rightArea === 'preview' && <Box pos='relative'>
              {[<EditorComponentView
                key={currentLink?.id}
                size={viewSize}
                onChangeSize={(viewSize) => setViewSize(viewSize)}
                fillSize={fillSize}
                setFillSize={setFillSize}
              >
                {typeof(Component) === 'function' && [<CatchErrors key={Component.toString()} errorRenderer={() => <div></div>}>
                  <ClientHandlerRenderer Component={Component} fillSize={fillSize} link={deep?.minilinks?.byId[currentLink?.id]}/>
                </CatchErrors>]}
              </EditorComponentView>]}
            </Box> ||
            rightArea === 'results' && <EditorResults id={tab.id}/>
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