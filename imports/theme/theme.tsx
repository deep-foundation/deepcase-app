import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  cssVarPrefix: 'deepCase',
}

const themeChakra = extendTheme({ 
  config,
  styles: {
    global: (props: StyleFunctionProps) => ({
      'body': {
        color: mode('gray.900', 'whiteAlpha.900')(props),
        bg: mode('gray.100', '#141214')(props),
      },
    }),
  },
  colors: {
    primary: '#0080ff',
    gray: {
      900: '#111720',
    },
    cyan: {
      400: '#0080ff',
    },
  },
  space: {
    4.5: '1.125rem',
  },
  components: {
    Tabs: {
      variants: {
        'enclosed': {
          borderBottomColor: 'none', 
          borderColor: 'none',
        },
        
        sm: {
          fontSize: '0.4rem',
          px: 1, // <-- px is short for paddingLeft and paddingRight
          py: 1, // <-- py is short for paddingTop and paddingBottom
        },
      },
    },
    
    Button: {
      variants: {
        unstyled: {
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem 0',
        },
        // filled: {
        //   background: 'white',
        //   _hover: {
        //     background: "green.200",
        //   }}
          // field: (props) => ({
          //   bg: mode('gray.100', '#141214')(props),
          //   _hover: {
          //     bg: mode("green.200", "red.600")(props),
          //   }}
          // )
  
        // ЗАКОММЕНТИРОВАЛ
        // применялось ко всем кнопкам, все стало красным
        // outline: {
        //   borderColor: 'red.500'
        // }
      },

    },
  }
})

export default themeChakra