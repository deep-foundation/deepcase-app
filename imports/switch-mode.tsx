import React, { useEffect, useState } from 'react';
import { Box, Checkbox, Button, IconButton, Input, VisuallyHidden, useCheckbox, useColorMode, useColorModeValue } from '@chakra-ui/react';
import { motion, useAnimation } from 'framer-motion';
import { MoonIcon, SunIcon } from '@chakra-ui/icons';

const MotionBox = motion(Box);

const variants = {
  rise: {
    opacity: 1,
    y: '-1.15em', 
    x: '-0.22em',
  },
  down: {
    opacity: 0, 
    y: 0, 
    rotate: -30, 
    scale: 0.2,
  }
}

export const Switch = () => {
  const {colorMode, toggleColorMode} = useColorMode();
  const lightControls = useAnimation();
  const darkControls = useAnimation();

 useEffect(() => {
    if (colorMode === 'dark') {
      lightControls.start({ opacity: 0, y: 0, rotate: -30, scale: 0.1 });
      darkControls.start({ opacity: 1, y: '-1.15em', x: '-0.22em', scale: 1, rotate: 0 });
    } else {
      lightControls.start({ opacity: 1, y: '-1.15em', x: '-0.22em', rotate: 0, scale: 1 });
      darkControls.start({ opacity: 0, y: 0, rotate: -30, scale: 0.1 });
    }
  }, [colorMode, lightControls, darkControls]);

  const handleToggleColorMode = () => {
    toggleColorMode();
  }

  return (
    <Box as="label" pos="fixed" top='1rem' right='0.3rem'>
      <Button
        aria-label="Toggle Dark Mode"
        onClick={handleToggleColorMode}
        borderRadius="full"
        variant="ghost"
        borderColor='switchModeBorder'
        borderWidth='thin'
        pos='relative'
      >
        <Box pos="relative" zIndex="1">
          <MotionBox
            viewBox="0 0 12 12"
            aria-hidden="true"
            aria-label="light mode"
            animate={lightControls}
            transition={{ duration: 0.9 }}
            pos="absolute"
            top="0.45em"
            left="-0.225em"
            width="0.75em"
            height="0.75em"
          >
            <MoonIcon color='blue.500' />
          </MotionBox>
          <MotionBox
            viewBox="0 0 12 12"
            aria-hidden="true"
            aria-label="dark mode"
            animate={darkControls}
            transition={{ duration: 0.9 }}
            pos="absolute"
            top="0.45em"
            left="-0.225em"
            width="0.75em"
            height="0.75em"
          >
            <SunIcon color='blue.200' />
          </MotionBox>
        </Box>
      </Button>
    </Box>
  );
};


export const DarkModeSwitch = () => {
  const [isChecked, setIsChecked] = React.useState(false);
  const lightStroke = useColorModeValue('#000', '#fff');
  const darkStroke = useColorModeValue('#fff', '#000');

  const handleCheckboxChange = (event) => {
    setIsChecked(event.target.checked);
  };

  return (
    <Box position="relative">
      <Checkbox
        isChecked={isChecked}
        onChange={handleCheckboxChange}
        role="switch"
        size="md"
        borderRadius="full"
        borderColor={useColorModeValue('gray.600', 'gray.300')}
        width="3em"
        height="1.5em"
      />
      <motion.svg
        initial={false}
        animate={isChecked ? { opacity: 0, x: '-6', rotate: -30, scale: 0.75 } : { opacity: 1, x: 0, rotate: 0, scale: 1 }}
        viewBox="0 0 12 12"
        width="12px"
        height="12px"
        aria-hidden="true"
        style= {{
          position: "absolute",
          top: "0.375em",
          // right: "0.375em",
        }}
      >
        <g fill="none" stroke={lightStroke} strokeWidth="1" strokeLinecap="round">
          <circle cx="6" cy="6" r="2" />
          <g strokeDasharray="1.5 1.5">
            {[0, 45, 90, 135, 180, 225, 270, 315].map((rotation) => (
              <polyline
                key={rotation}
                points="6 10,6 11.5"
                transform={`rotate(${rotation},6,6)`}
              />
            ))}
          </g>
        </g>
      </motion.svg>
      <motion.svg
        initial={false}
        animate={isChecked ? { opacity: 1, x: '-12' } : { opacity: 0, x: 0 }}
        viewBox="0 0 12 12"
        width="12px"
        height="12px"
        aria-hidden="true"
        style= {{
          position: "absolute",
          top: "0.375em",
          // right: "0.375em",
        }}
      >
        <g fill="none" stroke={darkStroke} strokeWidth="1" strokeLinejoin="round" transform="rotate(-45,6,6)">
          <path d="m9,10c-2.209,0-4-1.791-4-4s1.791-4,4-4c.304,0,.598.041,.883.105-.995-.992-2.367-1.605-3.883-1.605C2.962.5.5,2.962 .5,6s2.462,5.5,5.5,5.5c1.516,0,2.888-.613,3.883-1.605-.285.064-.578.105-.883.105Z"/>
        </g>
      </motion.svg>
      <VisuallyHidden>Dark Mode</VisuallyHidden>
    </Box>
  );
};
