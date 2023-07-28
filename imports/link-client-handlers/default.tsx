import { Box, useColorModeValue } from "@chakra-ui/react";
import { useChackraColor, useChackraGlobal } from "../get-color";

export function LinkClientHandlerDefault({
  id,
  ml,
}: {
  id: number;
  ml: any;
}) {
  const globalStyle = useChackraGlobal();
  const textColor = useChackraColor(globalStyle.body.color);
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const colorBorderSelected = useChackraColor('primary');
  const colorGrayToWhite = useColorModeValue(white, gray900);
  const colorFocus = useColorModeValue(white, gray900);
  const colorWhiteToGray = useColorModeValue(gray900, white);

  const { type_id, from_id, to_id, value } = ml.byId[id];

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
    <div style={{ width: 150, height: 150 }}>
      {JSON.stringify({
        id,
        type_id,
        from_id,
        to_id,
        value,
      })}
    </div>
  </Box>;
}