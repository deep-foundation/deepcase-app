// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";

AFRAME.registerComponent("scaler", {
  init: function() {
      this.graph = document.querySelector("[forcegraph]");
      const rightHand = document.getElementById("right");
      const leftHand = document.getElementById("left");

      this.rPinch = new THREE.Vector3();
      this.rPinchActive = false;
      this.lPinch = new THREE.Vector3();
      this.lPinchActive = false;

      rightHand.addEventListener("pinchstarted", evt => {
          this.rPinchActive = true;
          this.rPinch.copy(evt.detail.position)
      })
      rightHand.addEventListener("pinchmoved", evt => {
          this.rPinch.copy(evt.detail.position)
      })
      rightHand.addEventListener("pinchended", evt => {
          this.rPinchActive = false;
          this.baseDistance = 0;
      })
      leftHand.addEventListener("pinchstarted", evt => {
          this.lPinchActive = true;
          this.lPinch.copy(evt.detail.position)
      })
      leftHand.addEventListener("pinchmoved", evt => {
          this.lPinch.copy(evt.detail.position)
      })
      leftHand.addEventListener("pinchended", evt => {
          this.lPinchActive = false;
          this.baseDistance = 0;
      })
      this.currentScale = 1;
  },
  tick: function() {
      if (!this.lPinchActive || !this.rPinchActive) return;
      if (!this.baseDistance) {
          this.currentScale = this.graph.object3D.scale.x;
          this.baseDistance = this.lPinch.distanceTo(this.rPinch);
      }
      const currentDistance = this.lPinch.distanceTo(this.rPinch);
      var scale = currentDistance / this.baseDistance;
      scale = scale * this.currentScale;
      this.graph.object3D.scale.set(scale, scale, scale);
  }
})
