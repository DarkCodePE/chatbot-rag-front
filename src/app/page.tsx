// pages/index.tsx
'use client';
import React, { useState, useEffect } from 'react';
import {
  ChakraProvider,
  Box,
  VStack,
  HStack,
  Input,
  Button,
  Text,
  Select,
  Flex,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalFooter,
  ModalBody,
  ModalCloseButton,
  useDisclosure,
} from '@chakra-ui/react';
import axios from 'axios';

interface User {
  id: string;
  name: string;
  session_id: string;
  courses: string[];
  course_collections: string[];
}

interface Course {
  id: string;
  name: string;
}

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useState<Course[]>([]);
  const [loginName, setLoginName] = useState('');
  const [newCourseName, setNewCourseName] = useState('');
  const [selectedCourse, setSelectedCourse] = useState<string>('');
  const [question, setQuestion] = useState('');
  const [chatHistory, setChatHistory] = useState<{type: string, content: string}[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [chatSessionId, setChatSessionId] = useState<string | null>(null);
  const toast = useToast();
  const { isOpen, onOpen, onClose } = useDisclosure();

  const API_URL = process.env.API_URL || 'http://localhost:8000';

  useEffect(() => {
    if (user) {
      fetchUserCourses();
    }
  }, [user]);

  const handleLogin = async () => {
    try {
      const response = await axios.post(`${API_URL}/users/login`, { name: loginName });
      setUser(response.data);
      toast({
        title: 'Login Successful',
        description: `Welcome, ${response.data.name}!`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: 'Login Failed',
        description: 'There was an error logging in. Please try again.',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const fetchUserCourses = async () => {
    if (!user) return;
    try {
      const response = await axios.get(`${API_URL}/users/${user.id}/courses`);
      setCourses(response.data);
    } catch (error) {
      console.error('Error fetching courses:', error);
      toast({
        title: 'Error',
        description: 'Failed to fetch courses',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleCreateCourse = async () => {
    try {
      const response = await axios.post(`${API_URL}/courses`, { name: newCourseName });
      setCourses([...courses, response.data]);
      setNewCourseName('');
      onClose();
      toast({
        title: 'Course Created',
        description: `Course "${response.data.name}" has been created successfully.`,
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error creating course:', error);
      toast({
        title: 'Error',
        description: 'Failed to create course',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const startChatSession = async () => {
    if (!user || !selectedCourse) return;
    try {
      const response = await axios.post(`${API_URL}/chat/start`, {
        user_id: user.id,
        course_id: selectedCourse
      });
      setChatSessionId(response.data.chat_session_id);
      toast({
        title: 'Chat Session Started',
        description: 'You can now start asking questions.',
        status: 'success',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error starting chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to start chat session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  const handleSubmitQuestion = async () => {
    if (!question.trim() || !chatSessionId) return;

    setIsLoading(true);
    setChatHistory(prev => [...prev, { type: 'user', content: question }]);

    try {
      const response = await axios.post(`${API_URL}/chat/question`, {
        chat_session_id: chatSessionId,
        text: question
      });

      setChatHistory(prev => [...prev, { type: 'bot', content: response.data.response }]);
    } catch (error) {
      console.error('Error:', error);
      setChatHistory(prev => [...prev, { type: 'error', content: 'An error occurred. Please try again.' }]);
    }

    setIsLoading(false);
    setQuestion('');
  };

  const endChatSession = async () => {
    if (!chatSessionId) return;
    try {
      await axios.post(`${API_URL}/chat/end`, { chat_session_id: chatSessionId });
      setChatSessionId(null);
      setChatHistory([]);
      toast({
        title: 'Chat Session Ended',
        description: 'Your chat session has been ended.',
        status: 'info',
        duration: 3000,
        isClosable: true,
      });
    } catch (error) {
      console.error('Error ending chat session:', error);
      toast({
        title: 'Error',
        description: 'Failed to end chat session',
        status: 'error',
        duration: 3000,
        isClosable: true,
      });
    }
  };

  return (
      <ChakraProvider>
        <Box maxWidth="800px" margin="auto" p={5}>
          {!user ? (
              <VStack spacing={4}>
                <Input
                    placeholder="Enter your name"
                    value={loginName}
                    onChange={(e) => setLoginName(e.target.value)}
                />
                <Button onClick={handleLogin}>Login</Button>
              </VStack>
          ) : (
              <VStack spacing={4} align="stretch">
                <Text>Welcome, {user.name}!</Text>
                <HStack>
                  <Select
                      placeholder="Select a course"
                      value={selectedCourse}
                      onChange={(e) => setSelectedCourse(e.target.value)}
                  >
                    {courses.map((course) => (
                        <option key={course.id} value={course.id}>
                          {course.name}
                        </option>
                    ))}
                  </Select>
                  <Button onClick={onOpen}>Create New Course</Button>
                  {!chatSessionId ? (
                      <Button onClick={startChatSession} isDisabled={!selectedCourse}>Start Chat</Button>
                  ) : (
                      <Button onClick={endChatSession}>End Chat</Button>
                  )}
                </HStack>
                {chatSessionId && (
                    <>
                      <Flex>
                        <Input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Type your question here..."
                            mr={2}
                        />
                        <Button onClick={handleSubmitQuestion} isLoading={isLoading}>Send</Button>
                      </Flex>
                      <Box bg="gray.100" p={4} borderRadius="md" height="400px" overflowY="auto">
                        {chatHistory.map((message, index) => (
                            <Box
                                key={index}
                                bg={message.type === 'user' ? 'blue.100' : message.type === 'bot' ? 'green.100' : 'red.100'}
                                p={2}
                                borderRadius="md"
                                mb={2}
                            >
                              <Text>{message.content}</Text>
                            </Box>
                        ))}
                      </Box>
                    </>
                )}
              </VStack>
          )}
        </Box>
        <Modal isOpen={isOpen} onClose={onClose}>
          <ModalOverlay />
          <ModalContent>
            <ModalHeader>Create New Course</ModalHeader>
            <ModalCloseButton />
            <ModalBody>
              <Input
                  placeholder="Enter course name"
                  value={newCourseName}
                  onChange={(e) => setNewCourseName(e.target.value)}
              />
            </ModalBody>
            <ModalFooter>
              <Button colorScheme="blue" mr={3} onClick={handleCreateCourse}>
                Create
              </Button>
              <Button variant="ghost" onClick={onClose}>Cancel</Button>
            </ModalFooter>
          </ModalContent>
        </Modal>
      </ChakraProvider>
  );
}
