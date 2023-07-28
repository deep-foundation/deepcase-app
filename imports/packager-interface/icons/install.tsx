import * as React from "react"

export const Install = ({
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
      <g stroke={stroke}>
        <g fill="none" strokeWidth={1.45427}>
          <path d="M14.048 19.578l-.098 10.708" />
          <path
            d="M26.912 24.446l-12.968 5.826M25.838 14.116l-11.869 5.49M28.702 17.544l-11.734 5.437M5.156 24.513l8.794 5.773M1.154 15.794l8.795 5.773M5.049 13.808l8.794 5.773M5.155 18.462l-.181 5.971M26.962 18.777l-.05 5.669"
            strokeLinejoin="miter"
          />
          <path
            d="M9.949 21.567l3.894-1.986M1.154 15.794l3.895-1.986M16.968 22.981l-2.999-3.374M28.702 17.544l-2.86-3.475"
            strokeLinecap="butt"
            strokeLinejoin="miter"
          />
          <path
            d="M10.992 11.386l-5.796 2.348M9.744 5.914l-6.129 2.47"
            strokeLinejoin="miter"
          />
          <path d="M3.615 8.385l1.434 5.423" />
          <path
            d="M20.484 10.662l5.358 3.407M21.46 8.802l9.287 5.896M30.846 14.749l-5.004-.68"
            strokeLinejoin="miter"
          />
        </g>
        <g strokeWidth={1.71984}>
          <path
            d="M15.503 1.714a5.914 5.914 0 100 11.828 5.914 5.914 0 000-11.828z"
            fill={stroke}
            fillOpacity={0}
            strokeLinecap="butt"
          />
          <g fill="none">
            <path d="M12.452 6.788l2.58 3.276M15.032 10.064l3.521-4.873" />
          </g>
        </g>
      </g>
    </svg>
  )
}