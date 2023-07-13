AFRAME.registerComponent("dragger", {
  init: function () {
    const graph = document.querySelector("[forcegraph]");
    const rightHand = document.getElementById("right");
    const leftHand = document.getElementById("left");
    const lPinch = new THREE.Vector3();
    const delta = new THREE.Vector3();

    var rPinchActive = false;
    var lPinchActive = false;

    leftHand.addEventListener("pinchstarted", evt => {
      this.lPinchActive = true;
      lPinch.copy(evt.detail.position)
    })

    leftHand.addEventListener("pinchmoved", evt => {
      if (rPinchActive) return;

      const pos = evt.detail.position;
      const graphX = graph.object3D.position.x;
      const graphY = graph.object3D.position.y;
      const graphZ = graph.object3D.position.z;
      
      const deltaX = lPinch.x - pos.x
      const deltaY = lPinch.y - pos.y
      const deltaZ = lPinch.z - pos.z
      graph.object3D.position.set(graphX - deltaX*2, graphY - deltaY*2, graphZ - deltaZ*2);
      lPinch.copy(evt.detail.position)
    })

    leftHand.addEventListener("pinchended", evt => {
      lPinchActive = false;
    })
    rightHand.addEventListener("pinchstarted", evt => {
      rPinchActive = true;
    })
    rightHand.addEventListener("pinchended", evt => {
      rPinchActive = false;
    })
  },
  // tick: function() {
  //     if (!this.lPinchActive || this.rPinchActive) return;
  //     const graphX = this.graph.object3D.position.x;
  //     const graphY = this.graph.object3D.position.y;
  //     const graphZ = this.graph.object3D.position.z;
      
  //     const deltaX = this.lPinch.x - this.pos.x
  //     const deltaY = this.lPinch.y - this.pos.y
  //     const deltaZ = this.lPinch.z - this.pos.z
  //     this.graph.object3D.position.set(graphX + deltaX, graphY + deltaY, graphZ + deltaZ);
  // }
})