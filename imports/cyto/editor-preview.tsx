import { Modal, ModalOverlay, ModalContent, ModalHeader, ModalCloseButton, ModalBody, ModalFooter, Button, Box, HStack, Flex, IconButton } from '@chakra-ui/react';
import { useDeep, useDeepQuery, useDeepSubscription } from '@deep-foundation/deeplinks/imports/client';
import { Link, MinilinksInstance, MinilinksResult, useMinilinksApply, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import { ClientHandlerRenderer, evalClientHandler } from '../client-handler';
import { useLocalStore } from '@deep-foundation/store/local';
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
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

export function CytoEditorPreview({
  link,
  compact = false,
}: {
  link?: any;
  compact?: boolean;
}) {
  const [cytoEditor, setCytoEditor] = useCytoEditor();
  const onClose = useCallback(() => {
    setCytoEditor(false);
  }, []);
  const deep = useDeep();

  const linkId = link.id;

  const [currentLinkId, setCurrentLinkId] = useState(linkId);
  const { data: [currentLink = link] = [] } = useDeepSubscription({
    id: currentLinkId,
  });

  const {
    tempValueRef,
    valuesRef,
    value,
    setValue,
  } = useEditorValueSaver(linkId);

  const generatedLink = useMinilinksFilter(
    deep.minilinks,
    (link) => {
      return link?.outByType?.[deep.idLocal('@deep-foundation/core', 'GeneratedFrom')]?.[0]?.to_id === linkId;
    },
    (link, ml) => {
      return ml.byId[linkId]?.inByType[deep.idLocal('@deep-foundation/core', 'GeneratedFrom')]?.[0]?.from;
    },
  )

  useEffect(() => {
    const value = generatedLink?.value?.value || link?.value?.value;
    console.log('evalClientHandler', 'useEffect', value);
    evalClientHandler({ value, deep }).then(({ data, error }) => {
      console.log('evalClientHandler', 'error', error);
      console.log('evalClientHandler', 'data', data);
      setComponent(() => data);
    });
  }, [link?.value?.value, generatedLink]);

  const currentValue = valuesRef?.current?.[linkId] || '';

  const refEditor = useRef();

  const [rightArea, setRightArea] = useState('preview');
  const [generated, setGenerated] = useState('src');
  const [fillSize, setFillSize] = useState(false);
  const [viewSize, setViewSize] = useState({width: 124, height: 123});

  const [Component, setComponent] = useState({});

  const [switcher, setSwitch] = useState(true);
  const switchProps = switcher ? { left: 0 } : { right: 0 };

  return <>
    <EditorGrid
      columns={switcher ? 'repeat(2, 15% 85%)' : 'repeat(2, 85% 15%)'}
      editorTextAreaElement={<>{[<div key={linkId}>
        <EditorTextArea
          refEditor={refEditor}
          value={currentValue}
          onChange={(value) => {
            setValue(linkId, value);
          }}
          onSave={async (savedValue) => {
            const value = tempValueRef?.current?.[linkId] || savedValue;
            const Value = await deep.id({ in: { type_id: { _id: ['@deep-foundation/core', 'Value'] }, from: { typed: { id: { _eq: linkId } } } } });
            const table = Value === deep.idLocal('@deep-foundation/core', 'String') ? 'strings' : Value === deep.idLocal('@deep-foundation/core', 'Number') ? 'numbers' : Value === deep.idLocal('@deep-foundation/core', 'Object') ? 'objects' : undefined;
            const type = Value === deep.idLocal('@deep-foundation/core', 'String') ? 'string' : Value === deep.idLocal('@deep-foundation/core', 'Number') ? 'number' : Value === deep.idLocal('@deep-foundation/core', 'Object') ? 'object' : 'undefined';

            let _value;
            try {
              _value = table === 'strings' ? value : table === 'numbers' ? parseFloat(value) : table === 'objects' ? json5.parse(value) : undefined;
            } catch(error) {}

            if (!deep.minilinks.byId[linkId]?.value) {
              await deep.insert({ link_id: linkId, value: _value }, {
                table: table,
              });
            } else if (type !== 'undefined') {
              await deep.update({ link_id: { _eq: linkId } }, {
                value: _value,
              }, {
                table: `${type}s`,
              });
            } else {
            }
          }}
        />
      </div>]}</>}
      // editorTabsElement={<EditorTabs
      //   tabs={tabs.map((tab) => ({
      //     ...tab,
      //     title: `${linkId} ${deep.minilinks.byId[linkId]?.inByType?.[deep.idLocal('@deep-foundation/core', 'Contain')]?.[0]?.value?.value || ''}`.trim(),
      //     active: linkId === linkId,
      //   }))}
      //   setTabs={(tabs) => setTabs(tabs)}
      //   onClose={(tab) => {
      //     if (tabs.length === 1 && tabs[0]?.id === linkId) onClose();
      //     closeTab(linkId);
      //     setValue(linkId, undefined);
      //     focusEditor();
      //   }}
      //   onClick={(tab) => {
      //     activeTab(linkId);
      //     focusEditor();
      //   }}
      // />}
      // closeAllButtonElement={<IconButton icon={<VscClearAll/>} onClick={onCloseAll} aria-label='Close all tabs'/>}
      // closeButtonElement={<CloseButton onClick={onClose}/>}
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
          <CytoEditorHandlers linkId={generated && generatedLink ? generatedLink?.id : linkId}/>
        ) ||
        rightArea === 'preview' && <Box pos='relative'>
          {[<EditorComponentView
            key={currentLink?.id}
            size={viewSize}
            onChangeSize={(viewSize) => setViewSize(viewSize)}
            fillSize={fillSize}
            setFillSize={setFillSize}
          >
            {typeof(Component) === 'function' && [<CatchErrors key={Component.toString()} errorRenderer={(error) => {
              console.log('EditorComponentView', 'errorRenderer', error);
              return <div>{JSON.stringify(error)}</div>;
            }}>
              <ClientHandlerRenderer Component={Component} fillSize={fillSize} link={deep?.minilinks?.byId[currentLink?.id]}/>
            </CatchErrors>]}
          </EditorComponentView>]}
        </Box>
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
    <Box position='absolute' {...switchProps} top={0} height={'100%'} width={'15%'} bg='primary' opacity={0.2} onClick={() => {
      setSwitch(sw => !sw);
    }}></Box>
  </>;
}