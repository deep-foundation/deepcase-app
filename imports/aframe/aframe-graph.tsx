import * as THREE from "three";
import { useState, useRef, useEffect, useMemo } from "react";
import { Entity, Scene } from "aframe-react";
import { generateLabel } from "./generate-label";
import { getColorFromId } from "./get-color-from-id";
import { getGraphData } from "./get-graph-data";
import { useNodeDragger } from "./hooks/use-node-dragger";
import { useSpaceId } from "../hooks";

export const AframeGraph = ({ deep, links }) => {
  const [spaceId, setSpaceId] = useSpaceId();

  const handleNodeHover = (node) => {
    if (node) {
      // console.log({ node });
      // var sceneEl = document.querySelector('a-scene');
      // console.log(sceneEl.querySelector(`#${node.id}`));
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
  const { initialize } = useNodeDragger();

  const graphData = useMemo(() => {
    return getGraphData(deep, links, spaceId);
  }, [links])

  return (
    <>
      <Scene scaler rotator dragger id="scene" vr-mode-ui="enterVRButton: #vr; enterARButton: #ar" renderer="logarithmicDepthBuffer: true">
        <Entity
          camera={{ active: true, fov: 94 }}
          look-controls={{ enabled: true }}
          wasd-controls={{ enabled: true, fly: true }}
          orbit-controls={{ enabled: true }}
          position={{ x: -1, y: 4, z: 10 }}
        ></Entity>
        {/* <Entity
            collider
            cursor={{ rayOrigin:"mouse", mouseCursorStylesEnabled: true}}
            raycaster="objects: [forcegraph];"
          /> */}
        {/* <Entity
          id="lefthand"
          raycaster="show-line:true; objects: [forcegraph]"
          hand-controls={{ hand: "left" }}
        />
        <Entity
          id="righthand"
          el-movement
          raycaster="show-line:true; objects: #sphere, [forcegraph]"
          hand-controls={{ hand: "right" }}
        /> */}
        <Entity
          id="left"
          el-movement
          raycaster="show-line:true; lineColor: steelblue; lineOpacity: 0.85; objects: #sphere, [forcegraph]"
          laser-controls={{ hand: "left" }}
          hand-tracking-controls={{ hand: "left" }}
        />
        <Entity
          id="right"
          el-movement
          raycaster="show-line:true; lineColor: steelblue; lineOpacity: 0.85; objects: #sphere, [forcegraph]"
          laser-controls={{ hand: "right" }}
          hand-tracking-controls={{ hand: "right" }}
          hand-tracking-extras
        // events={{
        //   loaded: () => {
        //     initialize();
        //   }
        // }}
        >
          <Entity finger-cursor raycaster="objects: [forcegraph]; lineColor: steelblue; lineOpacity: 0.85;" />
        </Entity>
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
          id="fg"
          scale={{ x: 0.02, y: 0.02, z: 0.02 }}
          position={{ x: 0, y: 0.5, z: 0 }}
          forcegraph={{
            nodes: graphData.nodes,
            links: graphData.edges,
            // dagMode: "radialout",
            // dagNodeFilter: (node) => node.type_id === 55 ? false : true,
            linkWidth: 0.4,
            linkDirectionalArrowLength: 4,
            linkDirectionalArrowRelPos: 1,
            nodeResolution: 16,
            nodeColor: (node) => getColorFromId(node.type_id),
            nodeOpacity: 1,
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
                emissiveIntensity: 2
              });
              let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
              group.add(sphere);

              // const camera = document.querySelector("[camera]").object3D;
              // // create an AudioListener and add it to the camera
              // const listener = new THREE.AudioListener();
              // camera.add(listener);

              // create the PositionalAudio object (passing in the listener)
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
        <Entity
          id="sphere"
          geometry={{ primitive: "sphere", radius: 0.5 }}
          position={{ x: 5, y: 2, z: 0 }}
          material={{
            shader: "standard",
            color: "#a200ff",
            emissive: "#a200ff",
            emissiveIntensity: 1
          }} />
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
