// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";

export const useNodeDragger = function useNodeDragger () {
  //useMinilinksQuery
  //useDeepSubscription

  useEffect(()=>{
    const el = document.getElementById("#right");
    const raycasterIntersection = function (evt) {
      // nodeObject ref = evt.detail.intersections[0].object.parent
      state.nodeObject = evt.detail.intersections[0].object
      state.dragOffset = state.nodeObject.position.clone().sub(el.object3D.position);
      console.log('Intersected: ', state.nodeObject);
      console.log('dragOffset: ', state.dragOffset);
    };
    el.addEventListener('raycaster-intersection', raycasterIntersection);

    const raycasterIntersectionCleared = function (evt) {
      state.nodeObject = undefined;
      state.dragOffset = undefined;
      console.log('Intersection cleared: ', evt.detail);
    };
    el.addEventListener('raycaster-intersection-cleared', raycasterIntersectionCleared);

    const triggerdown = function () {
      // isDragged ref = true
      if (state.nodeObject) {
        state.isDragging = true;
      }
      console.log('triggerdown');
    };
    el.addEventListener('triggerdown', triggerdown);

    const triggerup = function () {
      // isDragged ref = false
      state.isDragging = false;
      console.log('triggerup');
    };
    el.addEventListener('triggerup', triggerup);

    return () => {
      el.removeEventListener('raycaster-intersection', raycasterIntersection);
      el.removeEventListener('raycaster-intersection-cleared', raycasterIntersectionCleared);
      el.removeEventListener('triggerdown', triggerdown);
      el.removeEventListener('triggerup', triggerup);
    };
  }, [])

  // ref to store dragged object
  // useEffect to fire and clear events
  // inside triggerdown
}

AFRAME.registerComponent('node-dragger', {
dependencies: ['raycaster', 'oculus-touch-controls'],
  init: function () {
    const el = this.el;
    const state = this.state = {};

    el.addEventListener('raycaster-intersection', function (evt) {
      // nodeObject ref = evt.detail.intersections[0].object.parent
      state.nodeObject = evt.detail.intersections[0].object
      state.dragOffset = state.nodeObject.position.clone().sub(el.object3D.position);
      console.log('Intersected: ', state.nodeObject);
      console.log('dragOffset: ', state.dragOffset);
    });

    el.addEventListener('raycaster-intersection-cleared', function (evt) {
      state.nodeObject = undefined;
      state.dragOffset = undefined;
      console.log('Intersection cleared: ', evt.detail.el);
    });

    el.addEventListener('triggerdown', function () {
      // isDragged ref = true
      if (state.nodeObject) {
        state.isDragging = true;
      }
      console.log('triggerdown pss');
    });

    el.addEventListener('triggerup', function () {
      // isDragged ref = false
      state.isDragging = false;
      console.log('triggerup');
    });
  },

  tick: function () {
    const state = this.state;

    if (state.isDragging && state.nodeObject !== undefined) {
      const controllerPosition = this.el.object3D.position;
      const newPosition = controllerPosition.add(state.dragOffset);
      state.nodeObject.position.set(1,1,1);
    }
  }
});