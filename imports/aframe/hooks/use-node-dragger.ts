import { useEffect, useRef, useState } from 'react';
import { useFocusMethods } from '../../hooks';

export const useNodeDragger = function useNodeDragger () {
  //useMinilinksQuery
  //useDeepSubscription

  const elRef = useRef<any>();
  const nodeObject = useRef();
  const isDrag = useRef<boolean>();
  const { focus, unfocus } = useFocusMethods();

  const refRaycasterIntersection = useRef<any>();
  const refRaycasterIntersectionCleared = useRef<any>();
  const refTriggerdown = useRef<any>();
  const refTriggerup = useRef<any>();
  
  const initialize = () => {
    let el;
    setTimeout(() => {
      elRef.current = el = document.getElementById("right");
      refRaycasterIntersection.current = function (evt) {
        nodeObject.current = evt.detail.intersections[0].object.parent;
        console.log('Intersected!');
        console.log(nodeObject.current);
      };
      el.addEventListener('raycaster-intersection', refRaycasterIntersection.current);

      refRaycasterIntersectionCleared.current = function (evt) {
        nodeObject.current = undefined;
        console.log('Intersection cleared: ', evt.detail.el);
      };
      el.addEventListener('raycaster-intersection-cleared', refRaycasterIntersectionCleared.current);

      refTriggerdown.current = function () {
        isDrag.current = true;
        console.log('triggerdown');
      };
      el.addEventListener('triggerdown', refTriggerdown.current);

      refTriggerup.current = function () {
        if (nodeObject.current && isDrag.current) {
          // focus();
        }
        isDrag.current = false;
        console.log('triggerup');
      };
      el.addEventListener('triggerup', refTriggerup.current);
    }, 1000);
  };

  useEffect(() => {
    return () => {
      const el = elRef.current;
      if (el) {
        el.removeEventListener('raycaster-intersection', refRaycasterIntersection.current);
        el.removeEventListener('raycaster-intersection-cleared', refRaycasterIntersectionCleared.current);
        el.removeEventListener('triggerdown', refTriggerdown.current);
        el.removeEventListener('triggerup', refTriggerup.current);
      }
    };
  }, []);

  // ref to store dragged object
  // useEffect to fire and clear events
  // inside triggerdown

  return { initialize };
}