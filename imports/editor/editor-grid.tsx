import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Box, Center, Flex, Icon, useColorMode } from '@chakra-ui/react';
import { useChackraColor } from '../get-color';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { ChevronLeftIcon, ChevronRightIcon } from '@chakra-ui/icons';
import ReactResizeDetector from 'react-resize-detector';

interface IGrid {
  columns?: any;
  editorTabsElement?: any;
  editorTextAreaElement?: any;
  editorRight?: any;
  closeAllButtonElement?: any;
  closeButtonElement?: any;
  editorRightSwitch?: any;
}


export const EditorGrid = React.memo<any>(({
  columns = 'repeat(2, 50%)',
  editorTabsElement,
  editorTextAreaElement,
  editorRight,
  closeAllButtonElement,
  closeButtonElement,
  editorRightSwitch,
}:IGrid) => {
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const { colorMode } = useColorMode();

  return (<Box 
      display='flex'
      flexDir='column'
      h='100vh'
      // bg={colorMode == 'light' ? white : gray900} 
      sx={{ opacity: 0.98 }}
    >
      <Flex>
        <Center>{closeAllButtonElement}</Center>
        <Box sx={{width: 'calc(100% - 4rem)'}}>{editorTabsElement}</Box>
        <Center>{closeButtonElement}</Center>
      </Flex>
      <VerticalSash 
        editorTextAreaElement={editorTextAreaElement} 
        editorRight={editorRight} 
        editorRightSwitch={editorRightSwitch}
      />
    </Box>
  )
})

export const VerticalSash = ({
  editorTextAreaElement,
  editorRight,
  editorRightSwitch,
}:IGrid) => {
  const sashX = useMotionValue(0);
  const leftWidth = useTransform(sashX, (value) => `${Math.max(0, value)}px`);
  const rightPaneLeft = useTransform(sashX, (value) => `${Math.max(0, value) + 5}px`);

  const sashRef = useRef(null);
  const containerRef = useRef(null);
  const rightPaneRef = useRef(null);
  const isDragging = useRef(false);

  const isBrowser = () => typeof window !== undefined;

  useEffect(() => {
    const updateRightPanelWidth = () => {
      if (rightPaneRef.current) {
        const leftPaneWidth = parseFloat(leftWidth.get());
        const container = containerRef.current;
        const rightPane = rightPaneRef.current;
        const containerWidth = container.offsetWidth;
        const rightPaneWidth = containerWidth - leftPaneWidth - 5;
        rightPane.style.width = `${rightPaneWidth}px`;
      }
    };

    leftWidth.onChange(updateRightPanelWidth);
    window.addEventListener('resize', updateRightPanelWidth);

    const handleMove = (clientX) => {
      if (isDragging.current && sashRef.current) {
        const container = containerRef.current;
        const containerRect = container.getBoundingClientRect();
        sashX.set(clientX - containerRect.left);
      }
    };

    const handleMouseMove = (event) => {
      handleMove(event.clientX);
    };

    const handleTouchMove = (event) => {
      handleMove(event.touches[0].clientX);
    };

    const handleMouseUp = () => {
      isDragging.current = false;
    };

    const handleTouchEnd = () => {
      isDragging.current = false;
    };

    if (isBrowser()) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      window.addEventListener('touchmove', handleTouchMove);
      window.addEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', updateRightPanelWidth);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
        window.removeEventListener('touchmove', handleTouchMove);
        window.removeEventListener('touchend', handleTouchEnd);
      };
    }


  }, [leftWidth, sashX]);

  const onResize = (width) => {
    sashX.set(width / 2);
  };

  return (<ReactResizeDetector handleWidth onResize={onResize} targetRef={containerRef} handleHeight={false}>
      <div ref={containerRef} style={{ position: 'relative', width: '100%', height: '100%' }}>
        {/* Left pane */}
        <motion.div
          style={{
            position: 'absolute',
            width: leftWidth,
            height: '100%',
            borderRight: '1px solid #ccc',
            overflow: 'initial',
          }}
        >
          {/* Left pane content goes here */}
          {editorTextAreaElement}
        </motion.div>
        {/* Vertical sash */}
        <motion.div
          ref={sashRef}
          style={{
            position: 'absolute',
            left: leftWidth,
            width: '5px',
            height: '100%',
            background: '#ccc',
            cursor: 'col-resize',
          }}
          onPointerDown={() => {
            isDragging.current = true;
          }}
        />
        {/* Right pane */}
        <motion.div
          ref={rightPaneRef}
          style={{
            position: 'absolute',
            left: rightPaneLeft,
            right: 0,
            height: '100%',
            overflow: 'auto',
          }}
        >
          <Box
            display='grid' 
            gridTemplateRows='1fr max-content' 
            h='100%'
            position="relative" 
            overflow='scroll'
          >
            {/* Right pane content goes here */}
            {editorRight}
            {editorRightSwitch}
          </Box>
        </motion.div>
      </div>
    </ReactResizeDetector>
  );
};