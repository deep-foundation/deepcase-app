// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";

AFRAME.registerComponent("dragger", {
  init: function () {
    const graph = document.querySelector("[forcegraph]");
    // const rightController = document.getElementById("rightController");
    // const leftController = document.getElementById("leftController");
    const rightController = document.getElementById("right");
    const leftController = document.getElementById("left");

    // hands

    this.rPinchActive = false;
    this.lPinchActive = false;
    this.lPinchPos = new THREE.Vector3();

    leftController.addEventListener("pinchstarted", evt => {
      this.lPinchActive = true;
      this.lPinchPos.copy(evt.detail.position)
    })
    leftController.addEventListener("pinchmoved", evt => {
      if (this.rPinchActive) return;
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
    })
    rightController.addEventListener("pinchstarted", evt => {
      this.rPinchActive = true;
    })
    rightController.addEventListener("pinchended", evt => {
      this.rPinchActive = false;
    })

    // controllers

    this.rGripActive = false;
    this.lGripActive = false;
    this.lGripPos = new THREE.Vector3();

    leftController.addEventListener("gripdown", evt => {
      this.lGripActive = true;
      this.lGripPos.copy(leftController.object3D.position);
    });
    leftController.addEventListener("el-moved", evt => {
      if (this.rGripActive) return;
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
    });
    leftController.addEventListener("gripup", evt => {
      this.lGripActive = false;
    });
    rightController.addEventListener("gripdown", evt => {
      this.rGripActive = true;
    });
    rightController.addEventListener("gripup", evt => {
      this.rGripActive = false;
    });
  }
})