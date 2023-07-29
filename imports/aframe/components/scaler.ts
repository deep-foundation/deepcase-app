// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";

AFRAME.registerComponent("scaler", {
  init: function () {
    this.graph = document.querySelector("[forcegraph]");
    const rightController = document.getElementById("right");
    const leftController = document.getElementById("left");
    this.resizeStarted = false; // Resizing starts with both hands or controllers are active.
    this.rGripPos = new THREE.Vector3();
    this.lGripPos = new THREE.Vector3();
    this.rPinchPos = new THREE.Vector3();
    this.lPinchPos = new THREE.Vector3();
    this.currentScale = 1;

    // hands

    this.lPinchActive = false;
    this.rPinchActive = false;

    rightController.addEventListener("pinchstarted", evt => {
      this.rPinchActive = true;
      this.rPinchPos.copy(evt.detail.position)
      if (this.lPinchActive) {
        this.resizeStarted = true; // Enable resizing once both pinches are activated
      }
    })
    rightController.addEventListener("pinchmoved", evt => {
      this.rPinchPos.copy(evt.detail.position)
    })
    rightController.addEventListener("pinchended", evt => {
      this.rPinchActive = false;
      if (!this.lPinchActive) {
        this.baseDistance = 0;
        this.resizeStarted = false; // Disable resizing when both pinches are deactivated
      }
    })
    leftController.addEventListener("pinchstarted", evt => {
      this.lPinchActive = true;
      this.lPinchPos.copy(evt.detail.position)
      if (this.rPinchActive) {
        this.resizeStarted = true; // Enable resizing once both pinches are activated
      }
    })
    leftController.addEventListener("pinchmoved", evt => {
      this.lPinchPos.copy(evt.detail.position)
    })
    leftController.addEventListener("pinchended", evt => {
      this.lPinchActive = false;
      if (!this.rPinchActive) {
        this.baseDistance = 0;
        this.resizeStarted = false; // Disable resizing when both pinches are deactivated
      }
    })

    // controllers

    this.lGripActive = false;
    this.rGripActive = false;

    rightController.addEventListener("gripdown", evt => {
      this.rGripActive = true;
      this.rGripPos.copy(rightController.object3D.position);
      if (this.lGripActive) {
        this.resizeStarted = true; // Enable resizing once both grips are activated
      }
    })
    rightController.addEventListener("el-moved", evt => {
      this.rGripPos.copy(evt.detail.position);
    })
    rightController.addEventListener("gripup", evt => {
      this.rGripActive = false;
      if (!this.lGripActive) {
        this.baseDistance = 0;
        this.resizeStarted = false; // Disable resizing when both grips are deactivated
      }
    })
    leftController.addEventListener("gripdown", evt => {
      this.lGripActive = true;
      this.lGripPos.copy(leftController.object3D.position);
      if (this.rGripActive) {
        this.resizeStarted = true; // Enable resizing once both grips are activated
      }
    })
    leftController.addEventListener("el-moved", evt => {
      this.lGripPos.copy(leftController.object3D.position);
    })
    leftController.addEventListener("gripup", evt => {
      this.lGripActive = false;
      if (!this.rGripActive) {
        this.baseDistance = 0;
        this.resizeStarted = false; // Disable resizing when both grips are deactivated
      }
    })
  },
  tick: function () {
  if (this.resizeStarted) { // Resize only when resizeStarted is true
    if (!this.baseDistance) {
      this.currentScale = this.graph.object3D.scale.x;
      // Calculate the base distance based on both grips and pinches
      this.baseDistance = this.rGripActive || this.lGripActive
        ? this.lGripPos.distanceTo(this.rGripPos)
        : this.lPinchPos.distanceTo(this.rPinchPos);
    }

    const currentDistance = this.rGripActive || this.lGripActive
      ? this.lGripPos.distanceTo(this.rGripPos)
      : this.lPinchPos.distanceTo(this.rPinchPos);

    let scale = currentDistance / this.baseDistance;
    scale = scale * this.currentScale;
    this.graph.object3D.scale.set(scale, scale, scale);
  }
}
})