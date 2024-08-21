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
}

interface Course {
    id: string;
    name: string;
}

interface Topic {
    id: string;
    name: string;
}

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [courses, setCourses] = useState<Course[]>([]);
    const [topics, setTopics] = useState<Topic[]>([]);
    const [loginName, setLoginName] = useState('');
    const [newCourseName, setNewCourseName] = useState('');
    const [newTopicName, setNewTopicName] = useState('');
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [selectedTopic, setSelectedTopic] = useState<string>('');
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<{type: string, content: string}[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [chatSessionId, setChatSessionId] = useState<string | null>(null);
    const toast = useToast();
    const { isOpen: isCourseModalOpen, onOpen: onCourseModalOpen, onClose: onCourseModalClose } = useDisclosure();
    const { isOpen: isTopicModalOpen, onOpen: onTopicModalOpen, onClose: onTopicModalClose } = useDisclosure();

    const API_URL = process.env.API_URL || 'http://localhost:8000';

    useEffect(() => {
        fetchAllCourses();
    }, []);

    useEffect(() => {
        if (user) {
            fetchUserCourses();
        }
    }, [user]);

    useEffect(() => {
        if (selectedCourse) {
            fetchTopicsForCourse();
        }
    }, [selectedCourse]);

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

    const fetchAllCourses = async () => {
        try {
            const response = await axios.get(`${API_URL}/courses`);
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching all courses:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch courses',
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
            console.error('Error fetching user courses:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch user courses',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const fetchTopicsForCourse = async () => {
        try {
            const response = await axios.get(`${API_URL}/courses/${selectedCourse}/topics`);
            setTopics(response.data);
        } catch (error) {
            console.error('Error fetching topics for course:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch topics for the selected course',
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
            onCourseModalClose();
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

    const handleCreateTopic = async () => {
        try {
            const response = await axios.post(`${API_URL}/topics`, { name: newTopicName, course_id: selectedCourse });
            setTopics([...topics, response.data]);
            setNewTopicName('');
            onTopicModalClose();
            toast({
                title: 'Topic Created',
                description: `Topic "${response.data.name}" has been created successfully.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error creating topic:', error);
            toast({
                title: 'Error',
                description: 'Failed to create topic',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const assignCourseToUser = async () => {
        if (!user || !selectedCourse) return;
        try {
            await axios.post(`${API_URL}/users/assign-course`, {
                user_id: user.id,
                course_id: selectedCourse
            });
            toast({
                title: 'Course Assigned',
                description: 'The course has been assigned to you successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchUserCourses();
        } catch (error) {
            console.error('Error assigning course:', error);
            toast({
                title: 'Error',
                description: 'Failed to assign course',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const startChatSession = async () => {
        if (!user || !selectedCourse || !selectedTopic) return;
        try {
            const response = await axios.post(`${API_URL}/chat/start`, {
                user_id: user.id,
                course_id: selectedCourse,
                topic_id: selectedTopic
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
                            <Button onClick={onCourseModalOpen}>Create New Course</Button>
                            <Button onClick={assignCourseToUser}>Assign Course</Button>
                        </HStack>
                        {selectedCourse && (
                            <HStack>
                                <Select
                                    placeholder="Select a topic"
                                    value={selectedTopic}
                                    onChange={(e) => setSelectedTopic(e.target.value)}
                                >
                                    {topics.map((topic) => (
                                        <option key={topic.id} value={topic.id}>
                                            {topic.name}
                                        </option>
                                    ))}
                                </Select>
                                <Button onClick={onTopicModalOpen}>Create New Topic</Button>
                            </HStack>
                        )}
                        {!chatSessionId ? (
                            <Button onClick={startChatSession} isDisabled={!selectedCourse || !selectedTopic}>Start Chat</Button>
                        ) : (
                            <Button onClick={endChatSession}>End Chat</Button>
                        )}
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
            <Modal isOpen={isCourseModalOpen} onClose={onCourseModalClose}>
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
                        <Button variant="ghost" onClick={onCourseModalClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
            <Modal isOpen={isTopicModalOpen} onClose={onTopicModalClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create New Topic</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <Input
                            placeholder="Enter topic name"
                            value={newTopicName}
                            onChange={(e) => setNewTopicName(e.target.value)}
                        />
                    </ModalBody>
                    <ModalFooter>
                        <Button colorScheme="blue" mr={3} onClick={handleCreateTopic}>
                            Create
                        </Button>
                        <Button variant="ghost" onClick={onTopicModalClose}>Cancel</Button>
                    </ModalFooter>
                </ModalContent>
            </Modal>
        </ChakraProvider>

    );
}
