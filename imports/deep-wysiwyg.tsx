import { Box, Heading, useColorMode } from '@chakra-ui/react';
import isHotkey from 'is-hotkey';
import React, { PropsWithChildren, Ref, useCallback, useEffect, useState, useMemo, useRef } from 'react';
import { Editor, Element as SlateElement, Transforms, createEditor } from 'slate';
import { Editable, Slate, useFocused, useSlate, withReact } from 'slate-react';
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
import { motion, useAnimation } from 'framer-motion';
import { slateToHtml, htmlToSlate } from 'slate-serializers';
import { useDebounceCallback } from '@react-hook/debounce';
import { useHotkeys } from 'react-hotkeys-hook';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';

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

interface IEditor {
  fillSize?: boolean; 
  topmenu?: boolean;
  borderRadiusEditor?: number;
  borderWidthEditor?: string;
  paddingEditor?: number;
  handleKeyPress?: () => any;
  onChange?: (result: { value: string; slateValue: any; }) => any;
  value?: string;
  initialValue: any;
  onFocusChanged: (isFocused: boolean) => void;
  autoFocus?: boolean;
};

type OrNull<T> = T | null;

const LIST_TYPES = ['numbered-list', 'bulleted-list'];
const TEXT_ALIGN_TYPES = ['left', 'center', 'right', 'justify'];

const topmenuVariants = {
  initial: {
    scale: 1,
    opacity: 1,
  }, 
  hide: {
    scale: 0,
    opacity: 0,
    position: 'absolute',
    top: 0,
    transition: { 
      duration: 0.2, type: 'spring',
      top: { delay: 0.3 },
    }
  },
  show: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.2, type: 'spring' }
  }
};

const boxVariants = {
  initial: {
    height: '100%',
  }, 
  hide: {
    height: '50%',
    transition: { duration: 0.3, type: 'spring' }
  },
  show: {
    height: '100%',
    transition: { duration: 0.3, type: 'spring' }
  }
}
  
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

const FocusCatcher = ({
  onFocusChanged
}: {
  onFocusChanged: (isFocused: boolean) => void;
}) => {
  const focused = useFocused();
  useEffect(() => {
    onFocusChanged && onFocusChanged(focused);
  }, [focused]);
  return null;
};

  // Only objects editor.
