import { useDeep } from "@deep-foundation/deeplinks/imports/client";
import { useTokenController } from "@deep-foundation/deeplinks/imports/react-token";
import { useEffect, useRef } from "react";
import Debug from 'debug';
import { useSpaceId } from "./gui";

const debug = Debug('deepcase:use-check-auth');

export function useCheckAuth() {
  const deep = useDeep();
  const [token] = useTokenController();
  const [spaceId, setSpaceId] = useSpaceId();
  const filledRef = useRef(false);
  useEffect(() => {
    const isAuth = !!(deep.linkId && token && token === deep.token);
    debug('useCheckAuth', 'token', token, 'deep.token', deep.token, 'isAuth', isAuth);
    // validate
    if (isAuth) (async () => {
      const result = await deep.select({ id: deep.linkId });
      filledRef.current = true;
      if (!result?.data?.length) {
        debug(`user ${deep.linkId} invalid`);
        deep.logout();
      } else {
        setSpaceId(deep.linkId);
        debug(`user ${deep.linkId} valid`);
      }
    })();
    // fill
    if (!isAuth && !filledRef.current) (async () => {
      filledRef.current = true;
      await deep.guest();
    })();
  }, [token]);
}