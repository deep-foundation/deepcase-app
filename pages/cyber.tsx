
import { DeepProvider, useDeep } from '@deep-foundation/deeplinks/imports/client';
import { Link, useMinilinksFilter } from '@deep-foundation/deeplinks/imports/minilinks';
import dynamic from "next/dynamic";
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { AutoGuest } from '@deep-foundation/deepcase/imports/auto-guest';
import { ColorModeSwitcher } from '@deep-foundation/deepcase/imports/color-mode-toggle';
import { Switch } from '@deep-foundation/deepcase/imports/switch-mode';
import CytoGraph from '@deep-foundation/deepcase/imports/cyto/graph';
import { AframeGraph } from '@deep-foundation/deepcase/imports/aframe/aframe-graph';
import { useBreadcrumbs, useCytoViewport, useRefAutofill, useShowExtra, useSpaceId, useTraveler } from '@deep-foundation/deepcase/imports/hooks';
import { DeepLoader } from '@deep-foundation/deepcase/imports/loader';
import { Provider } from '@deep-foundation/deepcase/imports/provider';
import { useRefstarter } from '@deep-foundation/deepcase/imports/refstater';
import { Connector, parseUrl } from '@deep-foundation/deepcase/imports/connector/connector';
import { PackagerInterface } from '@deep-foundation/deepcase/imports/packager-interface/packager-interface';
import getConfig from 'next/config'
import { CatchErrors } from '@deep-foundation/deepcase/imports/react-errors';
import { Box, Button, Text, Input } from '@chakra-ui/react';
import pckg from '../package.json';
import dpckg from '@deep-foundation/deepcase/package.json';
import { CytoEditor } from '@deep-foundation/deepcase/imports/cyto/editor';
import SigningClientProvider from '@deep-foundation/deeplinks/imports/cyber/signerClient'
import SdkQueryClientProvider from '@deep-foundation/deeplinks/imports/cyber/queryClient'
import NetworksProvider from '@deep-foundation/deeplinks/imports/cyber/network'
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { useQueryClient } from '@deep-foundation/deeplinks/imports/cyber/queryClient';
import { useSigningClient } from '@deep-foundation/deeplinks/imports/cyber/signerClient';

export interface Coin {
  denom: string;
  amount: string;
}

const { publicRuntimeConfig } = getConfig();

// const CytoGraph = dynamic<CytoGraphProps>(
//   () => import('@deep-foundation/deepcase/imports/cyto/graph').then((m) => m.default),
//   { ssr: false }
// );
const CytoMenu = dynamic<any>(
  () => import('@deep-foundation/deepcase/imports/cyto/menu').then((m) => m.CytoMenu),
  { ssr: false }
);

