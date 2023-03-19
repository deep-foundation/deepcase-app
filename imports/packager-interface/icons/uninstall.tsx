import * as React from "react"

export const Uninstall = ({
  stroke = '#8b8b8b',
  width = '1rem',
  height = '1rem',
}:{
  stroke?: string;
  width?: string;
  height?: string;
}) => {
  return (
    <svg
      strokeMiterlimit={10}
      viewBox="0 0 32 32"
      xmlns="http://www.w3.org/2000/svg"
      clipRule="evenodd"
      strokeLinecap="round"
      strokeLinejoin="round"
      width={width}
      height={height}
    >
      <g fill="none" stroke={stroke} strokeWidth={1.96031}>
        <path d="M13.719 16.203l-.132 14.433" />
        <path
          d="M30.464 22.844L13.69 30.637M29.612 8.84l-16 7.4M1.733 22.854l11.854 7.782M1.588 8.425l11.855 7.782M9.196 5.28l11.437 7.606M11.417 4.269l11.437 7.562M1.564 8.425L1.53 22.748M30.458 8.625l.013 14.061M17.911 1.363L1.787 8.323M17.911 1.363l12.547 7.262"
          strokeLinejoin="miter"
        />
      </g>
    </svg>
  )
}