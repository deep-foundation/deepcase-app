import React, { useState, Ref, PropsWithChildren, useCallback } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { Box, IconButton, useColorMode } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { FiBold, FiItalic, FiUnderline, FiCode } from 'react-icons/fi';
import { TbNumber1, TbNumber2, TbQuote, TbList, TbListNumbers } from 'react-icons/tb';
import { CiTextAlignJustify, CiTextAlignCenter, CiTextAlignLeft, CiTextAlignRight } from 'react-icons/ci';
import isHotkey from 'is-hotkey';
import { CustomizableIcon } from './icons-provider';


const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

export const DeepWYSIWYG = React.memo<any>(() => {
  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const [editor] = useState(() => withReact(createEditor()));

  const { colorMode } = useColorMode();

  return (<Box sx={{
      '& > * > *:nth-of-type(2)': {
        // backgroundColor: 'red',
      }
    }}>
      <Slate editor={editor} value={initialValue}>
        <Box 
          display='grid' 
          gridTemplateColumns='repeat(auto-fit, minmax(max-content, 1.5rem))' 
          gap='0.5rem'
          sx={{ 
            borderLeft: '1px solid #aaa', 
            borderTop: '1px solid #aaa', 
            borderRight: '1px solid #aaa', 
            borderRadius: '0.5rem', 
            padding: '0.5rem', 
            '& > *:hover': {
              transform: 'scale(1.15)'
            }
        }}>
          {/* <MarkButton icon={
            <CustomizableIcon Component={FiBold} value={{color: colorMode === 'dark' ? 'rgb(0, 128, 255)' : 'rgb(50, 128, 5)'}} style={{padding: '0.2rem'}} />} format='bold' />
          <MarkButton icon={<CustomizableIcon Component={FiItalic} value={{color: colorMode === 'dark' ? 'rgb(0, 128, 255)' : 'rgb(50, 128, 5)'}} style={{padding: '0.2rem'}} />} format="italic" />
          <MarkButton icon={<CustomizableIcon Component={FiUnderline} value={{color: colorMode === 'dark' ? 'rgb(0, 128, 255)' : 'rgb(50, 128, 5)'}} style={{padding: '0.2rem'}} />} format="underline" /> */}
          <MarkButton colorMode={colorMode} icon={<FiCode style={{padding: '0.2rem'}} />} format="code" />
          <BlockButton colorMode={colorMode} format="heading-one" icon={<TbNumber1 style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="heading-two" icon={<TbNumber2 style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="block-quote" icon={<TbQuote style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="numbered-list" icon={<TbListNumbers style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="bulleted-list" icon={<TbList style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="left" icon={<CiTextAlignLeft style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="center" icon={<CiTextAlignCenter style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="right" icon={<CiTextAlignRight style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="justify" icon={<CiTextAlignJustify style={{padding: '0.2rem'}} />} />
        </Box>
        <Editable 
          style={{ border: '1px solid #aaa', borderRadius: '0.5rem', padding: '1rem' }}
          spellCheck
          autoFocus
          renderElement={renderElement}
          renderLeaf={renderLeaf}
          onKeyDown={event => {
            for (const hotkey in HOTKEYS) {
              if (isHotkey(hotkey, event as any)) {
                event.preventDefault()
                const mark = HOTKEYS[hotkey]
                toggleMark(editor, mark)
              }
            }
          }}
        />
      </Slate>
    </Box>
  )
});

const Leaf = ({ attributes, children, leaf }) => {
  if (leaf.bold) {
    children = <strong>{children}</strong>
  }

  if (leaf.code) {
    children = <code>{children}</code>
  }

  if (leaf.italic) {
    children = <em>{children}</em>
  }

  if (leaf.underline) {
    children = <u>{children}</u>
  }

  return <span {...attributes}>{children}</span>
};

interface BaseProps {
  className: string
  [key: string]: unknown
};
type OrNull<T> = T | null;

const Button = React.forwardRef(
  (
    {
      colorMode,
      active,
      reversed,
      ...props
    }: PropsWithChildren<
      {
        colorMode?: string
        active: boolean
        reversed: boolean
      } & BaseProps
    >,
    ref: Ref<OrNull<HTMLSpanElement>>
  ) => (
    <span
      {...props}
      ref={ref}
      style={{
        cursor: 'pointer',
        border: 'thin solid #c5c5c5',
        borderRadius: '0.2rem',
        backgroundColor: (colorMode === 'dark' && active) ? 'red' : 'gray',
        color: reversed
          ? active
            ? 'white'
            : '#aaa'
          : active 
            ? 'gray'
            : '#ccc'
      }}
    />
  )
);

const Icon = React.forwardRef(
  (
    { className, ...props }: PropsWithChildren<BaseProps>,
    ref: Ref<OrNull<HTMLSpanElement>>
  ) => (
    <span
      {...props}
      ref={ref}
      style={{
          fontSize: 24,
          verticalAlign: 'text-bottom',
        }}
    />
  )
)

const MarkButton = ({ format, icon, colorMode }) => {
  const editor = useSlate()
  return (
    <Button
      colorMode={colorMode}
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format);
        console.log("event", format, event, colorMode);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const BlockButton = ({ format, icon, colorMode }) => {
  const editor = useSlate()
  return (
    <Button
      colorMode={colorMode}
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
      )}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format);
        console.log("event", format, event);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const isBlockActive = (editor, format, blockType = 'type') => {
  const { selection } = editor
  if (!selection) return false

  const [match] = Array.from(
    Editor.nodes(editor, {
      at: Editor.unhangRange(editor, selection),
      match: n =>
        !Editor.isEditor(n) &&
        SlateElement.isElement(n) &&
        n[blockType] === format,
    })
  )

  return !!match
}

const toggleMark = (editor, format) => {
  const isActive = isMarkActive(editor, format)

  if (isActive) {
    Editor.removeMark(editor, format)
  } else {
    Editor.addMark(editor, format, true)
  }
};

const isMarkActive = (editor, format) => {
  const marks = Editor.marks(editor)
  return marks ? marks[format] === true : false
};

const toggleBlock = (editor, format) => {
  const isActive = isBlockActive(
    editor,
    format,
    TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
  );
  const isList = LIST_TYPES.includes(format);
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      // @ts-ignore
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  });
  let newProperties: Partial<SlateElement>
  if (TEXT_ALIGN_TYPES.includes(format)) {
    newProperties = {
      // @ts-ignore
      align: isActive ? undefined : format,
    }
  } else {
    newProperties = {
      // @ts-ignore
      type: isActive ? 'paragraph' : isList ? 'list-item' : format,
    }
  }
  Transforms.setNodes<SlateElement>(editor, newProperties)

  if (!isActive && isList) {
    const block = { type: format, children: [] }
    Transforms.wrapNodes(editor, block)
  }
};

const Element = ({ attributes, children, element }) => {
  const style = { textAlign: element.align }
  switch (element.type) {
    case 'block-quote':
      return (
        <blockquote style={style} {...attributes}>
          {children}
        </blockquote>
      )
    case 'bulleted-list':
      return (
        <ul style={style} {...attributes}>
          {children}
        </ul>
      )
    case 'heading-one':
      return (
        <h1 style={style} {...attributes}>
          {children}
        </h1>
      )
    case 'heading-two':
      return (
        <h2 style={style} {...attributes}>
          {children}
        </h2>
      )
    case 'list-item':
      return (
        <li style={style} {...attributes}>
          {children}
        </li>
      )
    case 'numbered-list':
      return (
        <ol style={style} {...attributes}>
          {children}
        </ol>
      )
    default:
      return (
        <p style={style} {...attributes}>
          {children}
        </p>
      )
  }
};