export function Content({
  openPortal,
  gqlPath,
  gqlSsl,
  appVersion,
}: {
  openPortal?: () => any;
  gqlPath: string;
  gqlSsl: boolean;
  appVersion: string;
}) {
  const cytoViewportRef = useRefstarter<{ pan: { x: number; y: number; }; zoom: number }>();
  const cyRef = useRef();
  const [spaceId, setSpaceId] = useSpaceId();
  const [traveler, setTraveler] = useTraveler();
  const deep = useDeep();
  const globalAny: any = global;
  globalAny.deep = deep;
  globalAny.ml = deep.minilinks;
  const [extra, setExtra] = useShowExtra();
  const [breadcrumbs, setBreadcrumbs] = useBreadcrumbs();
  const travelerRef = useRefAutofill(traveler);

  const TravelerRef = useRef(0);
  useEffect(() => {
    (async () => {
      TravelerRef.current = await deep.id('@deep-foundation/deepcase', 'Traveler');
    })();
  }, []);

  // @ts-ignore
  const links: Link[] = useMinilinksFilter(
    deep.minilinks,
    useCallback((l) => true, []),
    useCallback((l, ml) => {
      const Traveler = TravelerRef.current;
      const traveler = travelerRef.current;
      let result = (
        extra
          ? ml.links
          : ml.links.filter(l => (
            !!l._applies.find((a: string) => !!~a.indexOf('query-') || a === 'space' || a === 'breadcrumbs' || a === 'not-loaded-ends')
          ))
      )
      if (Traveler && !traveler) {
        result = result.filter(l => (
          !(l.type_id === Traveler) // Traveler
          &&
          !(l.type_id === deep.idLocal('@deep-foundation/core', 'Contain') && l?.to?.type_id === Traveler) // Traveler Contain
          &&
          !(l.inByType?.[Traveler]?.length) // Traveler Query
          &&
          !(l.type_id === deep.idLocal('@deep-foundation/core', 'Contain') && l?.to?.inByType?.[Traveler]?.length) // Traveler Query Contain
          &&
          !(l.type_id === deep.idLocal('@deep-foundation/core', 'Active') && l?.to?.inByType?.[Traveler]?.length) // Traveler Query Active
          &&
          !(l.type_id === deep.idLocal('@deep-foundation/core', 'Contain') && l?.to?.type_id === deep.idLocal('@deep-foundation/core', 'Active') && l?.to?.to?.inByType?.[Traveler]?.length) // Traveler Query Active Contain
        ));
      }
      return result;
    }, [deep, extra, breadcrumbs, traveler]),
    1000,
  ) || [];

  return (<React.Fragment
    key={`${spaceId}-${deep.linkId}`}
  >
    <DeepLoader
      spaceId={spaceId}
    />
    <CytoGraph gqlPath={gqlPath} gqlSsl={gqlSsl} links={links} cyRef={cyRef} cytoViewportRef={cytoViewportRef} useCytoViewport={useCytoViewport}>
      <CytoEditor />
      <Text position="fixed" left={0} bottom={0} p={4}>
        {appVersion} ({dpckg.version})
      </Text>
    </CytoGraph>
    <CytoMenu gqlPath={gqlPath} gqlSsl={gqlSsl} cyRef={cyRef} cytoViewportRef={cytoViewportRef} openPortal={openPortal} />
    <Switch />
    <PackagerInterface />
  </React.Fragment>);
};

export const InsertCyberLink = () => {
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  // const queryClient = useQueryClient();


  // const address = useAppSelector(selectCurrentAddress);

  const { signer, signingClient } = useSigningClient();

  async function cyberlink(fromCid, toCid) {
    const gas_limit = (await import('@deep-foundation/deeplinks/imports/cyber/config')).DEFAULT_GAS_LIMITS

    const fee = {
      amount: [],
      gas: gas_limit.toString(),
    };

    if (
      // !queryClient ||
      // !address ||
      !signer ||
      !signingClient
    ) {
      return;
    }

    const [{ address: signerAddress }] = await signer.getAccounts();

    // if (signerAddress !== address) {
    //   // setError('Signer address is not equal to current account');
    //   return;
    // }

    try {
      // setLoading(true);
      // let fromCid = "QmRxJHAVvhxGNVwK4SatRz3UrG3cQdEQdF8MgayXAEQCiY"

      // let toCid = "QmRX8qYgeZoYM3M5zzQaWEpVFdpin6FvVXvp6RPQK3oufV"

      const result = await signingClient.cyberlink(
        signerAddress,
        // address,
        fromCid,
        toCid,
        fee
      );

      // if (result.code !== 0) {
      //   throw new Error(result.rawLog);
      // }


    } catch (error) {
      // better use code of error
      if (error.message === 'Request rejected') {
        return;
      }

      console.error(error);
      // setError(error.message);
    } finally {
      // setLoading(false);
    }
  }

  return (
    <Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
      <Text mb={3}>Insert Cyberlink</Text>
      <Input value={from} onChange={(e) => {setFrom(e.target.value)}} mb={3} placeholder='From'/>
      <Input value={to} onChange={(e) => {setTo(e.target.value)}} mb={3} placeholder='To'/>
      <Button onClick={() => {cyberlink(from, to)}}>CYBER ~ DEEP cyberlink</Button>
    </Box>
  )
}

