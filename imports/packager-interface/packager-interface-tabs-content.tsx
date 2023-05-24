import React, { useCallback, useEffect, useRef, useState } from 'react';
import { RiInstallLine, RiUninstallLine } from 'react-icons/ri';
import { AnimatePresence, DeprecatedLayoutGroupContext, animate, motion, useAnimation, useCycle } from 'framer-motion';
import { Box, Button, Divider, Flex, HStack, List, ListItem, Select, Spacer, Text, useColorModeValue } from '@chakra-ui/react';
import { Install } from "./icons/install";
import { TbArrowRotaryFirstRight, TbBookDownload } from 'react-icons/tb';
import { TagLink } from '../tag-component';
import _ from 'lodash';
import { useSpaceId } from "../hooks";
import { useDeep } from '@deep-foundation/deeplinks/imports/client';

const axiosHooks = require("axios-hooks");
const axios = require("axios");
const useAxios = axiosHooks.makeUseAxios({ axios: axios.create() });


const variantsPackages = {
  open: {
    transition: { staggerChildren: 0.07, delayChildren: 0.2 }
  },
  closed: {
    transition: { staggerChildren: 0.05, staggerDirection: -1 }
  }
};

const variantsPackage = {
  open: {
    y: 0,
    opacity: 1,
    transition: {
      y: { stiffness: 1000, velocity: -100 }
    }
  },
  closed: {
    y: 50,
    opacity: 0,
    transition: {
      y: { stiffness: 1000 }
    }
  }
};

export interface IPackageInstalledVersion {
  id: number;
  version: string;
  packageId: number;
  isActive: boolean; 
}

export interface IPackage {
  id: number;
  name: string;
  description?: any;
  versions?: IPackageInstalledVersion[];
}

interface IPackageProps extends IPackage {
  i?: number;
  expanded?: boolean | number;
  onOpen?: (e: any) => any;
  style?: any;
  animate?: any;
  variants?: any;
  transition?: any;
  latestVersion?: string;
}

export type Package = IPackage[];

const itemVariants = {
  closed: {
    opacity: 0
  },
  open: { opacity: 1 }
};

