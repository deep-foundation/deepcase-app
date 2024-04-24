
import { Box, Button, Input, Text } from '@chakra-ui/react';
import { parseUrl } from '@deep-foundation/deepcase/imports/connector/connector';
import { generateCyberDeepClient } from '@deep-foundation/deeplinks/imports/cyber';
import { useBackend } from '@deep-foundation/deeplinks/imports/cyber/backend';
import * as cyberConfig from '@deep-foundation/deeplinks/imports/cyber/config';
import NetworksProvider from '@deep-foundation/deeplinks/imports/cyber/network';
import SdkQueryClientProvider, { useQueryClient } from '@deep-foundation/deeplinks/imports/cyber/queryClient';
import store from '@deep-foundation/deeplinks/imports/cyber/redux/store';
import SigningClientProvider, { useSigningClient } from '@deep-foundation/deeplinks/imports/cyber/signerClient';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import getConfig from 'next/config';
import { SetStateAction, useEffect, useState } from 'react';
import { Provider as ReduxProvider } from 'react-redux';
import pckg from '../package.json';

console.log(123);

// export default function Page() {
//   return <div>123</div>;
// }

// import { WorkerUrl } from 'worker-url';

// import net from 'net';
// console.log('net', net);
// import '../background_worker';
// import '../db_worker';

// const backgroundWorkerInstance = new Worker(new URL('../background_worker.tsx', import.meta.url));
// const cozoDbWorkerInstance = new Worker(new URL('../db_worker.tsx', import.meta.url));

export function CyberDeepClientGlobal() {
  useEffect(() => { (async () => {
    const cyber = cyberConfig.CYBER;
    console.log(cyber);
    // @ts-ignore
    global.cdc = await generateCyberDeepClient({
      config: cyberConfig.CYBER,
    });
  })();
  }, []);
  return null;
}
export interface Coin {
  denom: string;
  amount: string;
}

const { publicRuntimeConfig } = getConfig();

export const InsertCyberLink = () => {
  const [from, setFrom] = useState<string>('');
  const [to, setTo] = useState<string>('');

  // const queryClient = useQueryClient();


  // const address = useAppSelector(selectCurrentAddress);

  const { signer, signingClient } = useSigningClient();

  async function cyberlink(fromCid: any, toCid: any) {
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

    const [{ address: signerAddress }] = await signer?.getAccounts();

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
      <Input value={from} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setFrom(e.target.value)}} mb={3} placeholder='From'/>
      <Input value={to} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setTo(e.target.value)}} mb={3} placeholder='To'/>
      <Button onClick={() => {cyberlink(from, to)}}>CYBER ~ DEEP cyberlink</Button>
    </Box>
  )
}

export const CyberSearch = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState<string>('');
  const [searchResult, setSearchResult] = useState<any>("");
  const toSearch = async (searchQuery: any) => {
    const response = await queryClient?.search(searchQuery)
    setSearchResult(response);
  }
  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text mb={3}>Search</Text>
    <Input placeholder="Search" value={search} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setSearch(e.target.value)}} mb={3}/>
    <Button onClick={() => {toSearch(search)}} mb={3}>Search</Button>
    <Box>{JSON.stringify(searchResult)}</Box>
  </Box>)
}

export const GetBlock = () => {
  const queryClient = useQueryClient();
  const [blockNumber, setBlockNumber] = useState<any>("");
  const [blockInfoResult, setBlockInfoResult] = useState<any>("");
  const findBlock = async (blockNumberQuery: number | undefined) => {
    const response = await queryClient?.getBlock(blockNumberQuery)
    setBlockInfoResult(response);
  }
  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text mb={3}>Get Block</Text>
    <Input placeholder="Search" value={blockNumber} onChange={(e: { target: { value: any; }; }) => {setBlockNumber(e.target.value)}} mb={3}/>
    <Button onClick={() => {findBlock(+blockNumber)}} mb={3}>Search block</Button>
    <Box>{JSON.stringify(blockInfoResult)}</Box>
  </Box>)
}

export const GetTransaction = () => {
  const queryClient = useQueryClient();
  const [transactionHash, setTransactionHash] = useState<string>("");
  const [transactionInfoResult, setTransactionInfoResult] = useState<any>("");
  const findTransaction = async (transactionHashQuery: string) => {
    const response = await queryClient?.getTx(transactionHashQuery)
    setTransactionInfoResult(response);
  }
  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text mb={3}>Get Transaction</Text>
    <Input placeholder="Search" value={transactionHash} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setTransactionHash(e.target.value)}} mb={3}/>
    <Button onClick={() => {findTransaction(transactionHash)}} mb={3}>Search tx</Button>
    <Box>{JSON.stringify(transactionInfoResult)}</Box>
  </Box>)
}

