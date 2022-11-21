import { Box } from '@chakra-ui/react';
import { useDeep } from '@deep-foundation/deeplinks/imports/client';
import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { useContainer, useSpaceId } from '../hooks';
import axios from 'axios';

let counter = 0;

const NEXT_PUBLIC_GQL_SSL = process.env.NEXT_PUBLIC_GQL_SSL;
const NEXT_PUBLIC_GQL_PATH = process.env.NEXT_PUBLIC_GQL_PATH;
const NEXT_PUBLIC_DEEPLINKS_PATH = NEXT_PUBLIC_GQL_PATH.slice(0, -4);

export function CytoDropZone({
  cy,
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
  cy?: any;
  render?: any;
  children?: any;
}) {
  const deep = useDeep();
  const [container] = useContainer();
  const [space] = useSpaceId();

  const onDrop = async (files, a, event) => {
    const pan = cy.pan();
    const zoom = cy.zoom();
    console.log(event, cy, pan, zoom);
    const id = counter++;
    const _id = `file-${id}`;
    const file = files[0];
    if (container) {
      try {
        const { data: [{ id }] } = await deep.insert({
          type_id: deep.idSync('@deep-foundation/core', 'AsyncFile'),
          in: { data: [
            {
              type_id: deep.idSync('@deep-foundation/core', 'Contain'),
              from_id: container,
            },
            {
              type_id: deep.idSync('@deep-foundation/core', 'Focus'),
              from_id: space,
              object: { data: { value: { x: ((event.clientX) - (pan.x)) / zoom, y: ((event.clientY) - (pan.y)) / zoom } } },
              in: { data: [
                {
                  type_id: deep.idSync('@deep-foundation/core', 'Contain'),
                  from_id: container,
                },
              ] },
            },
          ] },
        });
        console.log('drop-zone id file', id, file);
        var formData = new FormData();
        formData.append("file", file);
        console.log('drop-zone formData', formData);
        await axios.post(`${NEXT_PUBLIC_GQL_SSL ? 'https://' : 'http://'}${NEXT_PUBLIC_DEEPLINKS_PATH}/file`, formData, {
          headers: {
            'linkId': id,
            "Authorization": `Bearer ${deep.token}`,
          },
        })
        console.log('drop-zone finish');
      } catch(error) {
        console.error(error);
      }
    }
    // cy.add({
    //   id: `file-${_id}`,
    //   data: { id: _id, label: _id },
    //   position: { x: ((event.clientX) - (pan.x)) / zoom, y: ((event.clientY) - (pan.y)) / zoom },
    //   locked: true,
    //   classes: 'file',
    // });
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