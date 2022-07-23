import { Box, useColorModeValue } from "@chakra-ui/react";
import { useChackraColor, useChackraGlobal } from "../get-color";

export function LinkClientHandlerDefault() {
  const globalStyle = useChackraGlobal();
  const textColor = useChackraColor(globalStyle.body.color);
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const colorBorderSelected = useChackraColor('primary');
  const colorGrayToWhite = useColorModeValue(white, gray900);
  const colorFocus = useColorModeValue(white, gray900);
  const colorWhiteToGray = useColorModeValue(gray900, white);

  return <Box
    maxW='sm'
    borderWidth='1px'
    borderRadius='lg'
    overflow='hidden'
    backgroundColor="white"
    bg={colorGrayToWhite}
    borderColor={colorWhiteToGray}
    color={colorWhiteToGray}
  >
    <div style={{ width: 150, height: 150 }}></div>
  </Box>;
}