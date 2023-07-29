import { useEffect, useRef, useState } from 'react';
import { useFocusMethods } from '../../hooks';

export const useNodeDragger = function useNodeDragger() {
  //useMinilinksQuery
  //useDeepSubscription

  const elRef = useRef<any>();
  const raycastedObject = useRef<any>();
  const nodeObject = useRef<any>();
  const isDrag = useRef<boolean>();
  const startPos = useRef<any>();
  const newNodePos = useRef<any>();
  const { focus, unfocus } = useFocusMethods();

  const refRaycasterIntersection = useRef<any>();
  const refRaycasterIntersectionCleared = useRef<any>();
  const refTriggerdown = useRef<any>();
  const refTriggerup = useRef<any>();
  const refElMoved = useRef<any>();

  const initialize = () => {
    let el;
    setTimeout(() => {
      elRef.current = el = document.getElementById("right");
      
      refRaycasterIntersection.current = function (evt) {
        raycastedObject.current = evt.detail.intersections[0].object.parent.__data;
        console.log('Intersected!');
        console.log(raycastedObject.current);
      };
      el.addEventListener('raycaster-intersection', refRaycasterIntersection.current);

      refRaycasterIntersectionCleared.current = function (evt) {
        if (!isDrag.current) {
          raycastedObject.current = undefined;
        } else console.log('Intersection cleared: ', evt.detail);
        
      };
      el.addEventListener('raycaster-intersection-cleared', refRaycasterIntersectionCleared.current);

      refTriggerdown.current = function (evt) {
        isDrag.current = true;
        startPos.current = el.getAttribute('position');
        nodeObject.current = raycastedObject.current;
        console.log('triggerdown');
        console.log(startPos.current);
      };
      el.addEventListener('triggerdown', refTriggerdown.current);

      refElMoved.current = function (evt) {
        if (nodeObject.current && isDrag.current && startPos.current) {
          const pos = evt.detail.position;
          const deltaX = startPos.current.x - pos.x;
          const deltaY = startPos.current.y - pos.y;
          const deltaZ = startPos.current.z - pos.z;
          console.log('el-moved!');
          // @ts-ignore
          newNodePos.current = { x: nodeObject.current.x - deltaX * 3, y: nodeObject.current.y - deltaY * 3, z: nodeObject.current.z - deltaZ * 3 }
          console.log(newNodePos.current);
          // @ts-ignore
          // focus(raycastedObject.current.id, { x: raycastedObject.current.x - deltaX*3, y: raycastedObject.current.y - deltaY*3, z: raycastedObject.current.z - deltaZ*3 });
        }
      }
      el.addEventListener('el-moved', refElMoved.current);

      refTriggerup.current = function (evt) {
        if (nodeObject.current && isDrag.current && newNodePos.current) {
          // @ts-ignore
          focus(raycastedObject.current.id, newNodePos.current);
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
        el.removeEventListener('triggerup', refElMoved.current);
      }
    };
  }, []);

  // ref to store dragged object
  // useEffect to fire and clear events
  // inside triggerdown

  return { initialize };
}