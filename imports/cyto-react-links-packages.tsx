import { Box, Text, Tag, TagLeftIcon, TagLabel } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { DotsLoader } from './dot-loader';
import { TbArrowRotaryFirstRight, TbBookDownload, TbAtom } from 'react-icons/tb';

const TypeExample = () => <Box className="type" sx={{ w: '3rem', height: '3rem', bg: 'sendMessagePlane' }} />;

export const OneLink = React.memo<any>(() => {
  return (<Box as={motion.div}
    variants={{ collapsed: { scale: 0.8 }, open: { scale: 1 } }}
    // @ts-ignore
    transition={{ duration: 0.8 }}
    sx={{
      padding: '20px',
      transformOrigin: 'top center',
    }}
  >
    <TypeExample />
  </Box>);
})

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
export interface IPackage {
  id?: number;
  name: string;
  version: string;
  packageId?: number;
  isActive?: boolean; 
}

interface IPackageProps extends IPackage {
  isOpen?: boolean;
  leftIcon?: any;
  size?: string;
  borderRadius?: string;
  colorScheme?: string;
}

const Package = React.memo(({
  name,
  version,
  isActive,
  isOpen,
  leftIcon = TbAtom,
  size='sm',
  borderRadius='full',
  colorScheme = 'blue'
}:IPackageProps,
) => {
  return (<Box 
      display='flex' 
      width='100%' 
      alignItems='center'
      sx={{
        '& > *:not(:last-child)': {
          mr: '0.5rem'
        }
      }}
    >
      <Box as={motion.div}
        role='h2'
        width='100%'
        // animate={animate}
        // variants={variants}
        // transition={transition}
        sx={{
          justifyContent: 'flex-start',
          p: 0,
          fontSize: 'sm',
        }}
      >
        <Text fontSize='sm' as='h2'>{name}</Text>
      </Box>
      <Box>
        <Tag size={size} variant='subtle' colorScheme={colorScheme} borderRadius={borderRadius} sx={{verticalAlign: 'initial'}}>
          <TagLeftIcon as={leftIcon} />
          <TagLabel>{version}</TagLabel>
        </Tag>
      </Box>
      <Box 
        as={motion.div}
        variants={iconVariants}
        animate={isOpen ? "open" : "closed"}
      >
        <TbArrowRotaryFirstRight />
      </Box>
    </Box>
  )
})

export const PackageItemAccordion = React.memo<any>(({
  id,
  name,
  version,
  isActive,
}:IPackage) => {
  const [expanded, setExpanded] = useState<false | number>(0);
  const isOpen = id === expanded;

  return (<>
    <Box as={motion.div}
      initial={false}
      // animate={{ backgroundColor: isOpen ? 'switchOff' : 'switchOn' }}
      onClick={() => setExpanded(isOpen ? false : id)}
      sx={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        background: 'backgroundModal',
        borderRadius: '0.5rem',
        borderWidth: 'thin',
        borderColor: 'borderInputMessage',
        color: 'text',
        cursor: 'pointer',
        height: '3rem',
        marginBottom: isOpen ? '0' : '0.5rem',
        p: '0.5rem',
      }}
    >
      <Package 
        name={name}
        version={version}
        isActive={isActive}
        isOpen={isOpen}
      />
    </Box>
    <AnimatePresence initial={false}>
      {isOpen && (
        <Box as={motion.section}
          key='content'
          initial='collapsed'
          animate='open'
          exit='collapsed'
          variants={{
            open: { opacity: 1, height: 'auto' },
            collapsed: { opacity: 0, height: 0 }
          }}
          // @ts-ignore
          transition={{ duration: 0.8, ease: [0.04, 0.62, 0.23, 0.98] }}
        >
         <OneLink />
        </Box>
      )}
    </AnimatePresence>
  </>);
})

const packages = [
  {
    id: 0,
    name: '@deep-foundation/core/tramp-pam-pam',
    version: '0.0.0',
  }, 
  {
    id: 1,
    name: '@deep-foundation/core/tramp-pam-pam',
    version: '0.0.0',
  }, 
  {
    id: 2,
    name: '@deep-foundation/core/tramp-pam-pam',
    version: '0.0.0',
  }, 
  {
    id: 3,
    name: '@deep-foundation/core/tramp-pam-pam',
    version: '0.0.0',
  }];

export const PackagesBlock = React.memo<any>(() => {
  return (<Box 
      // as={motion.section}
      // animate={controlUninstalled}
      // variants={variantsUninstalled}
      // initial='initial'
      // exit='initial'
      sx={{
        w: '100%',
        p: 2,
        h: 'calc(100% - 5rem)',
        overflowY: 'scroll',
        overscrollBehavior: 'contain',
      }}
    >
      <Box 
        // as={motion.ul} 
        // variants={variantsPackages} 
        sx={{
          '& > *:not(:last-child)':{
            mb: 1
          },
        }}
      >
      {packages.map((p, i) => (
        <PackageItemAccordion 
          id={p.id} 
          key={i} 
          name={p.name}
          version={p.version}
        />
      ))}
      </Box>
    </Box>
    // accordionIds.map((i) => (
    // ))
  )
})