export const CyberSearch = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState<string>('');
  const [searchResult, setSearchResult] = useState<any>("");
  const toSearch = async (searchQuery) => {
    const response = await queryClient.search(searchQuery)
    setSearchResult(response);
  }
  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text mb={3}>Search</Text>
    <Input placeholder="Search" value={search} onChange={(e) => {setSearch(e.target.value)}} mb={3}/>
    <Button onClick={() => {toSearch(search)}} mb={3}>Search</Button>
    <Box>{JSON.stringify(searchResult)}</Box>
  </Box>)
}

export const GetBlock = () => {
  const queryClient = useQueryClient();
  const [blockNumber, setBlockNumber] = useState<any>("");
  const [blockInfoResult, setBlockInfoResult] = useState<any>("");
  const findBlock = async (blockNumberQuery) => {
    const response = await queryClient.getBlock(blockNumberQuery)
    setBlockInfoResult(response);
  }
  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text mb={3}>Get Block</Text>
    <Input placeholder="Search" value={blockNumber} onChange={(e) => {setBlockNumber(e.target.value)}} mb={3}/>
    <Button onClick={() => {findBlock(+blockNumber)}} mb={3}>Search block</Button>
    <Box>{JSON.stringify(blockInfoResult)}</Box>
  </Box>)
}

export const GetTransaction = () => {
  const queryClient = useQueryClient();
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [transactionInfoResult, setTransactionInfoResult] = useState<any>("");
  const findTransaction = async (transactionHashQuery) => {
    const response = await queryClient.getTx(transactionHashQuery)
    setTransactionInfoResult(response);
  }
  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text mb={3}>Get Transaction</Text>
    <Input placeholder="Search" value={transactionHash} onChange={(e) => {setTransactionHash(e.target.value)}} mb={3}/>
    <Button onClick={() => {findTransaction(transactionHash)}} mb={3}>Search tx</Button>
    <Box>{JSON.stringify(transactionInfoResult)}</Box>
  </Box>)
}

export const GetBalance = () => {
  const queryClient = useQueryClient();
  const [address, setAddress] = useState<string>("");
  const [balanceResult, setBalanceResult] = useState<any>("");
  const getBalance = async (addressQuery) => {
    const response = await queryClient.getAllBalances(addressQuery)
    setBalanceResult(response);
  }
  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text mb={3}>Get Balance</Text>
    <Input placeholder="Search" value={address} onChange={(e) => {setAddress(e.target.value)}} mb={3}/>
    <Button onClick={() => {getBalance(address)}} mb={3}>Get Balance</Button>
    <Box>{JSON.stringify(balanceResult)}</Box>
  </Box>)
}

export const SendToken = () => {
  const [fromAddress, setFromAddress] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [denom, setDenom] = useState<string>('');
  const [sendTokensResult, setSendTokensResult] = useState<any>('');

  // const queryClient = useQueryClient();


  // const address = useAppSelector(selectCurrentAddress);

  const { signer, signingClient } = useSigningClient();

  async function sendTokens({toAddress, amount, denom}: {toAddress: string, amount: string, denom: string}) {
    const gas_limit = (await import('@deep-foundation/deeplinks/imports/cyber/config')).DEFAULT_GAS_LIMITS

    const fee = {
      amount: [],
      gas: gas_limit.toString(),
    };

    if (
      // !queryClient ||
      // !address ||
      !signer ||
      !signingClient
    ) {
      return;
    }

    const [{ address: signerAddress }] = await signer.getAccounts();

    // if (signerAddress !== address) {
    //   // setError('Signer address is not equal to current account');
    //   return;
    // }

    try {
      // setLoading(true);
      // let fromCid = "QmRxJHAVvhxGNVwK4SatRz3UrG3cQdEQdF8MgayXAEQCiY"

      // let toCid = "QmRX8qYgeZoYM3M5zzQaWEpVFdpin6FvVXvp6RPQK3oufV"

      const coin: Coin = {
        denom,
        amount
      }
      const amounts = [amount]
      const result = await signingClient.sendTokens(
        signerAddress,
        toAddress,
        [coin],
        fee
      );
      setSendTokensResult(result);

      // if (result.code !== 0) {
      //   throw new Error(result.rawLog);
      // }


    } catch (error) {
      // better use code of error
      if (error.message === 'Request rejected') {
        return;
      }

      console.error(error);
      // setError(error.message);
    } finally {
      // setLoading(false);
    }
  }

  const getMyAddress = async () => {
    const [{ address: signerAddress }] = await signer.getAccounts();
    setFromAddress(signerAddress);
  }

  useEffect(() => {
    if (signer) {
      getMyAddress();
    }
  }, [signer])

  return (
    <Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
      <Text mb={3}>Send tokens</Text>
      <Input value={fromAddress} mb={3} placeholder='From' disabled={true} />
      <Input value={toAddress} onChange={(e) => {setToAddress(e.target.value)}} mb={3} placeholder='To'/>
      <Input value={amount} onChange={(e) => {setAmount(e.target.value)}} mb={3} placeholder='Amount'/>
      <Input value={denom} onChange={(e) => {setDenom((e.target.value).toLowerCase())}} mb={3} placeholder='Token'/>
      <Button onClick={() => {sendTokens({toAddress, amount, denom})}}>Send tokens</Button>
      <Box>{JSON.stringify(sendTokensResult)}</Box>
    </Box>
  )
}

