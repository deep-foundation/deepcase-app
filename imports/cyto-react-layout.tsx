import { useEffect, useRef } from "react";
import ReactResizeDetector from 'react-resize-detector';

function getId(element) {
  return typeof(element.id) === 'function' ? element.id() : element.id;
}

export function defaultGenerateId(element) {
  const id = getId(element);
  return `${id}-layout-element`;
}

const align = {
  "top": -.5,
  "left": -.5,
  "center": 0,
  "right": .5,
  "bottom": .5
};

const halign = "center";
const valign = "center";
const halignBox = "center";
const valignBox = "center";

const aligns = [
  align[halign],
  align[valign],
  100 * (align[halignBox] - 0.5),
  100 * (align[valignBox] - 0.5)
];

export function CytoReactLayout({
  cytoRef,
  elements = [],
  generateId = defaultGenerateId,
}: {
  cytoRef: any;
  elements: any[];
  generateId?: (id: string) => string;
}) {
  const divRef = useRef<HTMLDivElement>();

  useEffect(() => {
    function updatePanZoom({pan, zoom}: { pan: { x: number, y: number }, zoom: number }) {
      const val = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
      const origin = "top left";
  
      divRef.current.style.webkitTransform = val;
      // @ts-ignore
      divRef.current.style.msTransform = val;
      divRef.current.style.transform = val;
      divRef.current.style.webkitTransformOrigin = origin;
      // @ts-ignore
      divRef.current.style.msTransformOrigin = origin;
      divRef.current.style.transformOrigin = origin;
    }

    function getNodePosition(node: any): any {
      return {
        w: node.width(),
        h: node.height(),
        x: node.position("x"),
        y: node.position("y")
      };
    }

    function renderPosition(cyElement: any, position: any) {
      const id = cyElement.id();
      const element = document.getElementById(generateId(cyElement));

      if (element) {
        const prevX = element.dataset.x;
        const prevY = element.dataset.y;

        const x = position.x + aligns[0] * position.w;
        const y = position.y + aligns[1] * position.h;

        if (!prevX || !prevY || prevX !== x || prevY !== y) {
          element.dataset.x = x;
          element.dataset.y = y;

          const valRel = `translate(${aligns[2]}%,${aligns[3]}%) `;
          const valAbs = `translate(${x.toFixed(2)}px,${y.toFixed(2)}px) `;
          const val = valRel + valAbs;
          const stl = element.style;
          stl.webkitTransform = val;
          // @ts-ignore
          stl.msTransform = val;
          stl.transform = val;
        }

        cy.$(id).style({  });
      }
    }

    const handleUpdate = (e) => renderPosition(e.target, getNodePosition(e.target));
    const handleRender = (e) => updatePanZoom({ pan: cy.pan(), zoom: cy.zoom() });

    const cy = cytoRef.current._cy;
    cy.on("render", handleRender);
    cy.on("add", handleUpdate);
    cy.on("layoutstop", ({cy}: any) => {
      cy.elements().forEach((e: any) => {
        renderPosition(e, getNodePosition(e));
      });
    });
    cy.on("data", handleUpdate);
    // cy.on("style", handleUpdate);
    cy.on("pan zoom", handleRender);
    cy.on("position bounds", handleUpdate); // "bounds" - not documented event
  }, []);
  return <div className="cyto-react-layout" ref={divRef} style={{
    position: 'absolute',
    left: 0, top: 0,
  }}>
    {elements.map((element) => {
      const cy = cytoRef.current._cy;
      const id = getId(element);
      const Component = cy.$(`#${id}`).data('Component');
      const reactElement = Component ? <Component id={id}/> : null;
      return <div style={{
        position: 'absolute',
        left: 0, top: 0,
      }} id={generateId(element)} key={id}>
        <ReactResizeDetector handleWidth handleHeight onResize={(width, height) => {
          cy.$(`#${id}`).data('react-element-size', { width, height });
          cy.$(`#${id}`).style({
            'shape': 'rectangle',
            'background': 'transparent',
            width,
            height,
          });
        }}/>
        {reactElement}
      </div>;
    })}
  </div>;
}