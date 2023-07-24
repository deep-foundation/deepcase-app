// @ts-nocheck
import AFRAME from "aframe";
import * as THREE from "three";
import { getColorFromId } from "../get-color-from-id";
// import ThreeMeshUI from 'three-mesh-ui';

import FontJSON from '../assets/Roboto-mdsf.json';
import FontImage from '../assets/Roboto-mdsf.png';

// function makePanel() {

//   // Container block, in which we put the two buttons.
//   // We don't define width and height, it will be set automatically from the children's dimensions
//   // Note that we set contentDirection: "row-reverse", in order to orient the buttons horizontally

//   const container = new ThreeMeshUI.Block({
//     justifyContent: 'center',
//     contentDirection: 'row-reverse',
//     fontFamily: FontJSON,
//     fontTexture: FontImage,
//     fontSize: 0.07,
//     padding: 0.02,
//     borderRadius: 0.11
//   });

//   container.position.set(0, 0.2, 0.2);
//   container.rotation.x = -0.55;

//   // BUTTONS

//   // We start by creating objects containing options that we will use with the two buttons,
//   // in order to write less code.

//   const buttonOptions = {
//     width: 0.4,
//     height: 0.15,
//     justifyContent: 'center',
//     offset: 0.05,
//     margin: 0.02,
//     borderRadius: 0.075
//   };

//   // Options for component.setupState().
//   // It must contain a 'state' parameter, which you will refer to with component.setState( 'name-of-the-state' ).

//   const hoveredStateAttributes = {
//     state: 'hovered',
//     attributes: {
//       offset: 0.035,
//       backgroundColor: new THREE.Color(0x999999),
//       backgroundOpacity: 1,
//       fontColor: new THREE.Color(0xffffff)
//     },
//   };

//   const idleStateAttributes = {
//     state: 'idle',
//     attributes: {
//       offset: 0.035,
//       backgroundColor: new THREE.Color(0x666666),
//       backgroundOpacity: 0.3,
//       fontColor: new THREE.Color(0xffffff)
//     },
//   };

//   // Buttons creation, with the options objects passed in parameters.

//   const buttonNext = new ThreeMeshUI.Block(buttonOptions);
//   const buttonPrevious = new ThreeMeshUI.Block(buttonOptions);

//   // Add text to buttons

//   buttonNext.add(
//     new ThreeMeshUI.Text({ content: 'next' })
//   );

//   buttonPrevious.add(
//     new ThreeMeshUI.Text({ content: 'previous' })
//   );

//   // // Create states for the buttons.
//   // // In the loop, we will call component.setState( 'state-name' ) when mouse hover or click

//   // const selectedAttributes = {
//   //   offset: 0.02,
//   //   backgroundColor: new THREE.Color(0x777777),
//   //   fontColor: new THREE.Color(0x222222)
//   // };

//   // buttonNext.setupState({
//   //   state: 'selected',
//   //   attributes: selectedAttributes,
//   //   onSet: () => { }
//   // });
//   // buttonNext.setupState(hoveredStateAttributes);
//   // buttonNext.setupState(idleStateAttributes);

//   // //

//   // buttonPrevious.setupState({
//   //   state: 'selected',
//   //   attributes: selectedAttributes,
//   //   onSet: () => { }
//   // });
//   // buttonPrevious.setupState(hoveredStateAttributes);
//   // buttonPrevious.setupState(idleStateAttributes);

//   // //

//   container.add(buttonNext, buttonPrevious);

//   return container;
// }


AFRAME.registerComponent('collider', {
  dependencies: ['raycaster'],
  schema: {
    controllerPosition: { type: 'vec3' },
  },

  init: function () {
    const el = this.el;
    const state = this.state = {};
    const sceneEl = this.el.sceneEl;
    const handObject3D = this.el.object3D;
    console.log({ el });
    console.log({ handObject3D });
    el.addEventListener('raycaster-intersection', ev => {
      state.hoverDetail = ev.detail;
      state.nodeObject = ev.detail.intersections[0].object.parent
      
      console.log("intersected: ");
      console.log({ev});
      console.log((state));
    });
    el.addEventListener('raycaster-intersection-cleared', ev => {
      state.hoverDetail = undefined;
      state.nodeObject = undefined;
      console.log({ev});
      console.log("cleared: " + {ev});
    });
    // const sphereGeometry = new THREE.SphereGeometry(0.05, 16, 16);
    // const sphereMaterial = new THREE.MeshStandardMaterial({
    //   color: "#32a852",
    //   emissive: "#32a852",
    //   emissiveIntensity: 10
    // });
    // let sphere = new THREE.Mesh(sphereGeometry, sphereMaterial);
    // sphere.position.set(0.1, 0, 0);
    // el.object3D.add(sphere)'

    // const menu = makePanel();
    // this.el.object3D.add(menu);
    el.addEventListener("triggerdown", evt => {
      state.drag = true;
      console.log("triggerdown:  " + {evt})
    })
    el.addEventListener("triggerup", evt => {
      state.drag = false;
      console.log("triggerup:  " + {evt})
    })

    //  const intersection = state.hoverDetail
    //   ? state.hoverDetail.getIntersection(this.el) // available in raycaster-intersected events
    //   : undefined;

    // if (intersection) console.log({ intersection });
  },

  tick: function () {
    const state = this.state;
    const raycaster = this.el.components.raycaster
    if(state.nodeObject !== undefined) {
       
    }
    // ThreeMeshUI.update();
    // Find closest intersecting object
    // prefer raycaster events over mouseenter/mouseleave because they expose immediately available intersection data via detail.getIntersection()
    // Update hover (intersected) object
    // const intersection = state.hoverDetail
    //   ? raycaster.getIntersection(state.hoverDetail) // available in raycaster-intersected events
    //   : undefined;

    // if (intersection) console.log({ intersection });
  }
});