export const SendContractToken = () => {
  const [fromAddress, setFromAddress] = useState<string>('');
  const [toAddress, setToAddress] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [sendContractTokensResult, setSendContractTokensResult] = useState<any>('');

  // const queryClient = useQueryClient();


  // const address = useAppSelector(selectCurrentAddress);

  const { signer, signingClient } = useSigningClient();

  async function sendContractTokens({toAddress, amount, contractAddress}: {toAddress: string, amount: string, contractAddress: string}) {
    const gas_limit = (await import('@deep-foundation/deeplinks/imports/cyber/config')).DEFAULT_GAS_LIMITS

    const fee = {
      amount: [],
      gas: gas_limit.toString(),
    };

    if (
      // !queryClient ||
      // !address ||
      !signer ||
      !signingClient
    ) {
      return;
    }

    const [{ address: signerAddress }] = await signer.getAccounts();

    // if (signerAddress !== address) {
    //   // setError('Signer address is not equal to current account');
    //   return;
    // }

    try {
      // setLoading(true);
      // let fromCid = "QmRxJHAVvhxGNVwK4SatRz3UrG3cQdEQdF8MgayXAEQCiY"

      // let toCid = "QmRX8qYgeZoYM3M5zzQaWEpVFdpin6FvVXvp6RPQK3oufV"

      // const amounts = [amount]

      const msg = {
        transfer: {
          recipient: toAddress,
          amount
        }
      }
      const result = await signingClient.execute(
        signerAddress,
        contractAddress,
        msg,
        fee
      );
      setSendContractTokensResult(result);

      // if (result.code !== 0) {
      //   throw new Error(result.rawLog);
      // }


    } catch (error) {
      // better use code of error
      if (error.message === 'Request rejected') {
        return;
      }

      console.error(error);
      // setError(error.message);
    } finally {
      // setLoading(false);
    }
  }

  const getMyAddress = async () => {
    const [{ address: signerAddress }] = await signer.getAccounts();
    setFromAddress(signerAddress);
  }

  useEffect(() => {
    if (signer) {
      getMyAddress();
    }
  }, [signer])

  return (
    <Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
      <Text mb={3}>Send contranct tokens</Text>
      <Input value={fromAddress} mb={3} placeholder='From' disabled={true} />
      <Input value={toAddress} onChange={(e) => {setToAddress(e.target.value)}} mb={3} placeholder='To'/>
      <Input value={amount} onChange={(e) => {setAmount(e.target.value)}} mb={3} placeholder='Amount'/>
      <Input value={contractAddress} onChange={(e) => {setContractAddress((e.target.value).toLowerCase())}} mb={3} placeholder='Token address'/>
      <Button onClick={() => {sendContractTokens({toAddress, amount, contractAddress})}}>Send contract tokens</Button>
      <Box>{JSON.stringify(sendContractTokensResult)}</Box>
    </Box>
  )
}

