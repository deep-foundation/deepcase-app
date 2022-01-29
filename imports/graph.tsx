// @flow
import { makeStyles } from '@material-ui/core';
import _ from 'lodash';
import React, { Component, useState, useCallback, useRef, useEffect } from 'react';

let ForceGraph3D, ForceGraph2D, ForceGraphAR, ForceGraphVR, ForceGraph, SpriteText, Three;

import diff from 'deep-diff';

const useStyles = makeStyles(() => ({
  wrapper: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: '100%',
    height: '100%',
    '& > div, & > div > div': {
      position: 'absolute',
      left: 0,
      top: 0,
      width: '100%',
      height: '100%',
    }
  },
}));

if (_.get(process, 'browser')) {
  SpriteText = require('three-spritetext').default;
  Three = require('three');

  ForceGraph3D = require('react-force-graph').ForceGraph3D;
  ForceGraph2D = require('react-force-graph').ForceGraph2D;
  ForceGraphAR = require('react-force-graph').ForceGraphAR;
  ForceGraphVR = require('react-force-graph').ForceGraphVR;

  ForceGraph = React.memo((props: any) => {
    const fgRef = useRef<any>();
    const activeRef = props?.fgRef || fgRef;
    const [last, setLast] = useState(0);
    const Component = props.Component || ForceGraph3D;
    const classes = useStyles();

    const onNodeClick = useCallback(node => {
      const now = new Date().valueOf();
      const res = now - last;
      setLast(now);
      if (res < 600) {
        const distance = 300;
        const distRatio = 1 + distance/Math.hypot(node.x, node.y, node.z);
        activeRef.current.cameraPosition(
          // new position
          { x: node.x * distRatio, y: node.y * distRatio, z: node.z * distRatio },
          node, // lookAt ({ x, y, z })
          1000,  // ms transition duration
        );
      }
      props.onNodeClick && props.onNodeClick(node);
    }, [activeRef, last]);

    return <div className={classes.wrapper}><Component
      {...props}
      ref={activeRef}
      // TODO arrows without slow fps
      // linkDirectionalArrowLength={10}
      // linkDirectionalArrowRelPos={0.9}
      // linkCurvature={0.25}
      onNodeClick={onNodeClick}
    /></div>;
  });
} else {
  SpriteText = (...args: any): any => null;
  
  ForceGraph3D = () => null;
  ForceGraph2D = () => null;
  ForceGraphAR = () => null;
  ForceGraphVR = () => null;

  ForceGraph = () => null;
}

export { SpriteText, ForceGraph3D, ForceGraph2D, ForceGraphAR, ForceGraphVR, ForceGraph, Three };
