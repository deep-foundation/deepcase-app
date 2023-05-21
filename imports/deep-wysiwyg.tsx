import { Box, Heading, useColorMode } from '@chakra-ui/react';
import isHotkey from 'is-hotkey';
import React, { PropsWithChildren, Ref, useCallback, useState } from 'react';
import { Editor, Element as SlateElement, Transforms, createEditor } from 'slate';
import { Editable, Slate, useSlate, withReact } from 'slate-react';
import {
  FiBold,
  FiItalic,
  FiUnderline,
  FiCode,
} from 'react-icons/fi';
import {
  TbNumber1,
  TbNumber2,
  TbQuote,
  TbListNumbers,
  TbList,
} from 'react-icons/tb';
import {
  CiTextAlignLeft,
  CiTextAlignCenter,
  CiTextAlignRight,
  CiTextAlignJustify,
} from 'react-icons/ci';


const HOTKEYS = {
  'mod+b': 'bold',
  'mod+i': 'italic',
  'mod+u': 'underline',
  'mod+`': 'code',
};
interface BaseProps {
  className: string
  [key: string]: unknown
};
type OrNull<T> = T | null;

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];
  
  // Only objects editor.
export const DeepWysiwyg = React.memo<any>(({ fillSize, style, link, children }) => {
  const initialValue = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ];
  
  const random = Math.floor(Math.random()*16777215).toString(16);
  const [color, setColor] = useState(random);

  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const renderElement = useCallback(props => <Element {...props} state={color} />, []);
  const [editor] = useState(() => withReact(createEditor()));
  const { colorMode } = useColorMode();
  const [viewSize, setViewSize] = useState({width: 300, height: 300});

// const randomBorderColor = Math.floor(Math.random()*16777215).toString(16);

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
  
  const Element = ({ attributes, children, element, state }) => {
    const style = { textAlign: element.align }
    switch (element.type) {
      case 'block-quote':
        return (
          <blockquote
            style={{
              fontSize: '1.4em',
              width: '100%',
              margin: '0 0',
              fontFamily: 'Open Sans',
              fontStyle: 'italic',
              color: '#555555',
              padding: '1.2em 1.2rem 1.2em 1.7rem',
              borderLeft: `3px solid #${state}`,
              lineHeight: '1.1',
              position: 'relative',
              background: '#f3f3f3',
              style
            }} {...attributes}>
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
          <Heading as='h1' size='xl' noOfLines={1} sx={style} {...attributes}>
            {children}
          </Heading>
        )
      case 'heading-two':
        return (
          <Heading as='h2' size='lg' noOfLines={1} sx={style} {...attributes}>
            {children}
          </Heading>
        )
      // case 'highlight':
      //   return (
      //     <Highlight query={undefined} sx={{px: '1', py: '1', bg: 'blue.300', ...style}} {...attributes}>
      //       {children}
      //     </Highlight>
      //   )
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
  return (<Box sx={{
      w: fillSize ? '100%' : '28.29rem',
      '& > * > *:nth-of-type(2)': {
        // backgroundColor: 'red',
      }
    }}>
      <Slate editor={editor} value={initialValue}>
        {children}
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
})

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
  let newProperties: Partial<SlateElement>;
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

export const BlockButton = React.memo<any>(({ format, icon, colorMode, setColor }:{ format: any; icon: any; colorMode?: any; setColor?: () => any; }) => {
  const editor = useSlate();
  
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
        if(format === 'block-quote') {
          setColor();
        }
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
});

export const MarkButton = ({ format, icon, colorMode }) => {
  const editor = useSlate()
  return (
    <Button
      colorMode={colorMode}
      active={isMarkActive(editor, format)}
      onMouseDown={event => {
        event.preventDefault()
        toggleMark(editor, format);
      }}
    >
      <Icon>{icon}</Icon>
    </Button>
  )
};

const Button = React.forwardRef(({
  colorMode,
  active,
  reversed,
  ref,
  ...props
  }:PropsWithChildren<
  {
    colorMode?: string;
    active: boolean;
    reversed: boolean;
    ref: Ref<OrNull<HTMLSpanElement>>;
  } & BaseProps>,) => (
    <span
      {...props}
      ref={ref}
      style={{
        cursor: 'pointer',
        border: 'thin solid #c5c5c5',
        borderRadius: '0.2rem',
        backgroundColor: (colorMode === 'dark' && active) 
          ? '#A8E0FF' 
          : (colorMode === 'light' && active)
          ? 'white'
          : '#E8F1FC',
        color: reversed
          ? active
            ? 'white'
            : '#aaa'
          : active 
            ? '#344055'
            : 'gray'
      }}
    />
  )
);

const Icon = React.forwardRef(({ 
  className, 
  ref, 
  ...props 
}: PropsWithChildren<
{
  className?: any;
  ref: Ref<OrNull<HTMLSpanElement>>;
} & BaseProps>,) => (
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