export const GetContractBalance = () => {
  const [address, setAddress] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [balanceContractResult, setBalanceContractResult] = useState<any>('');

  const queryClient = useQueryClient();


  // const address = useAppSelector(selectCurrentAddress);

  const { signer, signingClient } = useSigningClient();

  async function getContractBalance({address, contractAddress}: {address: string, contractAddress: string}) {

    try {
      const result = await queryClient.queryContractSmart(contractAddress, {
        balance: {
          address
        }
      })
      setBalanceContractResult(result);

    } catch (error) {
      // better use code of error
      if (error.message === 'Request rejected') {
        return;
      }

      console.error(error);
      // setError(error.message);
    } finally {
      // setLoading(false);
    }
  }

  const getMyAddress = async () => {
    const [{ address: signerAddress }] = await signer.getAccounts();
    setAddress(signerAddress);
  }

  useEffect(() => {
    if (signer) {
      getMyAddress();
    }
  }, [signer])

  return (
    <Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
      <Text mb={3}>Get contract balance</Text>
      <Input value={address} mb={3} placeholder='Address' />
      <Input value={contractAddress} onChange={(e) => {setContractAddress((e.target.value).toLowerCase())}} mb={3} placeholder='Token address'/>
      <Button onClick={() => {getContractBalance({address, contractAddress})}}>Get contract balance</Button>
      <Box>{JSON.stringify(balanceContractResult)}</Box>
    </Box>
  )
}

export const MintContractNft = () => {
  const [nftAddress, setNftAddress] = useState<string>('');
  const [ownerAddress, setOwnerAddress] = useState<any>('');
  const [tokenId, setTokenId] = useState<any>('');
  const [mintContractNftResult, setMintContractNftResult] = useState<any>('');

  const { signer, signingClient } = useSigningClient();

  async function mintContractNft({nftAddress, ownerAddress, tokenId}: {nftAddress: string, ownerAddress: string, tokenId: string}) {
    const gas_limit = (await import('@deep-foundation/deeplinks/imports/cyber/config')).DEFAULT_GAS_LIMITS

    const fee = {
      amount: [],
      gas: gas_limit.toString(),
    };

    if (
      // !queryClient ||
      // !address ||
      !signer ||
      !signingClient
    ) {
      return;
    }

    const [{ address: signerAddress }] = await signer.getAccounts();

    // if (signerAddress !== address) {
    //   // setError('Signer address is not equal to current account');
    //   return;
    // }

    try {
      // setLoading(true);
      // let fromCid = "QmRxJHAVvhxGNVwK4SatRz3UrG3cQdEQdF8MgayXAEQCiY"

      // let toCid = "QmRX8qYgeZoYM3M5zzQaWEpVFdpin6FvVXvp6RPQK3oufV"

      // const amounts = [amount]

      const msg = {
        mint: {
          token_id: tokenId,
          owner: ownerAddress
        }
      }
      const result = await signingClient.execute(
        signerAddress,
        nftAddress,
        msg,
        fee
      );
      setMintContractNftResult(result);

      // if (result.code !== 0) {
      //   throw new Error(result.rawLog);
      // }


    } catch (error) {
      // better use code of error
      if (error.message === 'Request rejected') {
        return;
      }

      console.error(error);
      // setError(error.message);
    } finally {
      // setLoading(false);
    }
  }

  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text mb={3}>Mint NFT</Text>
    <Input placeholder="NFT address" value={nftAddress} onChange={(e) => {setNftAddress(e.target.value)}} mb={3}/>
    <Input placeholder="Owner address" value={ownerAddress} onChange={(e) => {setOwnerAddress(e.target.value)}} mb={3}/>
    <Input placeholder="Token id" value={tokenId} onChange={(e) => {setTokenId(e.target.value)}} mb={3}/>
    <Button onClick={() => mintContractNft({nftAddress, ownerAddress, tokenId})}>Mint NFT</Button>
  </Box>)
}

