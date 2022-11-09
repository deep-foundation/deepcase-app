import { Box, List, Spacer, Stat, StatHelpText, StatLabel, StatNumber, Table, TableCaption, TableContainer, Tbody, Td, Tfoot, Th, Thead, Tr, useColorModeValue } from '@chakra-ui/react';
import React, { ReactNode, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { TiPlusOutline } from 'react-icons/ti';
import { FcEnteringHeavenAlive, FcMindMap } from 'react-icons/fc';
import { size } from 'lodash';
import { Resize } from '../resize';
import ReactResizeDetector from 'react-resize-detector';
import { useMotionValue, useTransform, motion } from 'framer-motion';
import { GrBottomCorner } from 'react-icons/gr';
import { CustomizableIcon } from '../icons-provider';
import { useChackraColor } from '../get-color';


const SemicircularButton = React.memo<any>(({
  Icon = TiPlusOutline,
  borderRadius = '4rem 0 0 4rem',
  onClick = () => {},
}:{
  Icon?: any;
  borderRadius?: string;
  onClick?: () => any;
}) => {

  const blackAlpha = useChackraColor('blackAlpha.300');
  const whiteAlpha = useChackraColor('whiteAlpha.300');
  const colorGrayToWhite = useColorModeValue(blackAlpha, whiteAlpha);

  return (<Box 
      borderRadius={borderRadius} 
      display='flex'
      alignItems='center'
      justifyContent='center'
      borderWidth='1px'
      borderStyle='solid'
      borderColor={colorGrayToWhite}
      bg='whiteAlpha.100'
      _hover={{
        bg: 'whiteAlpha.300'
      }}
      maxW={12}
      onClick={onClick}
    >
      <Box pr={2} pl={2}>
        <Icon />
      </Box>
    </Box>
  )
})

const AddedChild = React.memo<any>(() => {
  return (<>
      <FcMindMap />
      <FcMindMap />
      <FcMindMap />
      <FcMindMap />
      <FcMindMap />
      <FcMindMap />
      <FcMindMap />
      <FcMindMap />
    </>
  )
})
const ExecComponent = React.memo<any>(() => {
  return (<>
      <FcEnteringHeavenAlive />
      <Stat>
        <StatLabel>Collected Fees</StatLabel>
        <StatNumber>£0.00</StatNumber>
        <StatHelpText>Feb 12 - Feb 28</StatHelpText>
      </Stat>
      <TableContainer>
        <Table variant='striped' colorScheme='teal'>
          <TableCaption>Imperial to metric conversion factors</TableCaption>
          <Thead>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th isNumeric>multiply by</Th>
            </Tr>
          </Thead>
          <Tbody>
            <Tr>
              <Td>inches</Td>
              <Td>millimetres (mm)</Td>
              <Td isNumeric>25.4</Td>
            </Tr>
            <Tr>
              <Td>feet</Td>
              <Td>centimetres (cm)</Td>
              <Td isNumeric>30.48</Td>
            </Tr>
            <Tr>
              <Td>yards</Td>
              <Td>metres (m)</Td>
              <Td isNumeric>0.91444</Td>
            </Tr>
          </Tbody>
          <Tfoot>
            <Tr>
              <Th>To convert</Th>
              <Th>into</Th>
              <Th isNumeric>multiply by</Th>
            </Tr>
          </Tfoot>
        </Table>
      </TableContainer>
    </>
  )
})

export const GridComponent = React.memo<any>(({
  mountChildren = <AddedChild />,
  unmountChildren = <AddedChild />,
  executableComponent = <ExecComponent />,
  fillSize = false,

}:{
  mountChildren?: any;
  unmountChildren?: any;
  executableComponent?: ReactNode;
  fillSize: boolean;
  // onChangeSize?: (size: { width: number, height: number }) => any;
  // size?: {width: number, height: number};
}) => {
  const ref = useRef<any>();
  const refUnmount = useRef<any>();
  const refMount = useRef<any>();

  const [height,  setHeight] = useState(0);
  const [width,  setWidth] = useState(0);
  const [widthMount,  setWidthMount] = useState(0);
  const [widthUnmount,  setWidthUnmount] = useState(0);

  console.log({height, width, widthMount, widthUnmount});
  const [viewSize, setViewSize] = useState({width: width, height: height});
  console.log({viewSize});
  
  useEffect(() => {
    setHeight(ref.current?.clientHeight);
    setWidth(ref.current?.clientWidth);
    setWidthMount(refMount.current?.clientWidth);
    setWidthUnmount(refUnmount.current?.clientWidth);
    setViewSize({width: ref.current?.clientWidth, height: ref.current?.clientHeight});
    console.log({height: ref.current?.clientHeight, width: ref.current?.clientWidth, widthMount, widthUnmount});
  }, []);
  console.log({height, width, widthMount, widthUnmount});
  
  console.log({viewSize});

  const blackAlpha = useChackraColor('blackAlpha.200');
  const whiteAlpha = useChackraColor('whiteAlpha.200');
  const colorGrayToWhite = useColorModeValue(blackAlpha, whiteAlpha);

  return (<>
    {/* <div
      style={{
        width: 490,
        height: 400,
        // ...props.style,
        backgroundColor: "#19e",
        display: "flex",
        placeItems: "center",
        placeContent: "center",
      }}
    >
      <motion.div
        style={{
          width: 100,
          height: 100,
          borderRadius: 10,
          backgroundColor: "#000",
          // cursor: "grab",
          position: 'relative',
        }}
        // drag
        // whileTap={{ cursor: "grabbing" }}
      >
        <motion.div
          style={{
            width: '1rem',
            height: '1rem',
            borderRadius: 10,
            backgroundColor: "#fff",
            cursor: "grab",
            position: 'absolute', top: 'calc(100% - 1rem)', left: 'calc(100% - 1rem)'
          }}
          drag
          // dragConstraints={{ left: -1, right: 1, top: -1, bottom: 1 }}
          dragElastic={0}
          dragMomentum={true}
          dragTransition={{ bounceDamping: 2 }}
          onDragStart={(event, info) => console.log(info.offset.x, info.offset.y) }
          whileTap={{ cursor: "grabbing" }} 
          ref={littleRef}  
        />
      </motion.div>
    </div> */}
    <Spacer />
    <Box>
      <Box
        display='flex'
        w='100%'
        height={viewSize.height}
        // minHeight={height}
        sx={{overscrollBehavior: 'none'}}
      >
        <SemicircularButton onClick={() => alert('left')} />
        <Box 
          display='flex'
          sx={{
            borderTop: `1px solid ${colorGrayToWhite}`,
            borderBottom: `1px solid ${colorGrayToWhite}`,
            overflow: 'hidden',
            '& > *:nth-of-type(even)': {
              p: 2
            }
          }}
        >
          <Box 
            position='relative'
            width={widthMount/2} 
            sx={{overscrollBehavior: 'contain'}}
            overflow='auto'
            display='flex' justifyContent='center'
          >
              <Box 
                ref={refMount}
                position='absolute'
                display='flex'
                flexDir='column'
                pt='0.5rem'
                sx={{
                  '&>*:not(:last-child)': {
                    mb: 2
                  }
                }}
              >
                {mountChildren}
              </Box>
          </Box>
          <Resize 
            size={viewSize} 
            onChangeSize={(viewSize) => setViewSize(viewSize)} 
            style={{
              borderTop: 'none', 
              borderBottom: 'none', 
              borderLeft: `1px solid ${colorGrayToWhite}`,
              borderRight: `1px solid ${colorGrayToWhite}`,
              overflow: 'hidden'
            }}
          >
            <Box 
              sx={{
                boxSizing: 'border-box',
                '::-webkit-scrollbar': {
                  display:'none'
                  // width: '2px',
                  // borderRadius: '2px',
                  // backgroundColor: `rgba(194, 219, 245, 0.5)`,
                },
                // '&::-webkit-scrollbar-thumb': {
                //   backgroundColor: `rgba(194, 219, 245, 1)`,
                // },
                overscrollBehavior: 'contain', 
                overflow: 'scroll',
                position: 'relative',
                w: width,
                h: height,
              }}
            >
              <Box ref={ref}
                display='flex' flexDir='column'
                pos='absolute' top={0} left={0}
                sx={{
                  '& > *:not(:last-child)': {
                    mb: '1rem',
                  },
                  boxSizing: 'border-box',
                }}
              >
                {executableComponent}
              </Box>
            </Box>
            <Box sx={{
                position: 'absolute', 
                right: '0.2rem', 
                bottom: '0.25rem', 
                w: '0.5rem',
                h: '0.5rem',
                borderRight: `1px solid ${colorGrayToWhite}`,
                borderBottom: `1px solid ${colorGrayToWhite}`,
                borderRadius: '0.05rem'
              }} 
            />
          </Resize>
          {/* {!fillSize && <div>
            <ReactResizeDetector handleWidth handleHeight onResize={(w, h) => onChangeSize({width: w, height: h})} />
            {executableComponent}
          </div>} */}
          <Box 
            width={widthUnmount/2}
            sx={{overscrollBehavior: 'contain'}}
            overflow='auto'
            position='relative'
            display='flex' justifyContent='center'
          >
            <Box 
              ref={refUnmount}
              position='absolute'
              display='flex'
              flexDir='column'
              pt='0.5rem'
              sx={{
                '&>*:not(:last-child)': {
                  mb: 2
                }
              }}
            >
              {unmountChildren}
            </Box>
          </Box>
        </Box>
        <SemicircularButton 
          borderRadius='0 4rem 4rem 0' 
          onClick={() => alert('right')}
        />
      </Box>
    </Box>
    </>
  )
})