export const GetBalance = () => {
  const queryClient = useQueryClient();
  const [address, setAddress] = useState<string>("");
  const [balanceResult, setBalanceResult] = useState<any>("");
  const getBalance = async (addressQuery: string) => {
    const response = await queryClient?.getAllBalances(addressQuery)
    setBalanceResult(response);
  }
  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text mb={3}>Get Balance</Text>
    <Input placeholder="Search" value={address} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setAddress(e.target.value)}} mb={3}/>
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

    const [{ address: signerAddress }] = await signer?.getAccounts();

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
    if (signer) {
      const [{ address: signerAddress }] = await signer?.getAccounts();
      setFromAddress(signerAddress);
    }
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
      <Input value={toAddress} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setToAddress(e.target.value)}} mb={3} placeholder='To'/>
      <Input value={amount} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setAmount(e.target.value)}} mb={3} placeholder='Amount'/>
      <Input value={denom} onChange={(e: { target: { value: any; }; }) => {setDenom((e.target.value).toLowerCase())}} mb={3} placeholder='Token'/>
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

    const [{ address: signerAddress }] = await signer?.getAccounts();

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
    if (signer) {
      const [{ address: signerAddress }] = await signer?.getAccounts();
      setFromAddress(signerAddress);
    }
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
      <Input value={toAddress} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setToAddress(e.target.value)}} mb={3} placeholder='To'/>
      <Input value={amount} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setAmount(e.target.value)}} mb={3} placeholder='Amount'/>
      <Input value={contractAddress} onChange={(e: { target: { value: any; }; }) => {setContractAddress((e.target.value).toLowerCase())}} mb={3} placeholder='Token address'/>
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
      const result = await queryClient?.queryContractSmart(contractAddress, {
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
    if (signer) {
      const [{ address: signerAddress }] = await signer?.getAccounts();
      setAddress(signerAddress);
    }
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
      <Input value={contractAddress} onChange={(e: { target: { value: any; }; }) => {setContractAddress((e.target.value).toLowerCase())}} mb={3} placeholder='Token address'/>
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

    const [{ address: signerAddress }] = await signer?.getAccounts();

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
    <Input placeholder="NFT address" value={nftAddress} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setNftAddress(e.target.value)}} mb={3}/>
    <Input placeholder="Owner address" value={ownerAddress} onChange={(e: { target: { value: any; }; }) => {setOwnerAddress(e.target.value)}} mb={3}/>
    <Input placeholder="Token id" value={tokenId} onChange={(e: { target: { value: any; }; }) => {setTokenId(e.target.value)}} mb={3}/>
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

    const [{ address: signerAddress }] = await signer?.getAccounts();

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
    <Input placeholder="NFT address" value={nftAddress} onChange={(e: { target: { value: SetStateAction<string>; }; }) => {setNftAddress(e.target.value)}} mb={3}/>
    <Input placeholder="Owner address" value={ownerAddress} onChange={(e: { target: { value: any; }; }) => {setOwnerAddress(e.target.value)}} mb={3}/>
    <Input placeholder="Token id" value={tokenId} onChange={(e: { target: { value: any; }; }) => {setTokenId(e.target.value)}} mb={3}/>
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
      const result = await queryClient?.queryContractSmart(contractAddress, {
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
    if (signer) {
      const [{ address: signerAddress }] = await signer?.getAccounts();
      setOwner(signerAddress);
    }
  }

  useEffect(() => {
    if (signer) {
      getMyAddress();
    }
  }, [signer])

  return (
    <Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
      <Text mb={3}>Get contract nft balance</Text>
      <Input value={owner} mb={3} placeholder='Owner' onChange={(e: { target: { value: SetStateAction<string>; }; }) => setOwner(e.target.value)} />
      <Input value={contractAddress} onChange={(e: { target: { value: any; }; }) => {setContractAddress((e.target.value).toLowerCase())}} mb={3} placeholder='Token address'/>
      <Button onClick={() => {getContractBalanceNft({owner, contractAddress})}}>Get contract nft balance</Button>
      <Box>{JSON.stringify(balanceContractNftResult)}</Box>
    </Box>
  )
}

export const ipfsNode = async () => {
  const { isIpfsInitialized, ipfsNode } = useBackend();
  return (<Box w={320} borderWidth='1px' borderRadius='lg' bg="#fff" p={4}>
    <Text>IPFS Node</Text>
    <Box>{JSON.stringify({ isIpfsInitialized, ipfsNode })}</Box>
  </Box>)
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
      <ReduxProvider store={store}>
        <NetworksProvider>
          <QueryClientProvider client={queryClient}>
            <SdkQueryClientProvider>
              <SigningClientProvider>
                {/* <BackendProvider
                  backgroundWorkerInstance={backgroundWorkerInstance}
                  cozoDbWorkerInstance={cozoDbWorkerInstance}
                > */}
                  <CyberDeepClientGlobal/>
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
                {/* </BackendProvider> */}
              </SigningClientProvider>
            </SdkQueryClientProvider>
          </QueryClientProvider>
        </NetworksProvider>
      </ReduxProvider>
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
