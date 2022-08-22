import { Box, Flex, HStack, Link, Text, useColorMode, useColorModeValue } from '@chakra-ui/react';
import React, { useState } from 'react';
import { IconContext } from "react-icons";
import { BsCheck2, BsCheck2All } from 'react-icons/bs';
import Linkify from 'react-linkify';
import { MessageTextArea } from './cyto-message-textarea';
import { CytoReactLinkAvatar } from './cyto-react-avatar';
import { useChackraColor, useChackraGlobal } from './get-color';


const BubbleArrowRight = ({
  width="12pt",
  height="12pt",
  fill="rgba(0,0,0, 0.5)",
  stroke="transparent",
  strokeOpacity=0.5,
  strokeWidth=0,
  ...props
}) => {
  const [invisible, setInvisible] = useState(true);


  return <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    style={{ isolation: "isolate" }}
    viewBox="0 0 12 12"
    width={width}
    height={height}
    {...props}
  >
    <defs>
      <clipPath id="bubble-arrow-right">
        <path d="M0 0H12V12H0z" />
      </clipPath>
    </defs>
    <g clipPath="url(#bubble-arrow-right)">
      <path
        d="M6.991.597Q7 5.126 7.817 6.928q.817 1.802 3.519 3.887c.223.171.177.342-.101.38q-3.837.525-6.033-.275-2.196-.801-4.679-2.822L6.991.597z"
        fill={fill}
        vectorEffect="non-scaling-stroke"
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeLinecap="square"
        strokeMiterlimit={3}
      />
    </g>
  </svg>
}

const BubbleArrowLeft = ({
  width="12pt",
  height="12pt",
  fill="rgba(0,0,0, 0.5)",
  stroke="transparent",
  strokeOpacity=0.5,
  strokeWidth=0,
  ...props
}) => {
  const [invisible, setInvisible] = useState(true);


  return <svg
    xmlns="http://www.w3.org/2000/svg"
    xmlnsXlink="http://www.w3.org/1999/xlink"
    style={{ isolation: "isolate" }}
    viewBox="0 0 12 12"
    width={width}
    height={height}
    {...props}
  >
    <defs>
      <clipPath id="bubble-arrow-left">
        <path d="M0 0H12V12H0z" />
      </clipPath>
    </defs>
    <g clipPath="url(#bubble-arrow-left)">
      <path
        d="M5.009.597Q5 5.126 4.183 6.928 3.366 8.73.664 10.815c-.223.171-.177.342.101.38q3.837.525 6.033-.275 2.196-.801 4.679-2.822L5.009.597z"
        fill={fill}
        vectorEffect="non-scaling-stroke"
        strokeWidth={strokeWidth}
        stroke={stroke}
        strokeOpacity={strokeOpacity}
        strokeLinecap="square"
        strokeMiterlimit={3}
      />
    </g>
  </svg>
}

const Done = React.memo<any>(() => {
  return(<IconContext.Provider value={{ color: "blue", className: 'done-icon' }}>
      <div>
        <BsCheck2 />
      </div>
    </IconContext.Provider>
  )
})
const DoneAllOpacity = React.memo<any>(() => {
  return(<IconContext.Provider value={{ color: "blue", className: 'done-icon' }}>
      <div>
        <BsCheck2All />
      </div>
    </IconContext.Provider>
  )
})
const DoneAll = React.memo<any>(() => {
  return(<IconContext.Provider value={{ color: "primary", className: 'done-all-icon' }}>
      <div>
        <BsCheck2All />
      </div>
    </IconContext.Provider>
  )
})

interface IMessage {
  date?: Date;
  text: any;
  align?: 'left' | 'right';
  arrow?: 'none' | 'left' | 'right';
  fill?: string;
  color?: string;
  src?: any;
  emoji?: any;
  name?: any;
  stage?: 'none' | 'sended' | 'received' | 'viewed';
  flexDivProps?: any;
  messageDivProps?: any;
  answerButton?: any;
}

export const CytoReactMessage = React.memo<any>(({
  text='Однообразные мелькают Все с той же болью дни мои, Как будто розы опадают И умирают соловьи. Но и она печальна тоже, Мне приказавшая любовь, И под ее атласной кожей Бежит отравленная кровь.',
  align = 'left',
  arrow = align,
  fill = align === 'right' ? '#dcdcdc' : '#cce4ff',
  color = '#000',
  src,
  emoji='💀',
  name,
  stage = 'none',
  flexDivProps = {},
  messageDivProps = {},
  answerButton,
}:IMessage) => {

  const globalStyle = useChackraGlobal();
  const textColor = useChackraColor(globalStyle.body.color);
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const colorBorderSelected = useChackraColor('primary');
  const colorGrayToWhite = useColorModeValue(gray900, white);
  const colorFocus = useColorModeValue(gray900, white);
  const colorWhiteToGray = useColorModeValue(white, gray900);
  const { colorMode, toggleColorMode } = useColorMode();

  const _stage = (
    stage === 'sended' ? <Done /> :
    stage === 'received' ? <DoneAllOpacity /> :
    stage === 'viewed' ? <DoneAll /> :
    null
  );

  return (<>
      <Flex maxW='sm' direction='column' alignItems='flex-end'>
        <HStack maxW='sm' display='flex' alignItems='flex-end' spacing={2}>
          {arrow === 'left' && <CytoReactLinkAvatar emoji={emoji} name={name} src={src} />}
          <Box {...flexDivProps} sx={{
            ...flexDivProps.style,
            width: 'calc(100% - 55px)',
            display: 'flex',
            alignItems: align === 'right' ? 'flex-end' : 'flex-start',
            justifyContent: align === 'right' ? 'flex-end' : 'flex-start',
          }}>
            <Box
              padding='0.5rem 0.75rem'
              position='relative'
              w='auto'
              maxW='100%'
              wordWrap='break-word'
              wordBreak='break-word'
              borderRadius='2xl'
              boxSizing='border-box'
              sx={{
                clear: 'both',
                'hyphens': 'auto',
              }}  
              {...messageDivProps} style={{
              ...messageDivProps.style,
              backgroundColor: fill,
            }}>
              <Linkify componentDecorator={(decoratedHref: string, decoratedText: string, key: number) => <Link href={decoratedHref} children={decoratedText} key={key} onClick={(event) => {
                event.stopPropagation();
              }}/>}>
                <Text fontSize='sm' color={gray900}>
                  {text}
                </Text>
              </Linkify>
              {arrow === 'left' && <BubbleArrowLeft fill={fill} style={{position: 'absolute', left: -6, bottom: 0}} />}
              {arrow === 'right' && <BubbleArrowRight fill={fill} style={{position: 'absolute', right: -6, bottom: 0}} />}
            </Box>
          </Box>
          {align === 'right' && <CytoReactLinkAvatar emoji={emoji} name={name} src={src} />}
        </HStack>
        {answerButton}
        <MessageTextArea />
      </Flex>
    </>
  )
})

