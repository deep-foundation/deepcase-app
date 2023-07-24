// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";

AFRAME.registerComponent('node-dragger', {
  dependencies: ['raycaster', 'oculus-touch-controls'],
  init: function () {
    const el = this.el;
    const state = this.state = {};

    el.addEventListener('raycaster-intersection', function (evt) {
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
      if (state.nodeObject) {
        state.isDragging = true;
      }
      console.log('triggerdown');
    });

    el.addEventListener('triggerup', function () {
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