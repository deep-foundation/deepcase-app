import { ExternalLinkIcon } from '@chakra-ui/icons';
import { Box, Button, Input, Link, VStack } from '@chakra-ui/react';
import React, { useState } from 'react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';

const axiosHooks = require("axios-hooks");
const axios = require("axios");
const useAxios = axiosHooks.makeUseAxios({ axios: axios.create() });

export const PackagePublisher = () => {

  const deep = useDeep();

  const packageId = 742;

  const packageTypeId = deep.idLocal('@deep-foundation/core', 'Package');
  const packageNamespaceTypeId = deep.idLocal('@deep-foundation/core', 'PackageNamespace');
  const packageVersionTypeId = deep.idLocal('@deep-foundation/core', 'PackageVersion');
  const { data: prefetched } = deep.useDeepSubscription({
    type_id: { _in: [packageTypeId, packageNamespaceTypeId, packageVersionTypeId ] }
  });

  const pkg = deep.minilinks.byId[packageId];
  const pkgVersion = pkg?.in?.filter(v => v.type_id === packageVersionTypeId)?.[0];
  const pkgVersionValue = pkgVersion?.value?.value || "";
  const packageNamespaceId = pkgVersion?.from_id;

  const packageName = pkg?.value?.value || "";

  const [currentPackageName, setCurrentPackageName] = useState(packageName);
  const [currentPackageVersion, setCurrentPackageVersion] = useState(pkgVersionValue);

  let packageUrl = `https://registry.npmjs.com/${currentPackageName}`;

  const [{ data, loading, error }, refetch] = useAxios(packageUrl);

  console.log(`useAxios(packageUrl)`, data, loading, error);

  if (!data) {
    packageUrl = undefined;
  }

  return (<Box maxW='md' borderColor='gray.400' borderWidth='1px' borderRadius='lg' overflow='hidden'>
      {packageUrl ? <Link fontSize='xs' href={packageUrl} p={2} isExternal>
        {packageUrl} <ExternalLinkIcon mx='2px' />
      </Link> : null}
      <VStack p={2}>
        <Input 
          placeholder='package name'
          value={currentPackageName}
          borderColor='gray.300'
          size='sm'
          onChange={(e) => setCurrentPackageName(e.target.value)}
          />
        <Input 
          placeholder='package version'
          value={currentPackageVersion}
          borderColor='gray.300'
          size='sm'
          onChange={(e) => setCurrentPackageVersion(e.target.value)}
          />
        <Button colorScheme='blue' size='sm' w='100%' onClick={async () => {
          if (!packageNamespaceId && currentPackageName) {
            const { data: [{ id: namespaceId }] } = await deep.insert({
              type_id: packageNamespaceTypeId,
              string: { data: { value: currentPackageName } },
            });
          } else if (currentPackageName) {
            await deep.update(
              { link_id: packageNamespaceId },
              { value: currentPackageName },
              { table: 'strings' }
            );
          }
          if (currentPackageName) {
            await deep.update(
              { link_id: pkg?.id },
              { value: currentPackageName },
              { table: 'strings' }
            );
          }
          if (!pkgVersion?.id) {
            const { data: [{ id: packageVersionId }] } = await deep.insert({
              type_id: packageVersionTypeId,
              string: { data: { value: currentPackageVersion || '0.0.0' } },
            });
          } else if (currentPackageVersion) {
            await deep.update(
              { link_id: pkgVersion?.id },
              { value: currentPackageVersion },
              { table: 'strings' }
            );
          }
        }}>save</Button>
        <Button colorScheme='blue' size='sm' w='100%'>publish</Button>
      </VStack>
    </Box>
  )
}