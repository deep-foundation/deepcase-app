// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";

AFRAME.registerComponent("scaler", {
  init: function () {
    this.graph = document.querySelector("[forcegraph]");
    // const rightHand = document.getElementById("right");
    // const leftHand = document.getElementById("left");
    const rightController = document.getElementById("right");
    const leftController = document.getElementById("left");

    // hands

    this.currentScale = 1;
    this.rPinchPos = new THREE.Vector3();
    this.lPinchPos = new THREE.Vector3();
    this.lPinchActive = false;
    this.rPinchActive = false;

    rightController.addEventListener("pinchstarted", evt => {
      this.rPinchActive = true;
      this.rPinchPos.copy(evt.detail.position)
    })
    rightController.addEventListener("pinchmoved", evt => {
      this.rPinchPos.copy(evt.detail.position)
    })
    rightController.addEventListener("pinchended", evt => {
      this.rPinchActive = false;
      this.baseDistance = 0;
    })
    leftController.addEventListener("pinchstarted", evt => {
      this.lPinchActive = true;
      this.lPinchPos.copy(evt.detail.position)
    })
    leftController.addEventListener("pinchmoved", evt => {
      this.lPinchPos.copy(evt.detail.position)
    })
    leftController.addEventListener("pinchended", evt => {
      this.lPinchActive = false;
      this.baseDistance = 0;
    })

    // controllers

    this.lGripActive = false;
    this.rGripActive = false;
    this.rGripPos = new THREE.Vector3();
    this.lGripPos = new THREE.Vector3();

    rightController.addEventListener("gripdown", evt => {
      this.rGripActive = true;
      this.rGripPos.copy(rightController.object3D.position);
      console.log("R-GRIPDOWN")
    })
    rightController.addEventListener("el-moved", evt => {
      this.rGripPos.copy(evt.detail.position);
    })
    rightController.addEventListener("gripup", evt => {
      this.rGripActive = false;
      this.baseDistance = 0;
      console.log("R-GRIPUP")
    })
    leftController.addEventListener("gripdown", evt => {
      this.lGripActive = true;
      this.lGripPos.copy(leftController.object3D.position);
    })
    leftController.addEventListener("el-moved", evt => {
      this.lGripPos.copy(leftController.object3D.position);
    })
    leftController.addEventListener("gripup", evt => {
      this.lGripActive = false;
      this.baseDistance = 0;
    })

  },
  tick: function () {
    if (this.lPinchActive && this.rPinchActive) {
      if (!this.baseDistance) {
        this.currentScale = this.graph.object3D.scale.x;
        this.baseDistance = this.lPinchPos.distanceTo(this.rPinchPos);
      }
      const currentDistance = this.lPinchPos.distanceTo(this.rPinchPos);
      let scale = currentDistance / this.baseDistance;
      scale = scale * this.currentScale;
      this.graph.object3D.scale.set(scale, scale, scale);
    }
    if (this.lGripActive && this.rGripActive) {
      if (!this.baseDistance) {
        this.currentScale = this.graph.object3D.scale.x;
        this.baseDistance = this.lGripPos.distanceTo(this.rGripPos);
      }
      const currentDistance = this.lGripPos.distanceTo(this.rGripPos);
      let scale = currentDistance / this.baseDistance;
      scale = scale * this.currentScale;
      this.graph.object3D.scale.set(scale, scale, scale);
    }
  }
})
