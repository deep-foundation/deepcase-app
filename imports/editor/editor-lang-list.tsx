import { Box, Button, Text } from '@chakra-ui/react';
import { useDebounceCallback } from '@react-hook/debounce';
import { AnimatePresence, useCycle, motion, useAnimation } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { TbArrowRotaryFirstRight } from 'react-icons/tb';


const sideVariants = {
  closed: {
    transition: {
      staggerChildren: 0.1,
      staggerDirection: 1
    }
  },
  open: {
    y: "-11.2rem",
    transition: {
      staggerChildren: 0.1,
      staggerDirection: 1
    }
  },
  initial: {
    originY: 0,
    originX: 0,
  }
};

const itemVariants = {
  closed: {
    opacity: 0
  },
  open: { opacity: 1 }
};

const iconVariants = {
  closed: {
    rotate: 0,
    transition: {
      type: "tween",
      duration: 0.2,
      delay: 0.7
    }
  },
  open: {
    rotate: 180,
    transition: {
      type: "tween",
      duration: 0.2
    }
  }
};

export const ListLanguages = React.memo<any>(({ 
  languages = [],
  currentLanguage,
  setLanguage,
}) => {
  const [open, cycleOpen] = useCycle(false, true);

  const languagesListRef = useRef<any>(null);
  const buttonRef = useRef<any>(null);
  const [searchString, setSearchString] = useState('');

  const debouncedSearch = useDebounceCallback((search) => {
    for (let i = 0; i < languages.length; i++) {
      const l = languages[i];
      if (l.id.toLowerCase().startsWith(search)) {
        languagesListRef.current?.children[i]?.focus();
      }
    }
  }, 300);

  const handleKeyDown = (e) => {
    if (open == true && /^[a-zA-Z]$/.test(e.key)) {
      e.preventDefault();
      setSearchString(searchString + e.key.toLowerCase());
    } else if (open && e.key === 'Backspace') {
      setSearchString(searchString.slice(0, -1));
    }
  };

  useEffect(() => {
    debouncedSearch(searchString);
  }, [searchString, debouncedSearch]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [open, languages, searchString, handleKeyDown]);

  const selectLanguage = useCallback((l) => {
    setSearchString((prevLang) => prevLang == l ? 0 : l);
  }, []);

  useHotkeys('enter', e => {
    e.preventDefault();
    e.stopPropagation();
    if (searchString) {
      // @ts-ignore
      setLanguage(e.srcElement?.computedName);
      cycleOpen();
      setSearchString('');
    }
    return console.log('event', e);
  }, { enableOnTags: ["SELECT","INPUT"] });
  

  return (<>
      <Box position='relative' sx={{ height: 0, width: '100%' }}>
        <AnimatePresence>
          {open && (
            <Box
              as={motion.div}
              animate={{
                scale: 1,
                transition: { duration: 0.3, type: 'spring' }
              }}
              exit={{
                scale: 0,
                y: '2rem',
                transition: { delay: 0.7, duration: 0.3, type: 'spring' }
              }}
              sx={{
                height: '2rem',
                width: 'max-content',
                top: 0,
                left: 0,
                position: 'absolute'
              }}
            >
              <Box
                as={motion.ul}
                initial='initial'
                animate='open'
                exit='closed'
                ref={languagesListRef}
                variants={sideVariants}
                sx={{
                  borderRadius: '0.5rem',
                  position: 'relative',
                  background: 'bgColor',
                  listStyle: 'none',
                  padding: '0.5rem',
                  height: '11rem',
                  overflowY: 'scroll',
                  overscrollBehavior: 'contain',
                  filter: 'drop-shadow(0px 0px 1px #5f6977)',
                  outline: `solid 4px`,
                  outlineColor: 'bgColor',
                  outlineOffset: '-4px',
                  '&>*:not(:last-child)': {
                    pt: '0.2rem',
                    pb: '0.2rem',
                  }
                }}
              >
                {languages && languages.map(l => (
                  <Box
                    as={motion.li}
                    key={l.id}
                    role='button'
                    tabIndex={0}
                    whileHover={{ scale: 1.1, originX: 0 }}
                    variants={itemVariants}
                    onClick={() => {
                      setLanguage(l.id);
                      cycleOpen();
                      setSearchString('');
                    }}
                    _focus={{
                      p: '0.2rem 0.5rem',
                    }}
                  >
                    <Text fontSize='sm'>{l.id}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Box>
      <Box
        position='relative'
        sx={{
          height: '2rem',
          width: 'max-content',
        }}
      >
        <Box position='absolute'>
          <Button 
            ref={buttonRef}
            as={motion.button} 
            whileTap={{ scale: 0.97 }}
            bg={open == true ? 'handlersInput' : 'bgLanguagesButton' }
            onClick={() => cycleOpen()}
            sx={{
              height: '2rem',
              width: '11.2rem',
              filter: 'drop-shadow(0px 0px 1px #5f6977)',
              _hover: {
                bg: 'handlersInput'
              },
            }}
            rightIcon={<Box as={motion.div}
              variants={iconVariants}
              animate={open ? 'open' : 'closed'}
            >
              <TbArrowRotaryFirstRight />
            </Box>}
          >
            <Text fontSize='sm'>{currentLanguage}</Text>
          </Button>
        </Box>
      </Box>
    </>
  )
})