const sideVariants = {
  closed: {
    transition: {
      staggerChildren: 0.1,
      staggerDirection: 1
    }
  },
  open: {
    y: "2.5rem",
    transition: {
      staggerChildren: 0.1,
      staggerDirection: 1
    }
  }
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

export const ListVersions = React.memo<any>(({ 
  name,
  latestVersion,
  currentVersion,
  bg,
  setCurrentVersion
}) => {
  const [open, cycleOpen] = useCycle(false, true);

  const [{ data, loading, error }, refetch] = useAxios(`https://registry.npmjs.com/${name}`);
  const versions = data ? Object.keys(data.versions) : [latestVersion];
  var collator = new Intl.Collator(undefined, {numeric: true, sensitivity: 'base'});
  versions.sort(collator.compare);

  return (<>
      <Box position="relative" sx={{ height: 0, width: "7rem" }}>
        <AnimatePresence>
          {open && (
            <Box
              as={motion.div}
              animate={{
                scale: 1,
                transition: { duration: 0.3, type: "spring" }
              }}
              exit={{
                scale: 0,
                y: "2rem",
                transition: { delay: 0.7, duration: 0.3, type: "spring" }
              }}
              sx={{
                height: "2rem",
                width: "7rem",
                top: 0,
                left: 0,
                position: "absolute"
              }}
            >
              <Box
                as={motion.ul}
                initial="closed"
                animate="open"
                exit="closed"
                variants={sideVariants}
                sx={{
                  borderRadius: "0.5rem",
                  position: "relative",
                  zIndex: 44,
                  background: bg,
                  listStyle: "none",
                  padding: '0.5rem',
                  height: '11rem',
                  overflowY: 'scroll',
                  overscrollBehavior: 'contain',
                  filter: 'drop-shadow(0px 0px 1px #5f6977)',
                  outline: `solid 4px`,
                  outlineColor: 'colorOutline',
                  outlineOffset: '-4px',
                  '&>*:not(:last-child)': {
                    pt: '0.2rem',
                    pb: '0.2rem',
                  }
                }}
              >
                {versions && versions.map(v => (
                  <Box
                    as={motion.li}
                    key={v}
                    whileHover={{ scale: 1.1 }}
                    variants={itemVariants}
                    // sx={{ color: "#131111" }}
                    onClick={() => {
                      setCurrentVersion(v);
                      cycleOpen();
                    }}
                  >
                    <Text fontSize='sm'>{v}</Text>
                  </Box>
                ))}
              </Box>
            </Box>
          )}
        </AnimatePresence>
      </Box>
      <Box
        position="relative"
        sx={{
          height: "2rem",
          width: "max-content",
        }}
      >
        <Box position="absolute">
          <Button 
            as={motion.button} 
            bg={bg} 
            onClick={() => cycleOpen()}
            sx={{
              height: '2rem',
              width: '7rem',
              filter: 'drop-shadow(0px 0px 1px #5f6977)',
            }}
            rightIcon={<Box as={motion.div}
            variants={iconVariants}
            animate={open ? "open" : "closed"}
            >
              <TbArrowRotaryFirstRight />
            </Box>}
          >
            <Text fontSize='sm'>{currentVersion}</Text>
          </Button>
        </Box>
      </Box>
    </>
  )
})

export const PackageItem = React.memo<any>(function PackageItem({
  id,
  expanded, 
  onOpen, 
  name, 
  description,
  versions, 
  animate,
  style,
  variants = {},
  transition = {},
  latestVersion = "0.0.0",
}:IPackageProps) {
  const deep = useDeep();
  const [spaceId, setSpaceId] = useSpaceId();
  const [currentVersion, setCurrentVersion] = useState(latestVersion);

  return (<Box 
      as={motion.li} 
      variants={variantsPackage} 
      sx={{
        listStyle: "none", 
        background: 'transparent', 
        p: 1, 
        borderRadius: '0.5rem',
        borderWidth: 'thin',
        borderColor: 'gray.500',
        '& > *:not(:last-of-type)': {
          mb: '0.5rem',
        }
      }}
      >
        <Flex>
          <Box as={motion.div}
            role='h2'
            width='100%'
            animate={animate}
            variants={variants}
            transition={transition}
            sx={{
              justifyContent: 'flex-start',
              p: 0,
              fontSize: 'sm',
              ...style
            }}
          ><Text fontSize='sm' as='h2'>{name}</Text></Box>
          <Box pos='relative'>
            <ListVersions name={name} latestVersion={latestVersion} currentVersion={currentVersion} setCurrentVersion={setCurrentVersion} bg='bgColor' />
          </Box>
        </Flex>
        <Flex 
          alignItems='center' 
          justify='space-between'
        >
          {description && <Box as={motion.div}
            width='100%'
            animate={animate}
            variants={variants}
            transition={transition}
            sx={{
              justifyContent: 'flex-start',
              p: 0,
              fontSize: 'sm',
              // color: color,
              mr: 2,
              ...style
            }}
          ><Text fontSize='sm'>{description}</Text></Box>}
          <TagLink version='install' leftIcon={TbBookDownload} size='sm' onClick={async (e) => {
            e.preventDefault();
            await deep.insert({
              type_id: await deep.id('@deep-foundation/core', 'PackageQuery'),
              string: { data: { value: `${name}@${currentVersion}` }},
              in: {
                data: [
                  {
                    type_id: await deep.id('@deep-foundation/core', 'Contain'),
                    from_id: deep.linkId,
                  },
                  {
                    type_id: await deep.id('@deep-foundation/npm-packager', 'Install'),
                    from_id: deep.linkId,
                    in: {
                      data: {
                        type_id: await deep.id('@deep-foundation/core', 'Contain'),
                        from_id: deep.linkId,
                      }
                    }
                  }
                ]
              }
            })
          }} />
        </Flex>

      {versions && <Divider />}
      {versions && <Text fontSize='xs' sx={{ mb: '0.2rem' }}>Installed Versions:</Text>}
      {versions && <Box sx={{
          float: 'revert', 
          '& > *:not(:last-of-type)': {
            mr: 2
          }
        }}>
        {versions && versions.map((c, i) =>(
          <TagLink 
            version={c.version} 
            key={c.packageId} 
            colorScheme={c.isActive ? 'orange' : 'blue'} 
            onClick={(e) => { 
              e.preventDefault(); 
              setSpaceId(c.packageId);  
            }} />
        ))}
      </Box>}
    </Box>
  )
})

const variantsInstall = {
  show: { opacity: 1, x: '0%' },
  hide: { opacity: 0, x: '-100%' },
  initial: { opacity: 1, x: '0%' },
}
const variantsUninstalled = {
  show: { opacity: 1, x: '0%' },
  hide: { opacity: 0, x: '-100%' },
  initial: { opacity: 0, x: '-100%' },
}

export const TabComponent = React.memo<any>(({ 
  variant = 0,
  installedPackages = [], 
  notInstalledPackages,
}:{ 
  variant?: number,
  installedPackages: any[]; 
  notInstalledPackages: any[]; 
}) => {
  const [expanded, setExpanded] = useState(false);
  const controlInstall = useAnimation();
  const controlUninstalled = useAnimation();

  useEffect(() => {
    if (variant === 0) {
      controlInstall.start("show"); 
      controlUninstalled.start("hide");
    } else {
      controlUninstalled.start("show");
      controlInstall.start("hide"); 
    }
  }, [controlInstall, controlUninstalled, variant]);

  return (<AnimatePresence initial={false}>
      {variant === 0 ? <Box 
        as={motion.section}
        animate={controlInstall}
        variants={variantsInstall}
        initial='initial'
        exit='initial'
        sx={{
          w: '100%',
          p: 2,
          h: 'calc(100% - 5rem)',
          overflowY: 'scroll',
          overscrollBehavior: 'contain',
        }}
      >
        <Box 
          as={motion.ul} 
          variants={variantsPackages} 
          sx={{
            '& > *:not(:last-child)':{
              mb: 2
            },
          }}
        >
          {installedPackages.map((p, i) => (
            <PackageItem 
              key={p.localPackage.namespaceId}
              id={p.localPackage.namespaceId}
              expanded={expanded}
              onOpen={(e) => {
                if (e.target.value == p.localPackage.namespaceId) setExpanded(!expanded)
              }}
              name={p.localPackage.name}
              description={p.remotePackage.package.description}
              latestVersion={p.remotePackage.package.version}
              versions={p.localPackage.versions}
            />
          ))}
        </Box>
      </Box>
      : variant === 1 ? <Box 
        as={motion.section}
        animate={controlUninstalled}
        variants={variantsUninstalled}
        initial='initial'
        exit='initial'
        sx={{
          w: '100%',
          p: 2,
          h: 'calc(100% - 5rem)',
          overflowY: 'scroll',
          overscrollBehavior: 'contain',
        }}
      >
        <Box 
          as={motion.ul} 
          variants={variantsPackages} 
          sx={{
            '& > *:not(:last-child)':{
              mb: 1
            },
          }}
        >
          {notInstalledPackages.map((p, i) => (
            <PackageItem 
              key={p.remotePackage.package.name}
              id={p.remotePackage.package.name}
              expanded={expanded}
              onOpen={(e) => {
                if (e.target.value == p.remotePackage.package.name) setExpanded(!expanded)
              }}
              name={p.remotePackage.package.name}
              description={p.remotePackage.package.description}
              latestVersion={p.remotePackage.package.version}
            />
          ))}
        </Box>
      </Box> : null}
    </AnimatePresence>
  )
});
