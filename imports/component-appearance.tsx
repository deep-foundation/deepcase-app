import React, { ReactNode } from 'react';
import { motion, useAnimation } from 'framer-motion';


const variants = {
  show: {
    
  }
}

export const Appearance = React.memo<any>(({children}:{children: ReactNode;}) => {
  const control = useAnimation();

  return (<motion.div
      variants={variants}
      animate={control}
    >
      {children}
    </motion.div>
  )
})