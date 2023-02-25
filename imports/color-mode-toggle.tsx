import {
  useColorMode,
  useColorModeValue,
  IconButton,
  IconButtonProps,
} from "@chakra-ui/react";
import { SunIcon, MoonIcon } from '@chakra-ui/icons'

type ColorModeSwitcherProps = Omit<IconButtonProps, "aria-label">

export const ColorModeSwitcher = () => {
  const text = useColorModeValue("dark", "light");
  const SwitchIcon = useColorModeValue(MoonIcon, SunIcon);
  const { colorMode, toggleColorMode } = useColorMode();

  return (
    <IconButton
      sx={{
        position: 'absolute', right: 0, top: 0
      }}
      size="md"
      fontSize="lg"
      variant="ghost"
      color="current"
      marginLeft="2"
      onClick={toggleColorMode}
      icon={<SwitchIcon />}
      aria-label={`Switch to ${text} mode`}
    />
  )
}