import { useEffect, useRef, useState } from "react";

export function useRerenderer(interval: number = 1000) {
  const [rerender, setRerender] = useState(0);
  const ref = useRef<any>();
  useEffect(() => {
    clearInterval(ref.current);
    ref.current = setInterval(() => {
      setRerender(renderer => renderer > 9999 ? 0 : renderer + 1);
    }, interval);
  }, []);
}
