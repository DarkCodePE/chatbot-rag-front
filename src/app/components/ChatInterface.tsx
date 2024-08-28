import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Input,
    Button,
    Select,
    useToast, List, ListItem, Divider,
} from '@chakra-ui/react';
import axios from 'axios';
import { useCourses } from "@/app/hook/CoursesProvider";

interface User {
    id: string;
    name: string;
}
interface ChatListItem {
    id: string;
    topic_title: string;
    timestamp: string;
}

interface ChatInterfaceProps {
    user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';

export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user }) => {
    const { userCourses } = useCourses();
    const [selectedCourse, setSelectedCourse] = useState<string>('');
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<{type: string, content: string}[]>([]);
    const [chatSessionId, setChatSessionId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatList, setChatList] = useState<ChatListItem[]>([]);
    const toast = useToast();

    useEffect(() => {
        if (selectedCourse) {
            fetchChatList();
            // Reset chat session when course changes
            setChatSessionId(null);
            setChatHistory([]);
        }
    }, [selectedCourse]);

    const fetchChatList = async () => {
        try {
            const response = await axios.get(`${API_URL}/chats/${user.id}/${selectedCourse}`);
            setChatList(response.data.chats);
        } catch (error) {
            console.error('Error fetching chat list:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch chat list',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const startChatSessionAndAskQuestion = async () => {
        if (!selectedCourse || !question.trim()) return;
        setIsLoading(true);

        try {
            const sessionResponse = await axios.post(`${API_URL}/chat/start`, {
                user_id: user.id,
                course_id: selectedCourse,
                initial_question: question
            });

            setChatSessionId(sessionResponse.data.chat_session_id);

            const questionResponse = await axios.post(`${API_URL}/chat/question`, {
                chat_session_id: sessionResponse.data.chat_session_id,
                text: question
            });

            setChatHistory([
                { type: 'user', content: question },
                { type: 'bot', content: questionResponse.data.response }
            ]);

            await fetchChatList(); // Refresh the chat list

            toast({
                title: 'Chat Session Started',
                description: 'Your question has been submitted and a new topic created.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error starting chat session or asking question:', error);
            toast({
                title: 'Error',
                description: 'Failed to start chat session or ask question',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }

        setIsLoading(false);
        setQuestion('');
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
            await fetchChatList(); // Refresh the chat list
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

    const selectChat = async (chatId: string) => {
        setChatSessionId(chatId);
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/chat/${chatId}/history`);
            setChatHistory(response.data);
        } catch (error) {
            console.error('Error loading chat history:', error);
            toast({
                title: 'Error',
                description: 'Failed to load chat history',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            setChatHistory([]);
        }
        setIsLoading(false);
    };

    const handleCourseChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setSelectedCourse(e.target.value);
        setChatSessionId(null);
        setChatHistory([]);
    };

    return (
        <HStack spacing={4} align="stretch" height="100vh">
            <VStack flex={1} spacing={4} align="stretch" p={4} bg="gray.50" overflowY="auto">
                <Text fontSize="2xl" fontWeight="bold">Chat List</Text>
                <Select
                    placeholder="Select a course"
                    value={selectedCourse}
                    onChange={handleCourseChange}
                >
                    {userCourses.map((course) => (
                        <option key={course.id} value={course.id}>
                            {course.name}
                        </option>
                    ))}
                </Select>
                <List spacing={3}>
                    {chatList.map((chat) => (
                        <ListItem
                            key={chat.id}
                            p={3}
                            bg="white"
                            borderRadius="md"
                            boxShadow="sm"
                            cursor="pointer"
                            _hover={{ bg: "gray.100" }}
                            onClick={() => selectChat(chat.id)}
                        >
                            <Text fontWeight="bold">{chat.topic_title}</Text>
                            <Text fontSize="sm" color="gray.500">
                                Last message: {new Date(chat.timestamp).toLocaleString()}
                            </Text>
                        </ListItem>
                    ))}
                </List>
            </VStack>
            <Divider orientation="vertical" />
            <VStack flex={2} spacing={4} align="stretch" p={4}>
                <Text fontSize="2xl" fontWeight="bold">Chat Interface</Text>
                {!chatSessionId ? (
                    <VStack spacing={4}>
                        <Input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Type your initial question here..."
                        />
                        <Button
                            onClick={startChatSessionAndAskQuestion}
                            isLoading={isLoading}
                            isDisabled={!selectedCourse || !question.trim()}
                            colorScheme="blue"
                        >
                            Start New Chat
                        </Button>
                    </VStack>
                ) : (
                    <>
                        <Box flex={1} bg="white" p={4} borderRadius="md" overflowY="auto" mb={4}>
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
                        <HStack>
                            <Input
                                value={question}
                                onChange={(e) => setQuestion(e.target.value)}
                                placeholder="Type your question here..."
                            />
                            <Button onClick={handleSubmitQuestion} isLoading={isLoading} colorScheme="blue">Send</Button>
                        </HStack>
                        <Button onClick={endChatSession} colorScheme="red">End Chat</Button>
                    </>
                )}
            </VStack>
        </HStack>
    );
};