import React from 'react';
import { IconContext } from "react-icons";


export const CustomizableIcon = React.memo<any>(({Component, value, style}:{Component: any; value?: any; style?: any;}) => {
  return (
    <IconContext.Provider value={{ ...value }}>
      <div>
        <Component style={style} />
      </div>
    </IconContext.Provider>
  )
})
