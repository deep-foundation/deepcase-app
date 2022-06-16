import { extendTheme, ThemeConfig } from '../framework';

import { mode } from '@chakra-ui/theme-tools';

const config: ThemeConfig = {
  initialColorMode: 'light',
  useSystemColorMode: false,
  cssVarPrefix: 'deepCase',
}

const themeChakra = extendTheme({ 
  config,
  styles: {
    global: props => (console.log('props111', props), {
      'body': {
        color: mode('gray.800', 'whiteAlpha.900')(props),
        bg: mode('gray.100', '#141214')(props),
      },
    }),
  },
  colors: {
    gray: {
      900: '#111720',
    },
  }
})

export default themeChakra