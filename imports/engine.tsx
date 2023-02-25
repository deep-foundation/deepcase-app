import { generateSerial, insertMutation } from '@deep-foundation/deeplinks/imports/gql';
import axios from 'axios';
import React, { useCallback, useState } from 'react';
import { ICallOptions } from '@deep-foundation/deeplinks/imports/engine';
import { useLocalStore } from '@deep-foundation/store/local';
import { useApolloClient } from '@deep-foundation/react-hasura/use-apollo-client';
import { useApolloClientRegenerator } from '@deep-foundation/react-hasura/apollo-client-regenerator';

const _call = (options: ICallOptions) => axios.post(`${process.env.NEXT_PUBLIC_DEEPLINKS_SERVER}/api/deeplinks`, options).then(console.log, console.log);

export const NEXT_PUBLIC_ENGINES = !!+process.env.NEXT_PUBLIC_ENGINES;

let _useEngineConnected;

if (NEXT_PUBLIC_ENGINES) {
  _useEngineConnected = function useEngineConnected() {
    return useLocalStore('dc-connected', false);
  }
} else {
  _useEngineConnected = function useEngineConnected() {
    const s = useState(true);
    return [true, s[1]];
  }
}
export const useEngineConnected = _useEngineConnected;

export function useEnginePath() {
  return useLocalStore('dc-path', '');
}

export function useEngine() {
  const client = useApolloClient();
  const [connected, setConnected] = useEngineConnected();
  const [operation, setOperation] = useState('');
  const call = useCallback(async (options: ICallOptions) => {
    setOperation(options.operation);
    if (['reset', 'sleep'].includes(options.operation)) {
      setConnected(false);
    }
    await _call(options);
    if (['run'].includes(options.operation)) {
      setConnected(true);
    }
    setOperation('');
  }, []);
  return {
    operation,
    call,
  };
}

// const isMac = process.platform === 'darwin';

// export const EngineWindow = React.memo<any>(function EngineWindow({
// }: {
// }) {
//   const [connected, setConnected] = useEngineConnected();
//   const { call, operation } = useEngine();
//   const theme: any = useTheme();
//   const [path, setPath] = useEnginePath();
//   const { regenerate } = useApolloClientRegenerator();

//   console.log('engine', {connected, operation, path});

//   const buttonsDisabled = !!operation;

//   return <>
//     <Grid container spacing={1} style={{ padding: theme.spacing(3), width: 400 }}>
//       <Grid item xs={12} component={Typography} align="center">
//         <img src={'/logo.png'} style={{ width: 100 }}/>
//       </Grid>
//       <Grid item xs={12} component={Typography} align="center" variant="h3">
//         Deep.Case
//       </Grid>
//       <Grid item xs={12} component={Typography} align="center">
//         in <b>deep pre alpha</b> version
//       </Grid>
//       <Grid item xs={12} component={Typography} align="center" variant="caption">
//         Some of the functionality has not yet been translated by our programmers from deep space of wet dreams.
//       </Grid>
//       <Grid item xs={12}></Grid>
//       <Grid item xs={12}>
//         <Button size="small" disabled={buttonsDisabled} variant="outlined" color={buttonsDisabled ? 'default' : 'primary'} fullWidth onClick={async () => {
//           if (!buttonsDisabled) {
//             await call({ operation: 'run', envs: { PATH: path } });
//             regenerate();
//           }
//         }}>run engine</Button>
//         <LinearProgress variant={operation === 'run' ? 'indeterminate' : 'determinate'} value={!path ? 0 : 100}/>
//       </Grid>
//       <Grid item xs={12}></Grid>
//       <Grid item xs={12}>
//         <Button size="small" disabled={buttonsDisabled} variant="outlined" color={buttonsDisabled ? 'default' : 'primary'} fullWidth onClick={async () => {
//           if (!buttonsDisabled) {
//             await call({ operation: 'reset', envs: { PATH: path } });
//             regenerate();
//           }
//         }}>reset engine</Button>
//         <LinearProgress variant={operation === 'reset' ? 'indeterminate' : 'determinate'} value={!path ? 0 : 100}/>
//       </Grid>
//       <Grid item xs={12}>
//         <Button size="small" fullWidth variant="outlined" onClick={async () => {
//           setConnected(true);
//         }}>skip</Button>
//       </Grid>
//     </Grid>
//   </>;
// });

// export const EnginePanel = React.memo<any>(function EnginePanel({
// }: {
// }) {
//   const [connected, setConnected] = useEngineConnected();
//   const [path, setPath] = useEnginePath();
//   const { call } = useEngine();
//   const [operation, setOperation] = useState('');
//   const { regenerate } = useApolloClientRegenerator();

//   return <>
//     {NEXT_PUBLIC_ENGINES && <>
//       <ButtonGroup variant="outlined">
//         <Button onClick={async () => {
//           await call({ operation: 'sleep', envs: { PATH: path } });
//           regenerate();
//         }}>sleep</Button>
//       </ButtonGroup>
//     </>}
//   </>;
// });
