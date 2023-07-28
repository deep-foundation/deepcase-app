import { Dispatch, SetStateAction, useRef } from "react";

export function useRefstarter<S>() {
  return useRef<{ value?: S, setValue?: (S) => any; }>({ setValue: () => {} });
}
export function Refstater<S extends any>({
  stateRef,
  useHook,
}: {
  stateRef?: { current: { value?: S, setValue?: (S) => any; } };
  useHook?: () => [S, (S) => any];
}) {
  const result = useHook();
  stateRef.current = { value: result[0], setValue: result[1] };
  return null;
}