export const TransferContractNft = () => {
  const [nftAddress, setNftAddress] = useState<string>('');
  const [ownerAddress, setOwnerAddress] = useState<any>('');
  const [tokenId, setTokenId] = useState<any>('');
  const [transferContractNftResult, setTransferContractNftResult] = useState<any>('');

  const { signer, signingClient } = useSigningClient();

  async function mintContractNft({nftAddress, ownerAddress, tokenId}: {nftAddress: string, ownerAddress: string, tokenId: string}) {
    const gas_limit = (await import('@deep-foundation/deeplinks/imports/cyber/config')).DEFAULT_GAS_LIMITS

    const fee = {
      amount: [],
      gas: gas_limit.toString(),
    };

    if (
      // !queryClient ||
      // !address ||
      !signer ||
      !signingClient
    ) {
      return;
    }

    const [{ address: signerAddress }] = await signer.getAccounts();

    // if (signerAddress !== address) {
    //   // setError('Signer address is not equal to current account');
    //   return;
    // }

    try {
      // setLoading(true);
      // let fromCid = "QmRxJHAVvhxGNVwK4SatRz3UrG3cQdEQdF8MgayXAEQCiY"

      // let toCid = "QmRX8qYgeZoYM3M5zzQaWEpVFdpin6FvVXvp6RPQK3oufV"

      // const amounts = [amount]

      const msg = {
        transfer: {
          token_id: tokenId,
          recipient: ownerAddress
        }
      }
      const result = await signingClient.execute(
        signerAddress,
        nftAddress,
        msg,
        fee
      );
      setTransferContractNftResult(result);

      // if (result.code !== 0) {
      //   throw new Error(result.rawLog);
      // }


    } catch (error) {
      // better use code of error
      if (error.message === 'Request rejected') {
        return;
      }

      console.error(error);
      // setError(error.message);
    } finally {
      // setLoading(false);
    }
  }

  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text mb={3}>Transfer NFT</Text>
    <Input placeholder="NFT address" value={nftAddress} onChange={(e) => {setNftAddress(e.target.value)}} mb={3}/>
    <Input placeholder="Owner address" value={ownerAddress} onChange={(e) => {setOwnerAddress(e.target.value)}} mb={3}/>
    <Input placeholder="Token id" value={tokenId} onChange={(e) => {setTokenId(e.target.value)}} mb={3}/>
    <Button onClick={() => mintContractNft({nftAddress, ownerAddress, tokenId})}>Transfer NFT</Button>
    <Box> {JSON.stringify(transferContractNftResult)} </Box>
  </Box>)
}

export const GetContractBalanceNft = () => {
  const [owner, setOwner] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [balanceContractNftResult, setBalanceContractNftResult] = useState<any>('');

  const queryClient = useQueryClient();


  // const address = useAppSelector(selectCurrentAddress);

  const { signer, signingClient } = useSigningClient();

  async function getContractBalanceNft({owner, contractAddress}: {owner: string, contractAddress: string}) {

    try {
      const result = await queryClient.queryContractSmart(contractAddress, {
        tokens: {
          owner
        }
      })
      setBalanceContractNftResult(result);

    } catch (error) {
      // better use code of error
      if (error.message === 'Request rejected') {
        return;
      }

      console.error(error);
      // setError(error.message);
    } finally {
      // setLoading(false);
    }
  }

  const getMyAddress = async () => {
    const [{ address: signerAddress }] = await signer.getAccounts();
    setOwner(signerAddress);
  }

  useEffect(() => {
    if (signer) {
      getMyAddress();
    }
  }, [signer])

  return (
    <Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
      <Text mb={3}>Get contract nft balance</Text>
      <Input value={owner} mb={3} placeholder='Owner' onChange={(e) => setOwner(e.target.value)} />
      <Input value={contractAddress} onChange={(e) => {setContractAddress((e.target.value).toLowerCase())}} mb={3} placeholder='Token address'/>
      <Button onClick={() => {getContractBalanceNft({owner, contractAddress})}}>Get contract nft balance</Button>
      <Box>{JSON.stringify(balanceContractNftResult)}</Box>
    </Box>
  )
}

