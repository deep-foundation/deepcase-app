import { useEffect, useRef } from "react";

export function defaultGenerateId(id) {
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
  elementIds = [],
  generateId = defaultGenerateId,
}: {
  cytoRef: any;
  elementIds: string[];
  generateId?: (id: string) => string;
}) {
  const divRef = useRef<HTMLDivElement>();

  useEffect(() => {
    function updatePanZoom({pan, zoom}: { pan: { x: number, y: number }, zoom: number }) {
      const val = `translate(${pan.x}px,${pan.y}px) scale(${zoom})`;
      const origin = "top left";
  
      divRef.current.style.webkitTransform = val;
      divRef.current.style.msTransform = val;
      divRef.current.style.transform = val;
      divRef.current.style.webkitTransformOrigin = origin;
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

    function renderPosition(id: string, position: any) {
      const element = document.getElementById(generateId(id));
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
          stl.msTransform = val;
          stl.transform = val;
        }

        cy.$(id).style({  });
      }
    }

    const handleUpdate =(e) => renderPosition(e.target.id(), getNodePosition(e.target));
    const handleRender =(e) => updatePanZoom({ pan: cy.pan(), zoom: cy.zoom() });

    const cy = cytoRef.current._cy;
    cy.on("render", handleRender);
    cy.on("add", handleUpdate);
    cy.on("layoutstop", ({cy}: any) => {
      cy.elements().forEach((e: any) => {
        renderPosition(e.id(), getNodePosition(e));
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
    {elementIds.map(id => <div style={{
      position: 'absolute',
      left: 0, top: 0,
    }} id={generateId(id)}></div>)}
  </div>;
}