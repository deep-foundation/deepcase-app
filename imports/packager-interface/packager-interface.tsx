import React, { useEffect, useRef, useState } from 'react';
import { Box, Button, Flex, IconButton, Input, InputGroup, InputRightElement, Spacer } from '@chakra-ui/react';
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
  return `https://registry.npmjs.com/-/v1/search?text=${textParameter}`;
};
const makePackagesSearchResults = (deep, packageNamespaceTypeId, packageVersionTypeId, packageActiveTypeId, remotePackages, areLinksPrefetched) => {
  const installedPackages = [];
  const notInstalledPackages = [];
  if (remotePackages?.length > 0 && areLinksPrefetched) {
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
      if (namespaceId) {
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
  return { installedPackages, notInstalledPackages };
}

export const PackagerInterface = React.memo<any>(({
  toggle,
  // search, 
  // onSearch,
  onClose,
}:{
  toggle?: boolean;
  // search?: any;
  // onSearch?: any;
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
  console.log('PackagerInterface', 'data', data)
  console.log('PackagerInterface', 'loading', loading)
  console.log('PackagerInterface', 'error', error)

  const packageNamespaceTypeId = deep.idLocal('@deep-foundation/core', 'PackageNamespace');
  const packageVersionTypeId = deep.idLocal('@deep-foundation/core', 'PackageVersion');
  const packageActiveTypeId = deep.idLocal('@deep-foundation/core', 'PackageActive');
  const { data: prefetched } = deep.useDeepSubscription({
    type_id: { _in: [packageNamespaceTypeId, packageVersionTypeId, packageActiveTypeId ] }
  });
  console.log('PackagerInterface', 'prefetched?.length', prefetched?.length)
  const { installedPackages, notInstalledPackages } = makePackagesSearchResults(deep, packageNamespaceTypeId, packageVersionTypeId, packageActiveTypeId, data?.objects, prefetched?.length > 0);

  console.log('search-results', installedPackages, notInstalledPackages)
  const [togglePackager, setTogglePackager] = useState(false);

  return (<Box float='right' mr='8' mt='4' pos='relative'>
      <Button colorScheme='blue' onClick={() => setTogglePackager(true)} pos='absolute' right={4}>packager</Button>
      <Appearance 
        toggle={togglePackager} 
      >
        <Box border='1px' borderColor='gray.300' borderRadius='1.2rem' w='35.5rem' bg='gray.50'>
          <Flex 
            minWidth='max-content' 
            alignItems='center' gap='2' 
          >
            <InputGroup size='xs' pl='2'>
              <Input 
                ref={inputRef}
                placeholder='search' 
                sx={{borderRadius: 'full'}}
                focusBorderColor='primary'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              <InputRightElement children={<BsSearch color='green.500' />} />
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