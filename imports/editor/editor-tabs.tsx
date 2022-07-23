import React from 'react';
import { Flex, Button, useColorModeValue, Box, useColorMode } from '../framework';
import { useChackraColor } from '../get-color';


interface ITab {
  id: number;
  title: string;
  saved?: boolean;
  onClick?: (id: number) => void;
  onClose?: (id: number) => void;
};

export const EditorTabs = React.memo<any>(({ tabs=[] }: { tabs?: ITab[] }) => {
return (<Flex
      position="sticky"
      top="0"
      bgColor="primary.100"
      zIndex="sticky"
      height="60px"
      alignItems="center"
      flexWrap="nowrap"
      overflowX="auto"
      as="nav"
      px="2"
      css={{
        WebkitOverflowScrolling: "touch",
        msOverflowStyle: "-ms-autohiding-scrollbar"
      }}
    >
      <Flex flex="0 0 auto">
        {tabs.map(t =>
          <EditorTab key={t.id} id={t.id} title={t.title} saved={t.saved} onClick={() => console.log(t.id)} onClose={() => console.log(t.id)} />
        )}
      </Flex>
    </Flex>
  )
})

export const NonSavedIcon = React.memo(({
  bg='red.600',
  borderColor='red.400',
}:{
  bg?: string;
  borderColor?: string;
}) => {
  console.log({bg});
  return (<Box w='0.5rem' h='0.5rem' bg={bg} borderStyle='solid' borderWidth={1} borderColor={borderColor} borderRadius='full' />)
})


export const EditorTab = React.memo(({
  id,
  title,
  saved,
  onClick,
  onClose,
}:ITab) => {
  
  const gray900 = useChackraColor('gray.900');
  const white = useChackraColor('white');
  const { colorMode, toggleColorMode } = useColorMode();

  return (<Button
      aria-label={`tab-${id}`}
      // variant="solid"
      bg={colorMode == 'light' ? white : gray900}
      onClick={() => onClick(id)}
      rightIcon={<NonSavedIcon />}
    >{title}</Button>
  )
})