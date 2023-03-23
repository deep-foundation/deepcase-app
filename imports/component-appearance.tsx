import { motion, useAnimation } from 'framer-motion';
import React, { ReactNode, useEffect } from 'react';


const variants = {
  show: {
    // scale: 1,
    display: 'block',
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    // width: '100%',
    // height: '100%',
    borderRadius: '0%',
    transition: { duration: 0.5 }
  },
  hide: {
    display: 'none',
    scaleX: 0.3,
    scaleY: 0.1,
    opacity: 0,
    borderRadius: '50%',
    transition: { 
      // scale: { delay: 1 },
      duration: 0.8 
    }
  },
  initial: {
    display: 'none',
    originX: 0.5,
    originY: 0.5,
  }
}

export const Appearance = React.memo<any>(({
  children, 
  toggle,
  variantsAnimation = variants,
}:{
  children: ReactNode; 
  toggle?: boolean;
  variantsAnimation?: any;
}) => {
  const control = useAnimation();
  useEffect(() => {
    if (toggle === true) {
      control.start("show"); 
    } else {
      control.start("hide");
    }
  }, [control, toggle]);

  return (<motion.div
      variants={variantsAnimation}
      animate={control}
      style={{overflow: 'hidden', position: 'relative', width: 'max-content', height: '100%'}}
      initial={variantsAnimation.initial}
    >
      {children}
    </motion.div>
  )
})