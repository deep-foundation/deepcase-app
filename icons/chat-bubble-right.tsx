import React, {useState} from 'react';


export const BubbleArrowRight = ({
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