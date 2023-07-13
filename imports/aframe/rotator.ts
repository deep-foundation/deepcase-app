AFRAME.registerComponent("rotator", {
  init: function() {
      const graph = document.querySelector("[forcegraph]");
      const rightHand = document.getElementById("right");
      const leftHand = document.getElementById("left");
      const rPinch = new THREE.Vector3();

      rightHand.addEventListener("pinchstarted", evt => {
          rPinch.copy(evt.detail.position)
      })

      rightHand.addEventListener("pinchmoved", evt => {
          if (lPinchActive) return;

          const pos = evt.detail.position;
          if (Math.abs(pos.x - rPinch.x) < 0.01) return;

          const alphaX = pos.x > rPinch.x ? 0.09 : -0.09;
          const alphaY = pos.y > rPinch.y ? 0.09 : -0.09;
          const alphaZ = pos.z > rPinch.z ? 0.09 : -0.09;
          const rotationX = graph.object3D.rotation.x
          const rotationY = graph.object3D.rotation.y
          const rotationZ = graph.object3D.rotation.z
          graph.object3D.rotation.set(alphaX + rotationX, alphaY + rotationY, alphaZ + rotationZ)
          rPinch.copy(evt.detail.position)
      })


      var rPinchActive = false;
      var lPinchActive = false;
      rightHand.addEventListener("pinchended", evt => {
          rPinchActive = false;
      })
      leftHand.addEventListener("pinchstarted", evt => {
          lPinchActive = true;
      })

      leftHand.addEventListener("pinchended", evt => {
          lPinchActive = false;
      })
  }
})