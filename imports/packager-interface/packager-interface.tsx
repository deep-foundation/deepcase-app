import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Flex, IconButton, Input, InputGroup, InputRightElement, Spacer, useColorModeValue } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { Appearance } from '../component-appearance';
import { BsSearch } from 'react-icons/bs';
import { SlClose } from 'react-icons/sl';
import { TabComponent } from './packager-interface-tabs-content';
import { TabsPackages } from './packager-interface-tabs-menu';
import { combinedPackagesSearch } from '../../pages/api/packager';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';

const axiosHooks = require("axios-hooks");
const axios = require("axios");
const useAxios = axiosHooks.makeUseAxios({ axios: axios.create() });
const makeNpmPackagesUrl = (query) => {
  const deepPackageKeyword = 'deep-package';
  const textParameter = encodeURIComponent(`${query} keywords:${deepPackageKeyword}`);
  return `https://registry.npmjs.com/-/v1/search?text=${textParameter}&size=250`;
};
const makePackagesSearchResults = (deep, packageNamespaceTypeId, packageVersionTypeId, packageActiveTypeId, remotePackages, areLinksPrefetched) => {
  const installedPackages = [];
  const notInstalledPackages = [];
  if (remotePackages?.length > 0) {
    if (areLinksPrefetched && deep.minilinks.byType[packageNamespaceTypeId] && deep.minilinks.byType[packageVersionTypeId] && deep.minilinks.byType[packageActiveTypeId]) {
      const namespacesByName = {};
      for (const namespace of deep.minilinks.byType[packageNamespaceTypeId]) {
        const name = namespace?.value?.value;
        if (name) namespacesByName[name] = namespace;
      }
      const versionsByNamespaceId = {};
      for (const version of deep.minilinks.byType[packageVersionTypeId]) {
        versionsByNamespaceId[version.from_id] = [...(versionsByNamespaceId?.[version.from_id] || []), version];
      }
      const isActiveByPackageId = {}
      for (const packageActive of deep.minilinks.byType[packageActiveTypeId]) {
        isActiveByPackageId[packageActive.to_id] = true;
      }
      for (const remotePackage of remotePackages) {
        const name = remotePackage.package.name;
        const namespaceId = namespacesByName[name]?.id;
        if (namespaceId && versionsByNamespaceId[namespaceId]) {
          const versions = versionsByNamespaceId[namespaceId].map(version => ({
            packageId: version?.to_id,
            version: version?.value?.value, 
            isActive: isActiveByPackageId[version?.to_id]
          }));
          installedPackages.push({ localPackage: { namespaceId, name, versions }, remotePackage });
        } else {
          notInstalledPackages.push({ remotePackage });
        }
      };
    }
    else 
    {
      // + gives user an ability to see only remote packages even without permissions to see installed packages
      // - it can give false impression that installed package is not installed
      for (const remotePackage of remotePackages) {
        notInstalledPackages.push({ remotePackage });
      };
    }
  }
  return { installedPackages, notInstalledPackages };
}

const variants = {
  show: {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    borderRadius: '0%',
    display: 'block',
    transition: { duration: 0.5 }
  },
  hide: {
    scaleX: 0.3,
    scaleY: 0.1,
    opacity: 0,
    borderRadius: '50%',
    display: 'none',
    transition: { 
      duration: 0.5,
      display: { delay: 0.6 }, 
      opacity: { duration: 0.4 },
    }
  },
  initial: {
    originX: 1,
    originY: 0,
    scaleX: 0,
    scaleY: 0,
    opacity: 0,
    display: 'none'
  }
}

export const PackagerInterface = React.memo<any>(({
  toggle,
  onClose,
}:{
  toggle?: boolean;
  onClose?: () => any;
}) => {
  const inputRef = useRef(null);

  const [search, setSearch] = useState('');

  useEffect(() => {
    inputRef.current.focus();
  })

  const deep = useDeep();

  const [ variant, setSelectedVariant ] = useState(0);

  const [{ data, loading, error }, refetch] = useAxios(makeNpmPackagesUrl(search));
  // console.log('PackagerInterface', 'data', data)
  // console.log('PackagerInterface', 'loading', loading)
  // console.log('PackagerInterface', 'error', error)

  const packageNamespaceTypeId = deep.idLocal('@deep-foundation/core', 'PackageNamespace');
  const packageVersionTypeId = deep.idLocal('@deep-foundation/core', 'PackageVersion');
  const packageActiveTypeId = deep.idLocal('@deep-foundation/core', 'PackageActive');
  const { data: prefetched } = deep.useDeepSubscription({
    type_id: { _in: [packageNamespaceTypeId, packageVersionTypeId, packageActiveTypeId ] }
  });
  // console.log('PackagerInterface', 'prefetched?.length', prefetched?.length)
  const { installedPackages, notInstalledPackages } = makePackagesSearchResults(deep, packageNamespaceTypeId, packageVersionTypeId, packageActiveTypeId, data?.objects, prefetched?.length > 0);

  // console.log('search-results', installedPackages, notInstalledPackages)
  const [togglePackager, setTogglePackager] = useState(false);
  const bg = useColorModeValue('blue.50', 'blue.900');
  const color = useColorModeValue('white', 'gray.800');
  const borderColor = useColorModeValue('#d2cece', '#718096');

  return (<Box right={0} mr='8' mt='4' pos='fixed'>
      <Button colorScheme='blue' onClick={() => setTogglePackager(true)} pos='absolute' right={4}>packager</Button>
      <Appearance 
        toggle={togglePackager} 
        variantsAnimation={variants} 
        initial='initial'
      >
        <Box borderWidth='thin' borderColor={borderColor} borderRadius='1.2rem' w='35.5rem' bg={bg} sx={{ height: 'calc(100vh - 3rem)' }} overflow='hidden'>
          <Flex 
            minWidth='max-content' 
            alignItems='center' gap='2' 
          >
            <InputGroup size='xs' pl='2'>
              <Input 
                borderColor='gray.400'
                bg='whiteAlpha.50'
                ref={inputRef}
                color='gray.300'
                placeholder='search' 
                sx={{borderRadius: 'full'}}
                focusBorderColor='primary'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputRightElement children={<BsSearch color='#718096' />} />
            </InputGroup>
            <Spacer />
            <IconButton 
              aria-label='packager window close' 
              variant='ghost' 
              colorScheme='current'
              isRound 
              icon={<SlClose />} 
              onClick={() => setTogglePackager(false)} 
            />
          </Flex>
          <TabsPackages 
            selectedTab={variant}
            onSelectMode={(e) => setSelectedVariant(variant => variant === 0 ? 1 : 0)}
            quantityInstall={installedPackages.length}
            quantityUninstalled={notInstalledPackages.length}
          />
          <TabComponent 
            variant={variant}
            installedPackages={installedPackages}
            notInstalledPackages={notInstalledPackages}
          />
        </Box>
      </Appearance>
    </Box>
  )
})