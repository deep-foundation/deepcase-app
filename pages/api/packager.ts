import fetch from 'node-fetch';
import { generateApolloClient } from '@deep-foundation/hasura/client';
import { DeepClient } from '@deep-foundation/deeplinks/imports/client';
import { gql } from "@apollo/client";

export const searchNpmPackages = async (query) => {
  const deepPackageKeyword = 'deep-package';
  const textParameter = encodeURIComponent(`${query} keywords:${deepPackageKeyword}`);
  const url = `https://registry.npmjs.com/-/v1/search?text=${textParameter}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};

export  const getDeepPackagesVersions = async (deep, packagesNames) => {
  const { data: data } = await deep.apolloClient.query({
    query: gql`query GetPackagesVersionsByName($packageVersionTypeId: bigint, $packageNamespaceTypeId: bigint, $packageActiveTypeId: bigint, $packagesNames: [String]) {
      namespaces: links(where: {type_id: {_eq: $packageNamespaceTypeId}, string: { value: {_in: $packagesNames }}}) {
        id
        name: value
        versions: out(where: {type_id: {_eq: $packageVersionTypeId}, string: {value: {_is_null: false}}}) {
          id
          version: value
          packageId: to_id
        }
        active: out(where: {type_id: {_eq: $packageVersionTypeId}, string: {value: {_is_null: false}}}) {
          id
          version: value
          packageId: to_id
        }
      }
    }`,
    variables: {
      "packageVersionTypeId": await deep.id('@deep-foundation/core', 'PackageVersion'),
      "packageNamespaceTypeId": await deep.id('@deep-foundation/core', 'PackageNamespace'),
      "packageActiveTypeId": await deep.id('@deep-foundation/core', 'PackageNamespace'),
      "packagesNames": packagesNames
    },
  });

  // console.log(JSON.stringify(data, null, 2));
  
  return data.namespaces.map(namespace => {
    const activeVersion = namespace.active.map(version => {
      return {
        packageId: version?.packageId,
        version: version?.version?.value
      }
    })[0];
    return {
      namespaceId: namespace.id,
      name: namespace.name.value,
      activeVersion: activeVersion,
      versions: namespace.versions.map(version => {
        return {
          packageId: version?.packageId,
          version: version?.version?.value,
          isActive: version?.packageId === activeVersion?.packageId
        }
      })
    }
  })
};

export const combinedPackagesSearch = async (deep, query) => {
  const remotePackages = await searchNpmPackages(query);
  const packagesNames = remotePackages.objects.map(rp => rp.package.name);
  const localPackages = await await getDeepPackagesVersions(deep, packagesNames);
  const localPackagesHash = {};
  for (const localPackage of localPackages) {
    localPackagesHash[localPackage.name] = localPackage;
  }
  const packages = remotePackages.objects.map(rp => {
    return {
      remotePackage: rp.package,
      localPackage: localPackagesHash[rp.package.name],
    }
  });
  return {
    installedPackages: packages.filter(p => !!p.localPackage),
    notInstalledPackages: packages.filter(p => !p.localPackage)
  };
};

export const getPackageFromNpm = async (packageName) => {
  const url = `https://registry.npmjs.com/${packageName}`;
  const response = await fetch(url);
  const data = await response.json();
  return data;
};
