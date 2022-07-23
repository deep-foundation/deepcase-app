import React from 'react';
import { Box, Button, Flex, useColorMode, CloseButton as _CloseButton, ButtonGroup, IconButton, Spinner, Center } from '../framework';
import { useChackraColor } from '../get-color';
import { VscChromeClose } from 'react-icons/vsc';

interface ITab {
  id: number;
  title: string;
  saved?: boolean;
  loading?: boolean;
  active?: boolean;
  onClick?: (id: number) => void;
  onClose?: (id: number) => void;
};

export const EditorTabs = React.memo<any>(({ tabs=[] }: { tabs?: ITab[] }) => {
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const { colorMode } = useColorMode();

return (<Flex
      position="sticky"
      top="0"
      bg={colorMode == 'light' ? white : gray900}
      zIndex="sticky"
      height="max-content"
      alignItems="center"
      flexWrap="nowrap"
      overflowX="auto"
      as="nav"
      css={{
        WebkitOverflowScrolling: "touch",
        msOverflowStyle: "-ms-autohiding-scrollbar"
      }}
    >
      <Flex flex="0 0 auto">
        {tabs.map(t =>
          <EditorTab key={t.id} id={t.id} title={t.title} active={t.active} saved={t.saved} loading={t.loading} onClick={() => console.log(t.id)} onClose={() => console.log(t.id)} />
        )}
      </Flex>
    </Flex>
  )
})

export const NonSavedIcon = React.memo(({
  bg='primary',
  borderColor='red.200',
}:{
  bg?: string;
  borderColor?: string;
}) => {
  console.log({bg});
  return (<Box w='0.5rem' h='0.5rem' bg={bg} borderStyle='solid' borderWidth={1} borderColor={borderColor} borderRadius='full' />)
})

export const CloseButton = React.memo(() => {
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const { colorMode } = useColorMode();

  return <_CloseButton size='md' bg={colorMode == 'light' ? white : gray900} borderRadius='none' height='100%' borderLeftStyle='solid' borderLeftWidth={1} borderLeftColor={colorMode == 'light' ? gray900 : white} />
})

export const EditorTab = React.memo(({
  id,
  title,
  saved = false,
  loading = false,
  active = false,
  onClick,
  onClose,
}:ITab) => {
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const { colorMode } = useColorMode();

  return (<Box
    as='button'
    aria-label={`tab-${id}`}
    display='flex'
    alignItems='center'
    w='max'
    h='max'
    lineHeight='1.4'
    transition='all 0.2s cubic-bezier(.08,.52,.52,1)'
    border='none'
    px='3'
    py='2'
    borderRadius='none'
    fontSize='xs'
    fontWeight='normal'
    bg={active ? (colorMode == 'light' ? white : gray900) : (colorMode == 'light' ? 'gray.200' : 'whiteAlpha.300')}
    _notLast={{ 
      borderRightStyle: 'solid', 
      borderRightWidth: 1,
      borderRightColor: colorMode == 'light' ? 'gray.300' : 'whiteAlpha.300' 
    }}
    _hover={{ bg: colorMode == 'light' ? white : gray900 }}
    _active={{
      transform: 'scale(0.98)',
    }}
    _focus={{
      bg: colorMode == 'light' ? 'gray.200' : 'whiteAlpha.300'
    }}
    onClick={() => onClick(id)}
  >
    <Box flex='1' mr='2'>
      {title}
    </Box>
    <Box mr='3'>
      {!saved && <NonSavedIcon /> || loading && <Spinner size='xs' />}
    </Box>
    <Box 
      onClick={() => onClose(id)} 
      as='button' 
      aria-label='close tab button'
      borderRadius='md'
      p={1}
      _hover={{
        bg: colorMode == 'light' ? 'blackAlpha.100' : 'gray.700',
      }}
    >
      <VscChromeClose />
    </Box>
  </Box>)
})