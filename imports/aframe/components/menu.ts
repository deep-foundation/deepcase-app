// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";


AFRAME.registerComponent('menu', {
  schema: {
    controller: { type: 'selector' }
  },

  init: function () {
    this.menu = null;
    this.startTime = null;
    this.intersectedEl = null;
    this.menuTimeout = null;
    
    this.el.addEventListener('raycaster-intersected', (event) => {
      this.startTime = performance.now();
      this.intersectedEl = event.detail.el;
      console.log('raycaster-intersected with:', this.intersectedEl);
    });

    this.el.addEventListener('raycaster-intersected-cleared', () => {
      if (this.startTime) {
        this.startTime = null;
        this.intersectedEl = null;
        console.log('raycaster-intersected-cleared');
      }
      this.deleteMenu();
    });
  },
  
  tick: function() {
    if (this.startTime && !this.menu && performance.now() - this.startTime >= 1000) {
      this.createMenu();
    }
  },

  createMenu: function() {
    this.deleteMenu();
    this.menu = new THREE.Group();
    
    const insertBox = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshNormalMaterial());
    insertBox.position.set(0, 0.05, 0);

    const deleteBox = new THREE.Mesh(new THREE.BoxGeometry(0.05, 0.05, 0.05), new THREE.MeshNormalMaterial());
    deleteBox.position.set(0, -0.05, 0);

    this.menu.add(insertBox);
    this.menu.add(deleteBox);
    this.el.object3D.add(this.menu);
    
    // Remove menu after 5 seconds
    this.menuTimeout = setTimeout(() => this.deleteMenu(), 5000);
    
    console.log("Menu created");
  },

  deleteMenu: function() {
    if (this.menu) {
      this.el.object3D.remove(this.menu);
      this.menu = null;
      clearTimeout(this.menuTimeout);
      console.log('Menu deleted');
    }
  }
});