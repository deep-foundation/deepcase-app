import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useTokenController } from "@deep-foundation/deeplinks/imports/react-token";
import { useEffect, useRef } from "react";
import Debug from 'debug';
import { useSpaceId } from "./hooks";
import { useEngineConnected } from "./engine";

const debug = Debug('deepcase:auto-guest');

export function AutoGuest({
  children,
}: {
  children: any;
}) {
  const deep = useDeep();
  const [token] = useTokenController();
  const [spaceId, setSpaceId] = useSpaceId();
  const [connected, setConnected] = useEngineConnected();
  const isAuth = !!(deep.linkId && token && token === deep.token);
  useEffect(() => {
    // const isAuth = !!(deep.linkId && token && token === deep.token);
    // We use as axiom - deep.token already synced with token
    const isAuth = !!(deep.linkId && token && token === deep.token);
    debug('useCheckAuth', 'token', token, 'deep.token', deep.token, 'isAuth', isAuth);
    // validate
    if (isAuth) (async () => {
      const result = await deep.select({ id: deep.linkId });
      if (!result?.data?.length) {
        debug(`user ${deep.linkId} invalid`);
        deep.logout();
      } else {
        debug(`user ${deep.linkId} valid`);
      }
    })();
    // fill
    if (!token) (async () => {
      const g = await deep.guest();
      if (g.error) setConnected(false);
    })();
  }, [token]);
  return <>
    {isAuth ? children : null}
  </>
}