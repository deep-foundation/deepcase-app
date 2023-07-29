// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";

AFRAME.registerComponent("dragger", {
  init: function () {
    const graph = document.querySelector("[forcegraph]");
    const rightController = document.getElementById("right");
    const leftController = document.getElementById("left");
    this.dragDisabled = false; // Set true when both grips are pressed or both pinches are started 

    // hands

    this.lGripPos = new THREE.Vector3();
    this.lPinchPos = new THREE.Vector3();

    leftController.addEventListener("pinchstarted", evt => {
      this.lPinchActive = true;
      this.lPinchPos.copy(evt.detail.position)
      if (this.rPinchActive){
        this.dragDisabled = true; // Disable drag when both pinches are started
      }
    })
    leftController.addEventListener("pinchmoved", evt => {
      if (this.rPinchActive || this.dragDisabled) return;
      if (this.lPinchActive) {
        const currentPos = evt.detail.position;

        const graphX = graph.object3D.position.x;
        const graphY = graph.object3D.position.y;
        const graphZ = graph.object3D.position.z;

        const deltaX = this.lPinchPos.x - currentPos.x
        const deltaY = this.lPinchPos.y - currentPos.y
        const deltaZ = this.lPinchPos.z - currentPos.z

        graph.object3D.position.set(graphX - deltaX * 2, graphY - deltaY * 2, graphZ - deltaZ * 2);

        this.lPinchPos.copy(currentPos)
      }
    })
    leftController.addEventListener("pinchended", evt => {
      this.lPinchActive = false;
      if(!this.rPinchActive){
        this.dragDisabled = false; // Enable drag when both pinches are ended
      }
    })
    rightController.addEventListener("pinchstarted", evt => {
      this.rPinchActive = true;
      if (this.lPinchActive){
        this.dragDisabled = true; // Disable drag when both pinches are started
      }
    })
    rightController.addEventListener("pinchended", evt => {
      this.rPinchActive = false;
      if(!this.lPinchActive){
        this.dragDisabled = false; // Enable drag when both pinches are ended
      }
    })

    // controllers

    this.lGripActive = false;
    this.rGripActive = false;

    leftController.addEventListener("gripdown", evt => {
      this.lGripActive = true;
      this.lGripPos.copy(leftController.object3D.position);
      if (this.rGripActive){
        this.dragDisabled = true; // Disable drag when both grips are pressed
      }
    })
    leftController.addEventListener("el-moved", evt => {
      if (this.rGripActive || this.dragDisabled) return;
      if (this.lGripActive) {
        const currentPos = evt.detail.position;

        const graphX = graph.object3D.position.x;
        const graphY = graph.object3D.position.y;
        const graphZ = graph.object3D.position.z;

        const deltaX = this.lGripPos.x - currentPos.x
        const deltaY = this.lGripPos.y - currentPos.y
        const deltaZ = this.lGripPos.z - currentPos.z

        graph.object3D.position.set(graphX - deltaX * 2, graphY - deltaY * 2, graphZ - deltaZ * 2);

        this.lGripPos.copy(currentPos);
      }
    })
    leftController.addEventListener("gripup", evt => {
      this.lGripActive = false;
      if(!this.rGripActive){
        this.dragDisabled = false; // Enable drag when both grips are released
      }
    })
    rightController.addEventListener("gripdown", evt => {
      this.rGripActive = true;
      if (this.lGripActive){
        this.dragDisabled = true; // Disable drag when both grips are pressed
      }
    })
    rightController.addEventListener("gripup", evt => {
      this.rGripActive = false;
      if(!this.lGripActive){
        this.dragDisabled = false; // Enable drag when both grips are released
      }
    })
  }
})