import * as React from "react";
// import { useIsomorphicLayoutEffect } from "https://framer.com/m/framer/useIsomorphicLayoutEffect.js@^0.2.0";
// let safeResizeObserver = undefined;
// try {
//     if (typeof window !== undefined) {
//         safeResizeObserver = window.ResizeObserver;
//     }
// } catch (e) {
//     // happy linting!
// }
// class SharedObserver {
//     //@ts-ignore
//     updateResizedElements(entries) {
//         for (const entry of entries) {
//             const callbackForElement = this.callbacks.get(entry.target);
//             if (callbackForElement) callbackForElement(entry.contentRect);
//         }
//     }
//     observeElementWithCallback(element, callback) {
//         if (!this.sharedResizeObserver) return;
//         this.sharedResizeObserver.observe(element);
//         this.callbacks.set(element, callback);
//     }
//     unobserve(element) {
//         if (!this.sharedResizeObserver) return;
//         this.sharedResizeObserver.unobserve(element);
//         this.callbacks.delete(element);
//     }
//     constructor() {
//         this.callbacks = new WeakMap();
//         const ResizeObserver1 = safeResizeObserver;
//         if (!ResizeObserver1) return;
//         this.sharedResizeObserver = new ResizeObserver1(this.updateResizedElements.bind(this));
//     }
// }
// const sharedResizeObserver = new SharedObserver();
// /**
//  * Uses a globally shared resize observer, and returns an updated
//  * size object when the element's size changes. This is the recommended way to
//  * use a Resize Observer: https://github.com/WICG/resize-observer/issues/59.
//  */ 
// export function useMeasuredSize(ref, callback) {
//     const [size, setSize] = React.useState(null);
//     function updateSize(newSize) {
//         if (!size || newSize.height !== size.height || newSize.width !== size.width) {
//             if (callback) callback(newSize);
//             setSize({ width: newSize.width, height: newSize.height });
//         }
//     } // On mount, immediately measure and set a size. This will defer paint until
//     // no more updates are scheduled. Additionally add our element to the shared
//     // ResizeObserver with a callback to perform when the element resizes.
//     // Finally, remove the element from the observer when the component is unmounted.
//     useIsomorphicLayoutEffect(() => {
//         if (!ref.current) return;
//         const { offsetWidth, offsetHeight } = ref.current; // Defer paint until initial size is added.
//         updateSize({ width: offsetWidth, height: offsetHeight }); // Resize observer will race to add the initial size, but since the size
//         // is set above, it won't trigger a render on mount since it should
//         // match the measured size. Future executions of the callback will
//         // trigger renders if the size changes.
//         sharedResizeObserver.observeElementWithCallback(ref.current, updateSize);
//         return () => {
//             if (!ref.current) return;
//             sharedResizeObserver.unobserve(ref.current);
//         };
//     }, []);
//     return size;
// }
// export function useSizeChange(ref, callback) {
//     const size = React.useRef(null);
//     const updateSize = React.useCallback(
//         (newSize) => {
//             if (!size.current || newSize.height !== size.current.height || newSize.width !== size.current.width) {
//                 size.current = { width: newSize.width, height: newSize.height };
//                 if (callback) callback(size.current);
//             }
//         },
//         [callback]
//     ); // On mount, immediately measure and set a size. This will defer paint until
//     // no more updates are scheduled. Additionally add our element to the shared
//     // ResizeObserver with a callback to perform when the element resizes.
//     // Finally, remove the element from the observer when the component is unmounted.
//     useIsomorphicLayoutEffect(() => {
//         if (!ref.current) return;
//         const { offsetWidth, offsetHeight } = ref.current; // Defer paint until initial size is added.
//         updateSize({ width: offsetWidth, height: offsetHeight }); // Resize observer will race to add the initial size, but since the size
//         // is set above, it won't trigger a render on mount since it should
//         // match the measured size. Future executions of the callback will
//         // trigger renders if the size changes.
//         sharedResizeObserver.observeElementWithCallback(ref.current, updateSize);
//         return () => {
//             if (!ref.current) return;
//             sharedResizeObserver.unobserve(ref.current);
//         };
//     }, [callback]);
//     return null;
// }
// export const __FramerMetadata__ = { exports: { useSizeChange: { type: "function", annotations: { framerContractVersion: "1" } }, useMeasuredSize: { type: "function", annotations: { framerContractVersion: "1" } } } };
// //# sourceMappingURL=./useMeasuredSize.map
