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
    debug('useCheckAuth');
    const isAuth = !!(deep.linkId && token && token === deep.token);
    // validate
    if (isAuth) (async () => {
      const result = await deep.select({ id: deep.linkId });
      filledRef.current = true;
      if (!result?.data?.length) {
        debug(`user ${deep.linkId} invalid`);
        deep.logout();
      } else {
        debug(`user ${deep.linkId} valid`);
      }
    })();
    // fill
    if (!isAuth && !filledRef.current) (async () => {
      filledRef.current = true;
      const { linkId } = await deep.guest();
    })();
  }, [token]);
}