import { Box, Stack, IconButton, HStack } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { useDebounceCallback } from '@react-hook/debounce';
import { motion, useAnimation } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { BsCheck2, BsLightbulbFill, BsLightbulbOff } from 'react-icons/bs';
import { EditorTextArea } from '../editor/editor-textarea';
import { CustomizableIcon } from '../icons-provider';
import { Resize } from '../resize';


const variants = {
  view: {
    opacity: 1,
    scale: 1,
    originX: 1,
    // originY: 1,
    transition: {
      duration: 1,
      delay: 0.3,
      scale: { delay: 0.5, }
    }
  },
  hide: {
    originX: 1,
    opacity: 0,
    scale: 0,
    transition: {
      // duration: 0.25,
    }
  }
};

const stackVariants = {
  outside: {
    x: '0%',
    opacity: 1,
    scale: 1,
    originX: 0,
    transition: {
      type: 'spring',

      duration: 0.5,
      delay: 0.2,
      scale: { delay: 0.3, }
    }
  },
  nested: {
    x: '-100%',
    opacity: 1,
    scale: 1,
    originX: 1,
    transition: {
      type: 'spring',
      duration: 0.5,
      delay: 0.2,
      scale: { delay: 0.3, }
    }
  },
  initial: {
    x: '0%',
    opacity: 0,
    scale: 0,
  }
};

export const QueryClientHandler = React.memo<any>(({nested = false}:{nested?: boolean;}) => {
  const [viewSize, setViewSize] = useState({width: 200, height: 150});
  const [save, setSave] = useState(false);
  const [value, setValue] = useState(false);
  const [active, setActive] = useState(false);
  const control = useAnimation();
  const controlStack = useAnimation();
  
  useEffect(() => {
    import('@monaco-editor/react').then(m => {});
    const loading = setTimeout(() => {
      if (save === true) setSave(false);
    }, 3000);
    return () => clearTimeout(loading);
  }, [save]);
  
  useEffect(() => {
    if (value === true) {
      control.start('view')
    } else {
      control.start('hide')
    };
    if (nested === true) {
      controlStack.start('nested')
    } else {
      controlStack.start('initial')
      controlStack.start('outside')
    };

  }, [control, controlStack, value, nested])
  
  const terminalBorderWidth = viewSize.width - 1;
  const terminalBorderHeight = viewSize.height - 1;
  const stackHeight = viewSize.height - 2;

  return (
    <Resize 
      size={viewSize} 
      onChangeSize={(viewSize) => setViewSize(viewSize)} 
      style={{
        position: 'relative',
        overflow: nested ? 'hidden' : 'inherit',
        borderRadius: 5
      }}
    >
      <Box 
        display='grid' 
        gridTemplateColumns='1fr 
        auto' 
        gridRow='1 / 2'
        height='inherit'
      >
        <Box
          overflow='hidden' sx={{ borderRadius: 5 }}
          w={terminalBorderWidth}
          h={terminalBorderHeight}
          // w={199}
          // h={149}
        >
          <EditorTextArea 
            minimap={false} 
            lineNumbers='off' 
            onChange={(value) => setValue(true)}
            onSave={() => setSave(true)}
          />
        </Box>
        <Box
          as={motion.div}
          animate={controlStack}
          variants={stackVariants}
          initial='initial'
          height={stackHeight}
          display='flex'
          justifyContent='space-between'
          flexDirection='column'
          ml={nested ? 0 : '0.2rem'}
        >
          <IconButton 
            as={motion.div}
            variants={variants}
            initial='hide'
            whileInView='view'
            animate='view'
            aria-label='activate/inactivate button' 
            isRound
            variant='outline'
            sx={{ borderColor: active ? '#111' : 'rgb(0, 128, 255)' }}
            mr={nested ? '0.2rem' : 0}
            mt={nested ? '0.2rem' : 0}
            size='xs'
            onClick={() => setActive(!active)}
            icon={active ? <BsLightbulbOff /> : <CustomizableIcon Component={BsLightbulbFill} value={{ color: 'rgb(0, 128, 255)' }} />}
          />
           <IconButton 
            as={motion.div}
            variants={variants}
            initial='hide'
            animate={control}
            whileInView='view'
            aria-label='save button' 
            isRound
            variant='outline'
            sx={{ borderColor: 'rgb(0, 128, 255)' }}
            mr={nested ? '0.2rem' : 0}
            mb={nested ? '0.2rem' : 0}
            isLoading={save}
            size='xs'
            icon={<CustomizableIcon Component={BsCheck2} value={{ color: 'rgb(0, 128, 255)' }} />}
            onClick={() => setSave(true)}
          />
        </Box>
      </Box>
    </Resize>)
})
