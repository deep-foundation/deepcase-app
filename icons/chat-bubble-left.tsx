import React, {useState} from 'react';


export const BubbleArrowLeft = ({
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