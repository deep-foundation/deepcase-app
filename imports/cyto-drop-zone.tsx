import { Box } from '@chakra-ui/react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';

let counter = 0;

export function CytoDropZone({
  refCy,
  children,
  render=({
    getRootProps,
    input,
    isDragAccept,
    isDragActive,
    isDragReject,
    children,
  }) => (
    <Box>
      <Box {...getRootProps({})} onClick={() => {}} position="fixed" left={0} top={0} w={'100%'} h={'100%'} bg={
        isDragActive ? 'blue' : isDragAccept ? 'green' : isDragReject ? 'red' : 'transparent'
      }>
        {input}
        {children}
      </Box>
    </Box>
  ),
}: {
  refCy?: any;
  render?: any;
  children?: any;
}) {
  const deep = useDeep();

  const onDrop = (files, a, event) => {
    const cy = refCy.current._cy;
    const pan = cy.pan();
    const zoom = cy.zoom();
    console.log(event, cy, pan, zoom);
    const id = counter++;
    const _id = `file-${id}`;
    cy.add({
      id: `file-${_id}`,
      data: { id: _id, label: _id },
      position: { x: ((event.clientX) - (pan.x)) / zoom, y: ((event.clientY) - (pan.y)) / zoom },
      locked: true,
      classes: 'file',
    });
  };
  const {
    getRootProps,
    getInputProps,
    isDragActive,
    isDragAccept,
    isDragReject,    
  } = useDropzone({
    onDrop
  });

  const input = <input {...getInputProps()} />;

  return render({
    getRootProps,
    input,
    isDragActive,
    isDragAccept,
    isDragReject,
    children,
    deep,
  });
}