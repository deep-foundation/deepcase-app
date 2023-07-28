import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Box, Button, Input, InputGroup, InputLeftElement, InputRightElement, Text, VStack } from '@chakra-ui/react';


const MotionBox = motion(Box);

const Message = ({ text }) => {
  const messageVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  };

  return (
    <MotionBox
      initial="hidden"
      animate="visible"
      exit="hidden"
      variants={messageVariants}
      transition={{ duration: 0.3 }}
      bg="blue.500"
      color="white"
      borderRadius="md"
      p={2}
      my={1}
      maxWidth="60%"
    >
      <Text>{text}</Text>
    </MotionBox>
  );
};

export const MessagingInterface = () => {
  const [messages, setMessages] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const messagesEndRef = useRef(null);

  const sendMessage = () => {
    if (inputValue.trim() !== '') {
      setMessages((prevMessages) => [...prevMessages, inputValue]);
      setInputValue('');
    }
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      sendMessage();
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <Box h="40vh" display="flex" flexDirection="column">
      <VStack
        flex="1"
        p={4}
        overflowY="auto"
        alignItems="flex-start"
        spacing={4}
        css={{
          '&::-webkit-scrollbar': {
            width: '4px',
          },
          '&::-webkit-scrollbar-track': {
            background: '#f0f0f0',
          },
          '&::-webkit-scrollbar-thumb': {
            background: '#888',
            borderRadius: '2px',
          },
        }}
      >
        <AnimatePresence>
          {messages.map((message, index) => (
            <Message key={index} text={message} />
          ))}
        </AnimatePresence>
        <div ref={messagesEndRef}></div>
      </VStack>
      <Box p={4}>
        <InputGroup>
          <InputLeftElement pointerEvents="none"
            children={<Box bg="blue.500" borderRadius="full" w="2" h="2" />} />
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message"
            bg="blue.100"
            borderRadius="full"
            pl={8}
          />
          <InputRightElement width="4.5rem" >
            <Button h="1.75rem" size="sm" colorScheme="blue" onClick={sendMessage}>
              Send
            </Button>
          </InputRightElement>
        </InputGroup>
      </Box>
    </Box>
  );
};