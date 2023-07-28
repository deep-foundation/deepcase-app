export const variants = {
  show: {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    borderRadius: '0.5rem',
    display: 'block',
    transition: { duration: 0.5 }
  },
  hide: {
    scaleX: 0.3,
    scaleY: 0.1,
    opacity: 0,
    borderRadius: '50rem',
    display: 'none',
    transition: {
      duration: 0.5,
      display: { delay: 0.6 },
      opacity: { duration: 0.4 },
    }
  },
  initial: {
    originX: 0,
    originY: 0,
    scaleX: 0,
    scaleY: 0,
    opacity: 0,
    display: 'none'
  }
}

export const buttonVariant = {
  show: {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    borderRadius: '0.5rem',
    display: 'block',
    transition: { duration: 0.5 }
  },
  hide: {
    scaleX: 0.3,
    scaleY: 0.1,
    opacity: 0,
    borderRadius: '50rem',
    display: 'none',
    transition: {
      duration: 0.5,
      display: { delay: 0.6 },
      opacity: { duration: 0.4 },
    }
  },
  initial: {
    scaleX: 1,
    scaleY: 1,
    opacity: 1,
    display: 'block'
  }
}

export const iconVariants = {
  closed: {
    rotate: 0,
    transition: {
      type: "tween",
      duration: 0.2,
      delay: 0.7
    }
  },
  open: {
    rotate: 180,
    transition: {
      type: "tween",
      duration: 0.2
    }
  }
};

export const sideVariants = {
  closed: {
    transition: {
      staggerChildren: 0.1,
      staggerDirection: 1
    }
  },
  open: {
    y: "2.5rem",
    transition: {
      staggerChildren: 0.1,
      staggerDirection: 1
    }
  }
};

export const itemVariants = {
  closed: {
    opacity: 0
  },
  open: { opacity: 1 }
};