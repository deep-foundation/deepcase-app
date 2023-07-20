import * as THREE from "three";

export function generateLabel(value, color = "rgba(255, 255, 255, 1)") {
  var canvas = document.createElement("canvas");
  var ctx = canvas.getContext("2d");
  ctx.font = "Bold 200px Arial";
  var metrics = ctx.measureText(value);
  var width = metrics.width;
  var height = 200;
  canvas.width = width;
  canvas.height = height;
  ctx.font = "Bold 200px Arial";
  ctx.fillStyle = color;
  ctx.fillText(value, 0, height - 30);
  ctx.fillStyle = "rgba(255, 255, 255, 0)"; // Completely transparent
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  var texture = new THREE.CanvasTexture(canvas);
  texture.needsUpdate = true;

  // Use plane geometry
  var geometry = new THREE.PlaneGeometry(width / 40, height / 50);
  var material = new THREE.MeshBasicMaterial({
    map: texture,
    transparent: true,
    side: THREE.DoubleSide
  });
  return new THREE.Mesh(geometry, material);
}
