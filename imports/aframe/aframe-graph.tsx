import * as THREE from "three";
import { useState, useRef, useEffect } from "react";
import { Entity, Scene } from "aframe-react";
import { generateLabel } from "./generate-label";
import { getColorFromId } from "./get-color-from-id";
import { getGraphData } from "./get-graph-data";
import { CSS2DRenderer, CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js'

export const AframeGraph = ({ deep, links }) => {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });

  const handleNodeHover = (node) => {
    if (node) {
      console.log(node);
      // const sphereGeometry = new THREE.SphereGeometry(0.1, 16, 16);
      // const sphereMaterial = new THREE.MeshStandardMaterial({
      //   color: getColorFromId(node.type_id),
      //   emissive: getColorFromId(node.type_id),
      //   emissiveIntensity: 2
      // });
      // let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
      // // const acene = document.querySelector("[camera]").object3D;
      // const scene = document.getElementById("scene");
      // const hoverednode = document.getElementById(`${node.index}`);
      // console.log(hoverednode);

      // // @ts-ignore
      // scene.object3D.add(sphere)
      // sphere.position.set(node.vx, node.vy, node.vz)
      // console.log({scene})

    }
  }

  console.log(graphData)
  useEffect(() => {
    new Promise(async () => {
      setGraphData(await getGraphData(deep, links))
    });

  }, [links, deep])

  return (
    <>
      <Scene id="scene" vr-mode-ui="enterVRButton: #vr; enterARButton: #ar" renderer="logarithmicDepthBuffer: true">
        <Entity
          camera={{ active: true, fov: 94 }}
          look-controls={{ enabled: true }}
          wasd-controls={{ enabled: true, fly: true }}
          orbit-controls={{ enabled: true }}
          position={{ x: -1, y: 4, z: 10 }}
        ></Entity>
        <Entity id="player" collider-check >
          <Entity
            cursor=" mouseCursorStylesEnabled: true;"
            // raycaster="show-line:true; objects: [forcegraph];"
          /></Entity>
          <Entity
            id="left"
            collider-check
            super-hands
            raycaster="show-line:true; objects: [forcegraph];"
            laser-controls={{hand:"left"}}
          />
          <Entity
            id="right"
            super-hands
            raycaster="show-line:true; objects: [forcegraph];"
            laser-controls="hand: right;"
          />
        {/* <Entity
          scale={{ x: 0.02, y: 0.02, z: 0.02 }}
          position={{ x: 7, y: 2.5, z: 6 }}
          forcegraph={{
            nodes: JSON.stringify(graphData.nodes),
            links: JSON.stringify(graphData.edges),
            linkWidth: 1,
            linkDirectionalArrowLength: 8,
            linkDirectionalArrowRelPos: 1,
            nodeAutoColorBy: "type_id",
            nodeThreeObjectExtend: true,
            nodeThreeObject: (node) => {
              // create a group
              const group = new THREE.Group();

              // Create two labels for over and under the sphere
              let yDistance = 6; // Adjust this to change the y relative distance of the labels
              let overLabel = generateLabel(node.id, "red");
              overLabel.position.set(0, yDistance, 0);

              group.add(overLabel);

              let underLabel = generateLabel(node.type_id, "blue");
              underLabel.position.set(0, -yDistance, 0);

              group.add(underLabel);

              return group;
            }
          }}
        /> */}
        <Entity
          scale={{ x: 0.05, y: 0.05, z: 0.05 }}
          position={{ x: 0, y: 10, z: 0 }}
          forcegraph={{
            nodes: JSON.stringify(graphData.nodes),
            links: JSON.stringify(graphData.edges),
            linkWidth: 0.4,
            linkDirectionalArrowLength: 4,
            linkDirectionalArrowRelPos: 1,
            nodeResolution: 16,
            nodeColor: (node) => getColorFromId(node.type_id),
            nodeOpacity: 0.6,
            nodeThreeObjectExtend: true,
            nodeThreeObject: (node) => {
              const group = new THREE.Group();

              let nodeid = generateLabel(node.id, getColorFromId(node.type_id));
              nodeid.position.set(0, 10, 0);
              group.add(nodeid);

              if (node.type) {
                let nodetype = generateLabel(node.type, getColorFromId(node.type_id));
                nodetype.position.set(0, 6, 0);
                group.add(nodetype);
              }

              if (node.name) {
                let nodename = generateLabel(node.name, getColorFromId(node.type_id));
                nodename.position.set(0, -6, 0);
                group.add(nodename);
              }


              const radius = 3; // Half the radius to make sphere smaller
              const sphereGeometry = new THREE.SphereGeometry(radius, 16, 16);
              const sphereMaterial = new THREE.MeshStandardMaterial({
                color: getColorFromId(node.type_id),
                emissive: getColorFromId(node.type_id),
                emissiveIntensity: 10
              });
              let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
              group.add(sphere);

              // const camera = document.querySelector("[camera]").object3D;
              // // create an AudioListener and add it to the camera
              // const listener = new THREE.AudioListener();
              // camera.add(listener);

              // // create the PositionalAudio object (passing in the listener)
              // const sound = new THREE.PositionalAudio(listener);

              // // load a sound and set it as the PositionalAudio object's buffer
              // const audioLoader = new THREE.AudioLoader();
              // audioLoader.load(thq, function (buffer) {
              //   sound.setBuffer(buffer);
              //   sound.setRefDistance(10);
              //   sound.setVolume(0.1);
              //   sound.play();
              // });
              // group.add(sound);
              return group;
            },
            onNodeHover: handleNodeHover,
            // onNodeHover: () => {
            //   const sphereGeometry = new THREE.SphereGeometry(6, 16, 16);
            //   const sphereMaterial = new THREE.MeshStandardMaterial({
            //     color: getColorFromId(node.type_id),
            //     emissive: getColorFromId(node.type_id),
            //     emissiveIntensity: 2
            //   });
            //   let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
            //   sphere.position.set(node.x, node.y, node.z)
            // }
          }}
        />
        {/* <Entity
          environment={{
            preset: "moon",
            seed: 10,
            lighting: "distant",
            shadow: true,
            fog: 0.8,
            ground: "hills",
            groundYScale: 10,
            groundTexture: "walkernoise",
            groundColor: "#8a7f8a",
            grid: "none"
          }}
        /> */}
        {/* <Entity
          primitive="a-light"
          type="ambient"
          intensity="0.4"
          color="#00b3ff"
        /> */}
        {/* <Entity
          primitive="a-light"
          type="point"
          color="#4affe7"
          intensity="15"
          distance={10}
          position={{ x: 0, y: 5, z: 0 }}
        />
        <Entity
          primitive="a-light"
          type="point"
          color="#7600fc"
          intensity="18"
          distance={12}
          position={{ x: 9, y: 5, z: -6 }}
        />
        <Entity
          primitive="a-light"
          type="point"
          color="#92f041"
          intensity="20"
          distance={8}
          position={{ x: 7, y: 5, z: 6 }}
        /> */}
      </Scene>
    </>
  );
}
