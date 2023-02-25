import React from 'react';
import { IconContext } from "react-icons";


export const CustomizableIcon = React.memo<any>(({Component, value}:{Component: any; value?: any;}) => {
  return (
    <IconContext.Provider value={{ ...value }}>
      <div>
        <Component />
      </div>
    </IconContext.Provider>
  )
})