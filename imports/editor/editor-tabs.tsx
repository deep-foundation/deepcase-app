import React from 'react';
import { Flex, Button } from '../framework';


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
          <Button
            as="a"
            href={`#${t.id}`}
            id={`bar-${t.id}`}
            variant="ghost"
            color="black"
            colorScheme="none"
          >{t.title}</Button>
        )}
      </Flex>
    </Flex>
  )
})


export const EditorTab = React.memo(({
  id,
  title,
  saved,
  onClick,
  onClose,
}:ITab) => {
  return (<Button
      key={id}
      as="a"
      id={`tab-${id}`}
      variant="ghost"
      color="black"
      colorScheme="none"
      onClick={() => onClick(id)}
    >{title}</Button>
  )
})