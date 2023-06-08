import { Box, Text, Tag, TagLeftIcon, TagLabel } from '@chakra-ui/react';
import { AnimatePresence, motion } from 'framer-motion';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useHotkeys } from 'react-hotkeys-hook';
import { DotsLoader } from './dot-loader';
import { TbArrowRotaryFirstRight, TbBookDownload, TbAtom } from 'react-icons/tb';
import { GridPanel } from './cyto-react-links-card';
import _ from 'lodash';


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
  src?: string;
  containerName?: string;
  version?: string;
  isActive?: boolean; 
  typeElements?: {
    id: number;
    src?: any;
  }[];
}

export interface IPackageProps extends IPackage {
  isOpen?: boolean;
  leftIcon?: any;
  size?: string;
  borderRadius?: string;
  colorScheme?: string;
}

const Package = React.memo(({
  containerName,
  version,
  isActive,
  isOpen,
  leftIcon = TbAtom,
  size='sm',
  borderRadius='full',
}:IPackageProps,
) => {
  return (<Box 
      display='flex' 
      width='100%' 
      alignItems='center'
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
        <Text fontSize='sm' as='h2'>{containerName}</Text>
      </Box>
      <Box>
        <Tag size={size} variant='subtle' colorScheme={isActive ? 'orange' : 'blue'} borderRadius={borderRadius} sx={{verticalAlign: 'initial'}}>
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

const arrElem = [
  {
    id: 1,
    src: '#',
  },{
    id: 2,
    src: '#',
  },{
    id: 3,
    src: '#',
  },{
    id: 4,
    src: '=',
  },
]

const PackageItemAccordion = React.memo<any>(({
  id,
  containerName,
  version,
  isActive,
  typeElements = arrElem,
}:IPackage) => {
  const [expanded, setExpanded] = useState<false | number>(false);
  const isOpen = id === expanded;

  return (<>
    <Box as={motion.div}
      initial={false}
      whileHover={{ scale: 0.99, type: 'spring' }}
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
        height: '2rem',
        marginBottom: isOpen ? 0 : '0.5rem',
        p: '0.5rem',
        _last : {
          marginBottom: 0,
        }
      }}
    >
      <Package 
        containerName={containerName}
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
          sx={{transformOrigin: 'top center',}}
        >
          <GridPanel data={typeElements}  />
        </Box>
      )}
    </AnimatePresence>
  </>);
})

// const packages = [
//   {
//     id: 0,
//     name: '@deep-foundation/core/tramp-pam-pam',
//     version: '0.0.0',
//   }, 
//   {
//     id: 1,
//     name: '@deep-foundation/core/tramp-pam-pam',
//     version: '0.0.0',
//   }, 
//   {
//     id: 2,
//     name: '@deep-foundation/core/tramp-pam-pam',
//     version: '0.0.0',
//   }, 
//   {
//     id: 3,
//     name: '@deep-foundation/core/tramp-pam-pam',
//     version: '0.0.0',
//   }];

export const PackagesBlock = React.memo<any>(({packages}:{packages :IPackageProps[]}) => {
  return (<Box 
      sx={{
        w: '100%',
        p: 2,
        h: '100%',
        overflowY: 'scroll',
        overscrollBehavior: 'contain',
      }}
    >
      <Box>
        {packages && packages.map((p) => (
          <PackageItemAccordion 
            id={p.id} 
            key={p.id} 
            containerName={p.containerName}
            version={p.version}
          />
        ))}
      </Box>
    </Box>
  )
})

