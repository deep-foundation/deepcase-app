import { Box, HStack, IconButton } from '@chakra-ui/react';
import { useLocalStore } from '@deep-foundation/store/local';
import { useDebounceCallback } from '@react-hook/debounce';
import { motion } from 'framer-motion';
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
    originY: 1,
    transition: {
      duration: 1,
      delay: 0.3,
      scale: { delay: 0.5, }
    }
  },
  hide: {
    opacity: 0, scale: 0,
    transition: {
      // duration: 0.25,
    }
  }
};

export const QueryClientHandler = React.memo<any>(({nested = false}:{nested?: boolean;}) => {
  const [viewSize, setViewSize] = useState({width: 200, height: 150});
  const [save, setSave] = useState(false);
  const [value, setValue] = useState(false);
  const [active, setActive] = useState(false);
  
  useEffect(() => {
    import('@monaco-editor/react').then(m => {});
    const loading = setTimeout(() => {
      if (save === true) setSave(false);
    }, 3000);
    return () => clearTimeout(loading);
  }, [save]);

  return (<Box
    pos='relative' 
    width='max-content'
  >
    <HStack
      height='100%'
      justify='flex-end'
      mb={2}
      sx={
        nested ? {
          position: 'absolute',
          bottom: 0,
          right: '0.375rem',
          zIndex: 1,
          height: 'max-content'
        } : null
      }
    >
      { value   
        ?<IconButton 
          as={motion.div}
          variants={variants}
          initial='hide'
          whileInView='view'
          aria-label='save button' 
          isRound
          variant='outline'
          sx={{ borderColor: 'rgb(0, 128, 255)' }}
          isLoading={save}
          size='xs'
          icon={<CustomizableIcon Component={BsCheck2} value={{ color: 'rgb(0, 128, 255)' }} />}
          onClick={() => setSave(true)}
        />
        : null
      }
      <IconButton 
        as={motion.div}
        variants={variants}
        initial='hide'
        whileInView='view'
        aria-label='activate/inactivate button' 
        isRound
        variant='outline'
        sx={{ borderColor: active ? '#111' : 'rgb(0, 128, 255)' }}
        size='xs'
        onClick={() => setActive(!active)}
        icon={active ? <BsLightbulbOff /> : <CustomizableIcon Component={BsLightbulbFill} value={{ color: 'rgb(0, 128, 255)' }} />}
      />
    </HStack>
    <Resize 
      size={viewSize} 
      onChangeSize={(viewSize) => setViewSize(viewSize)} 
      style={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 5
      }}
    >
      <EditorTextArea 
        minimap={false} 
        lineNumbers='off' 
        onChange={(value) => setValue(true)}
        onSave={() => setSave(true)}
      />
    </Resize>
  </Box>)
})
