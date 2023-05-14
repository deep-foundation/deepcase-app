import { extendTheme, type ThemeConfig } from '@chakra-ui/react';

import { mode, StyleFunctionProps } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  cssVarPrefix: 'deepCase',
}

const themeChakra = extendTheme({ 
  config,
  semanticTokens: {
    colors: {
      error: 'red.500',
      text: {
        default: 'grayText',
        _dark: 'whiteText',
      },
      borderColor: {
        default: '#d2cece',
        _dark: '#718096',
      },
      backgroundModal: {
        default: 'blue.50',
        _dark: 'blue.900',
      },
      buttonBackgroundModal: {
        default: 'gray.10',
        _dark: 'cyDark',
      },
      buttonInactive: {
        default: 'gray.10',
        _dark: 'blue.900',
      },
      switchOn: {
        default: 'primary',
        _dark: 'blue.200',
      },
      switchOff: {
        default: '#8a8989',
        _dark: 'blue.200',
      },
      switchThumb: {
        default: 'whiteText',
        _dark: 'cyDark',
      },
      editorPreviewBackground: {
        default: '#fcfcfc',
        _dark: 'blue.900',
      },
      editorPreviewBackgroundGrid: {
        default: '#e5eefc',
        _dark: '#404040',
      },
    },
  },
  styles: {
    global: (props: StyleFunctionProps) => ({
      'body': {
        color: mode('gray.900', 'whiteAlpha.900')(props),
        bg: mode('gray.100', 'cyDark')(props),
      },
    }),
  },
  colors: {
    primary: '#0080ff',
    cyDark: '#141214',
    blue: {
      900: '#19202B',
    },
    grayText: '#3a3a3a',
    whiteText: '#ebf8ff',
    gray: {
      10: '#eeeeee',
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