export const DeepWysiwyg = React.memo<any>(({ 
  fillSize,
  topmenu,
  borderRadiusEditor = 0.5,
  borderWidthEditor = 'thin',
  paddingEditor = 1,
  handleKeyPress,
  onChange,
  value,
  initialValue = [
    {
      type: 'paragraph',
      children: [{ text: '' }],
    },
  ],
  onFocusChanged,
  autoFocus = false,
}:IEditor) => {
  const _value = useMemo(() => {
    if (typeof(value) === 'string' && !!value) {
      return htmlToSlate(value);
    } else return initialValue;
  }, [value, initialValue]);
  
  const random = Math.floor(Math.random()*16777215).toString(16);
  const [color, setColor] = useState(random);

  const renderLeaf = useCallback(props => <Leaf {...props} />, []);
  const renderElement = useCallback(props => <Element {...props} state={color} />, []);
  const [editor] = useState(() => withReact(createEditor()));
  const { colorMode } = useColorMode();
  const control = useAnimation();
  const boxControl = useAnimation();

  useEffect(() => {
    if (topmenu) {
      control.start('hide');
      boxControl.start('hide');
    } else {
      control.start('show');
      boxControl.start('show');
    }
  }, [topmenu, control, boxControl])

// const randomBorderColor = Math.floor(Math.random()*16777215).toString(16);
  return (<Box 
      // as={motion.div} animate={boxControl} variants={boxVariants} initial='initial'
      sx={{
        w: fillSize ? '100%' : '28.29rem',
        '& > * > *:nth-of-type(2)': {
        }
      }}
    >
      <Slate 
        editor={editor} 
        value={_value} 
        onChange={(value) => {
          const serializedToHtml = slateToHtml(value);
          onChange && onChange({
            value: serializedToHtml,
            slateValue: value,
          });
        }}
      >
        <FocusCatcher
          onFocusChanged={onFocusChanged}
        />
        <Box 
          as={motion.div} animate={control} 
          // @ts-ignore
          variants={topmenuVariants} 
          initial='initial'
          display='grid' 
          gridTemplateColumns='repeat(auto-fit, minmax(max-content, 1.5rem))' 
          gap='0.5rem'
          sx={{  
            backgroundColor: 'handlersInput',
            borderLeftWidth: 'thin', 
            borderTopWidth: 'thin', 
            borderRightWidth: 'thin', 
            borderLeftColor: 'borderColor', 
            borderTopColor: 'borderColor', 
            borderRightColor: 'borderColor', 
            borderRadius: '0.5rem', 
            padding: '0.5rem', 
            '& > *:hover': {
              transform: 'scale(1.15)'
            }
        }}> 
          <MarkButton colorMode={colorMode} icon={<FiBold style={{padding: '0.2rem'}} />} format='bold' />
          <MarkButton colorMode={colorMode} icon={<FiItalic style={{padding: '0.2rem'}} />} format="italic" />
          <MarkButton colorMode={colorMode} icon={<FiUnderline style={{padding: '0.2rem'}} />} format="underline" />
          <MarkButton colorMode={colorMode} icon={<FiCode style={{padding: '0.2rem'}} />} format="code" />
          
          <BlockButton colorMode={colorMode} format="heading-one" icon={<TbNumber1 style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="heading-two" icon={<TbNumber2 style={{padding: '0.2rem'}} />} />
          <BlockButton 
            colorMode={colorMode} 
            format="block-quote" 
            icon={<TbQuote style={{padding: '0.2rem'}} />} 
            setColor={() => setColor(random)}
          />
          <BlockButton colorMode={colorMode} format="numbered-list" icon={<TbListNumbers style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="bulleted-list" icon={<TbList style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="left" icon={<CiTextAlignLeft style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="center" icon={<CiTextAlignCenter style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="right" icon={<CiTextAlignRight style={{padding: '0.2rem'}} />} />
          <BlockButton colorMode={colorMode} format="justify" icon={<CiTextAlignJustify style={{padding: '0.2rem'}} />} />
        </Box>
        {/* <Box > */}
          <Editable 
            style={{ 
              borderWidth: borderWidthEditor, 
              borderColor: colorMode === 'light' ? '#d2cece' : '#718096', 
              borderRadius: `${borderRadiusEditor}rem`, 
              padding: `${paddingEditor}rem`, 
              backgroundColor: colorMode === 'light' ? 'white' : '#111720' }}
            spellCheck
            autoFocus={autoFocus}
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
              handleKeyPress
            }}
          />
        {/* </Box> */}
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

export function useStringSaver(link): {
  value: string;
  setValue: (value: string) => void;
  onFocusChanged: (isFocused: boolean) => void;
} {
  const deep = useDeep();
  const [value, setValue] = useState(link?.value?.value || '');
  const focusedRef = useRef(false);
  const save = async (value) => {
    try {
      if (!link.value) deep.insert({
        link_id: link.id, value,
      }, { table: 'strings' });
      deep.update({ link_id: link.id }, { value }, { table: 'strings' });
    } catch(error) {}
  };
  const saveDebounced = useDebounceCallback(async(value) => {
    await save(value);
  }, 500);
  useEffect(() => {
    if (focusedRef.current) saveDebounced(value);
  }, [value]);
  useEffect(() => {
    console.log('on link value change', { focused: focusedRef.current, value: link?.value?.value });
    if (!focusedRef.current) setValue(link?.value?.value);
  }, [link?.value?.value]);
  const onFocusChanged = useCallback((isFocused) => {
    focusedRef.current = isFocused;
  }, []);
  return {
    value,
    setValue,
    onFocusChanged,
  };
}