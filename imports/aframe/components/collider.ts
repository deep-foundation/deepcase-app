// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";
import { getColorFromId } from "../get-color-from-id";


AFRAME.registerComponent('collider', {
  dependencies: ['raycaster'],
  schema: {
    controllerPosition: { type: 'vec3' }
  },

  init: function () {
    const el = this.el;
    const sceneEl = this.el.sceneEl;
    el.addEventListener('raycaster-intersection', function (e) {
      const handpos = el.object3D.position;
      console.log(handpos)
      const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      const sphereMaterial = new THREE.MeshStandardMaterial({
        color: "#32a852",
        emissive: "#32a852",
        emissiveIntensity: 10
      });
      let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      console.log(sceneEl)
      sceneEl.object3D.add(sphere)
      sphere.position.set(1, 1, 1);

    });
  }
});