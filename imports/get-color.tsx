import { useTheme, useColorMode } from '@chakra-ui/react';

export function useChackraColor(color: string) {
  const theme = useTheme();
  return theme.__cssMap[`colors.${color}`]?.value;
}
export function useChackraGlobal() {
  const theme = useTheme();
  const { colorMode } = useColorMode();
  return theme.styles.global({ colorMode });
}