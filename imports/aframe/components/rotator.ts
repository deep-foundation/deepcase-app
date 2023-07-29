// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";

AFRAME.registerComponent("rotator", {
  init: function () {
    const graph = document.querySelector("[forcegraph]");
    const rightController = document.getElementById("right");
    const leftController = document.getElementById("left");
    this.rotationDisabled = false; // Set true when both grips are pressed 

    // hands

    this.rPinchActive = false;
    this.lPinchActive = false;
    this.rPinchPos = new THREE.Vector3();

    rightController.addEventListener("pinchstarted", evt => {
      this.rPinchActive = true;
      this.rPinchPos.copy(evt.detail.position);
      if (this.lPinchActive) {
        this.rotationDisabled = true; // Disable rotation when both pinches are started
      }
    })

    rightController.addEventListener("pinchmoved", evt => {
      if (this.lPinchActive || this.rotationDisabled) return; // Disable rotation when the rotation is disabled
      if (this.rPinchActive) {
        const currentPos = evt.detail.position;

        if (Math.abs(currentPos.x - this.rPinchPos.x) < 0.01) return;

        const alphaX = currentPos.x > this.rPinchPos.x ? 0.09 : -0.09;
        const alphaY = currentPos.y > this.rPinchPos.y ? 0.09 : -0.09;
        const alphaZ = currentPos.z > this.rPinchPos.z ? 0.09 : -0.09;

        const rotationX = graph.object3D.rotation.x
        const rotationY = graph.object3D.rotation.y
        const rotationZ = graph.object3D.rotation.z

        graph.object3D.rotation.set(alphaX + rotationX, alphaY + rotationY, alphaZ + rotationZ)

        this.rPinchPos.copy(currentPos);
      }
    })

    rightController.addEventListener("pinchended", evt => {
      this.rPinchActive = false;
      if (!this.lPinchActive) {
        this.rotationDisabled = false; // Enable rotation when both pinches are ended
      }
    })
    leftController.addEventListener("pinchstarted", evt => {
      this.lPinchActive = true;
      if (this.rPinchActive) {
        this.rotationDisabled = true; // Disable rotation when both pinches are pressed
      }
    })

    leftController.addEventListener("pinchended", evt => {
      this.lPinchActive = false;
      if (!this.rPinchActive) {
        this.rotationDisabled = false; // Enable rotation when both pinches are released
      }
    })

    // controllers

    this.rGripActive = false;
    this.lGripActive = false;
    this.rGripPos = new THREE.Vector3();

    rightController.addEventListener("gripdown", evt => {
      this.rGripActive = true;
      this.rGripPos.copy(rightController.object3D.position);
      if (this.lGripActive) {
        this.rotationDisabled = true; // Disable rotation when both grips are pressed
      }
    })

    rightController.addEventListener("el-moved", evt => {
      if (this.lGripActive || this.rotationDisabled) return; // Disable rotation when the rotation is disabled
      if (this.rGripActive) {
        const currentPos = evt.detail.position;

        if (Math.abs(currentPos.x - this.rGripPos.x) < 0.01) return;

        const alphaX = currentPos.x > this.rGripPos.x ? 0.09 : -0.09;
        const alphaY = currentPos.y > this.rGripPos.y ? 0.09 : -0.09;
        const alphaZ = currentPos.z > this.rGripPos.z ? 0.09 : -0.09;

        const rotationX = graph.object3D.rotation.x
        const rotationY = graph.object3D.rotation.y
        const rotationZ = graph.object3D.rotation.z

        graph.object3D.rotation.set(alphaX + rotationX, alphaY + rotationY, alphaZ + rotationZ)

        this.rGripPos.copy(currentPos);
      }
    })

    rightController.addEventListener("gripup", evt => {
      this.rGripActive = false;
      if (!this.lGripActive) {
        this.rotationDisabled = false; // Enable rotation when both grips have been released
      }
    })
    leftController.addEventListener("gripdown", evt => {
      this.lGripActive = true;
      if (this.rGripActive) {
        this.rotationDisabled = true; // Disable rotation when both grips are pressed
      }
    })

    leftController.addEventListener("gripup", evt => {
      this.lGripActive = false;
      if (!this.rGripActive) {
        this.rotationDisabled = false; // Enable rotation when both grips have been released
      }
    })
    // The same logic should be applied for pinchstarted, pinchmoved and pinchended events.
  }
})