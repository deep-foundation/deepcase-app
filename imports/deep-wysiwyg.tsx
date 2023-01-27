import React, { useState, Ref, PropsWithChildren, useCallback } from 'react';
import { createEditor, Descendant, Editor, Element as SlateElement, Transforms } from 'slate';
import { Slate, Editable, withReact, useSlate } from 'slate-react';
import { Box, IconButton } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { FiBold, FiItalic, FiUnderline, FiCode } from 'react-icons/fi';
import { TbNumber1, TbNumber2, TbQuote, TbList, TbListNumbers } from 'react-icons/tb';
import { RxTextAlignJustify, RxTextAlignCenter, RxTextAlignLeft, RxTextAlignRight } from 'react-icons/rx';
import isHotkey from 'is-hotkey';


const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

export const DeepWYSIWYG = React.memo<any>(() => {
  // const initialValue = [
  //   {
  //     type: 'paragraph',
  //     children: [{ text: 'A line of text in a paragraph.' }],
  //   },
  // ];
  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const renderElement = useCallback(props => <Element {...props} />, []);
  const [editor] = useState(() => withReact(createEditor()));

  return (<Box sx={{
      '& > * > *:nth-of-type(2)': {
        backgroundColor: 'red',
      }
    }}>
      <Slate editor={editor} value={initialValue}>
        <Box 
          display='grid' gridTemplateColumns='repeat(auto-fit, minmax(max-content, 1.5rem))' 
          sx={{ 
            borderLeft: '1px solid #aaa', 
            borderTop: '1px solid #aaa', 
            borderRight: '1px solid #aaa', 
            borderRadius: '0.5rem', 
            padding: '1rem', 
            '& > *': {
              border: '1px solid #aaa', 
              borderRadius: '50%', 
              
            }
        }}>
          <MarkButton icon={<FiBold />} format='bold' />
          <MarkButton format="italic" icon={<FiItalic />} />
          <MarkButton format="underline" icon={<FiUnderline />} />
          <MarkButton format="code" icon={<FiCode />} />
          <BlockButton format="heading-one" icon={<TbNumber1 />} />
          <BlockButton format="heading-two" icon={<TbNumber2 />} />
          <BlockButton format="block-quote" icon={<TbQuote />} />
          <BlockButton format="numbered-list" icon={<TbListNumbers />} />
          <BlockButton format="bulleted-list" icon={<TbList />} />
          <BlockButton format="left" icon={<RxTextAlignLeft />} />
          <BlockButton format="center" icon={<RxTextAlignCenter />} />
          <BlockButton format="right" icon={<RxTextAlignRight />} />
          <BlockButton format="justify" icon={<RxTextAlignJustify />} />
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
      className,
      active,
      reversed,
      ...props
    }: PropsWithChildren<
      {
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
        color: reversed
          ? active
            ? 'white'
            : '#aaa'
          : active
          ? 'black'
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
          fontSize: 18,
          verticalAlign: 'text-bottom'
        }}
    />
  )
)

const MarkButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const BlockButton = ({ format, icon }) => {
  const editor = useSlate()
  return (
    <Button
      active={isBlockActive(
        editor,
        format,
        TEXT_ALIGN_TYPES.includes(format) ? 'align' : 'type'
      )}
      onMouseDown={event => {
        event.preventDefault()
        toggleBlock(editor, format)
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
}

const UniversalButton = React.memo<any>(({
  ComponentProps,
  Component = Box,
  active,
  reversed,
  format,
  children,
}:{
  ComponentProps?: any;
  Component?: any;
  active?: boolean;
  reversed?: boolean;
  format?: string;
  children?: any;
}) => {
  console.log(format);
  return (<Component 
      // as={motion.div}
      // animate={control}
      // variants={animationVariants}
      width='max-content'
      height='24px'
      lineHeight='1.2'
      transition='all 0.2s cubic-bezier(.08,.52,.52,1)'
      border='1px'
      px='8px'
      borderRadius='2px'
      fontSize='14px'
      fontWeight='semibold'
      bg='#f5f6f7'
      borderColor='#ccd0d5'
      color='#4b4f56'
      _hover={{ bg: '#ebedf0' }}
      _active={{
        bg: '#dddfe2',
        transform: 'scale(0.98)',
        borderColor: '#bec3c9',
      }}
      _focus={{
        boxShadow:
          '0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)',
      }}
      aria-label={format}
      sx={{
        cursor: 'pointer',
        color: reversed
          ? active
            ? 'white'
            : '#aaa'
          : active
          ? 'black'
          : '#ccc'
      }}
      {...ComponentProps}
    >{123}</Component>)
})

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
};

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
  )
  const isList = LIST_TYPES.includes(format)
console.log({isList});
  Transforms.unwrapNodes(editor, {
    match: n =>
      !Editor.isEditor(n) &&
      SlateElement.isElement(n) &&
      // @ts-ignore
      LIST_TYPES.includes(n.type) &&
      !TEXT_ALIGN_TYPES.includes(format),
    split: true,
  })
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

const _MarkButton = ({ format, icon, ComponentProps }:{ format?: string; icon: any; ComponentProps?: any; }) => {
  const editor = useSlate();
  console.log(icon);
  return (
    <UniversalButton
      Component={IconButton}
      icon={icon}
      isRound
      aria-label={format}
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format)
      }}
      ComponentProps={ComponentProps}
    />
  )
};

const ButtonEdit = React.memo<any>(({children, format}:{children?: any; format?: string;}) => {
  return (<Box
      as='button'
      height='24px'
      lineHeight='1.2'
      transition='all 0.2s cubic-bezier(.08,.52,.52,1)'
      border='1px'
      px='8px'
      borderRadius='2px'
      fontSize='14px'
      fontWeight='semibold'
      bg='#f5f6f7'
      borderColor='#ccd0d5'
      color='#4b4f56'
      _hover={{ bg: '#ebedf0' }}
      _active={{
        bg: '#dddfe2',
        transform: 'scale(0.98)',
        borderColor: '#bec3c9',
      }}
      _focus={{
        boxShadow:
          '0 0 1px 2px rgba(88, 144, 255, .75), 0 1px 1px rgba(0, 0, 0, .15)',
      }}
      aria-label={format}
    >
      {children}
    </Box>
  )
})

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

const initialValue = [
  {
    type: 'paragraph',
    children: [
      { text: 'This is editable ' },
      { text: 'rich', bold: true },
      { text: ' text, ' },
      { text: 'much', italic: true },
      { text: ' better than a ' },
      { text: '<textarea>', code: true },
      { text: '!' },
    ],
  },
  {
    type: 'paragraph',
    children: [
      {
        text:
          "Since it's rich text, you can do things like turn a selection of text ",
      },
      { text: 'bold', bold: true },
      {
        text:
          ', or add a semantically rendered block quote in the middle of the page, like this:',
      },
    ],
  },
  {
    type: 'block-quote',
    children: [{ text: 'A wise quote.' }],
  },
  {
    type: 'paragraph',
    align: 'center',
    children: [{ text: 'Try it out for yourself!' }],
  },
]