export default function Page({
  serverUrl,
  deeplinksUrl,
  defaultGqlPath,
  defaultGqlSsl,
  appVersion,
  disableConnector
}: {
  defaultGqlPath: string;
  defaultGqlSsl: boolean;
  serverUrl: string;
  deeplinksUrl: string;
  appVersion: string;
  disableConnector: boolean;
}) {
  // todo: put gqlPath and gqlSsl to localstorage so client handler page can use settings from connector
  const [gqlPath, setGqlPath] = useState(defaultGqlPath);
  const [gqlSsl, setGqlSsl] = useState(defaultGqlSsl);
  const [portal, setPortal] = useState(true);

  const key = `${gqlSsl}-${gqlPath}`;

  useEffect(() => {
    if (!disableConnector) {
      return;
    }
    if (typeof window !== 'undefined') {
      const browserURI = window?.location?.origin;
      if (browserURI) {
        const [browserPath, browserSsl] = parseUrl(browserURI);
        setGqlPath(browserPath + "/api/gql");
        setGqlSsl(browserSsl);
      }
    }
  }, []);

  console.log("index-page-urls", {
    gqlPath,
    gqlSsl
  });

  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        refetchOnWindowFocus: false,
        // staleTime: 60 * 1000,
      },
    },
  });


  return (<>
    {[
      <Provider key={key} gqlPath={gqlPath} gqlSsl={gqlSsl}>
        <NetworksProvider>
          <QueryClientProvider client={queryClient}>
            <SdkQueryClientProvider>
              <SigningClientProvider>
                <DeepProvider>
                  {!disableConnector ?
                    <Connector
                      portalOpen={portal}
                      setPortal={setPortal}
                      // onClosePortal={() => setPortal(portal)}
                      gqlPath={gqlPath}
                      gqlSsl={gqlSsl}
                      serverUrl={serverUrl}
                      deeplinksUrl={deeplinksUrl}
                      setGqlPath={(path) => setGqlPath(path)}
                      setGqlSsl={(ssl) => setGqlSsl(ssl)}
                    /> : null}
                  {gqlPath ? [
                    <CatchErrors key={1} errorRenderer={(e) => <>
                      <pre>Error in AutoGuest or content rendering.</pre>
                      <pre>{e?.toString() || JSON.stringify(e, null, 2)}</pre>
                    </>}>
                      <AutoGuest>
                        <Box>Cyber</Box>
                        <br />
                        <InsertCyberLink />
                        <br />
                        <CyberSearch />
                        <br />
                        <GetBlock />
                        <br />
                        <GetTransaction />
                        <br />
                        <GetBalance />
                        <br />
                        <SendToken />
                        <br />
                        <SendContractToken />
                        <br />
                        <GetContractBalance />
                        <br />
                        <MintContractNft />
                        <br />
                        <TransferContractNft />
                        <br />
                        <GetContractBalanceNft />
                      </AutoGuest>
                    </CatchErrors>
                  ] : []}
                </DeepProvider>
              </SigningClientProvider>
            </SdkQueryClientProvider>
          </QueryClientProvider>
        </NetworksProvider>
      </Provider>
    ]}
  </>);
}

export async function getStaticProps() {
  return {
    props: {
      defaultGqlPath: publicRuntimeConfig?.NEXT_PUBLIC_GQL_PATH || '',
      defaultGqlSsl: !!+publicRuntimeConfig?.NEXT_PUBLIC_GQL_SSL || false,
      serverUrl: publicRuntimeConfig?.NEXT_PUBLIC_DEEPLINKS_SERVER || 'http://localhost:3007',
      deeplinksUrl: publicRuntimeConfig?.NEXT_PUBLIC_DEEPLINKS_URL || 'http://localhost:3006',
      disableConnector: !!+publicRuntimeConfig?.NEXT_PUBLIC_DISABLE_CONNECTOR || false,
      appVersion: pckg?.version || '',
    },
  };
}
