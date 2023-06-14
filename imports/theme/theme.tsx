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
    fontSizes: {
      xxs: '0.55rem',
    },
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
      colorModeButton: {
        default: 'blue.900',
        _dark: 'blue.50',
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
      switchModeBorder: {
        default: 'blue.500',
        _dark: 'blue.200',
      },
      editorPreviewBackground: {
        default: 'whiteBg',
        _dark: 'blue.900',
      },
      editorPreviewBackgroundGrid: {
        default: '#e5eefc',
        _dark: '#404040',
      },
      whiteGray: {
        default: 'whiteText',
        _dark: 'grayText',
      },
      colorOutline: {
        default: '#edf2f7',
        _dark: '#1a202c'
      },
      bgColor: {
        default: '#edf2f7',
        _dark: 'gray.900',
      },
      bgLanguagesButton: {
        default: 'gray.200',
        _dark: 'gray.700',
      },
      lightDark: {
        default: 'white',
        _dark: 'gray.700'
      },
      handlersInput: {
        default: 'white',
        _dark: 'gray.900'
      },
      borderInputMessage: {
        default: '#e6e6e6',
        _dark: '#29303b'
      },
      sendMessagePlane: {
        default: 'gray.700',
        _dark: 'whiteText',
      }
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
    whiteBg: '#fcfcfc',
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