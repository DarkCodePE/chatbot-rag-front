import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Input,
    Button,
    Select,
    useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import { useCourses } from "@/app/hook/CoursesProvider";

interface User {
    id: string;
    name: string;
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
    const toast = useToast();

    const startChatSessionAndAskQuestion = async () => {
        if (!selectedCourse || !question.trim()) return;
        setIsLoading(true);

        try {
            // Start chat session and create topic
            const sessionResponse = await axios.post(`${API_URL}/chat/start`, {
                user_id: user.id,
                course_id: selectedCourse,
                initial_question: question
            });

            setChatSessionId(sessionResponse.data.chat_session_id);

            // Ask the initial question
            const questionResponse = await axios.post(`${API_URL}/chat/question`, {
                chat_session_id: sessionResponse.data.chat_session_id,
                text: question
            });

            setChatHistory([
                { type: 'user', content: question },
                { type: 'bot', content: questionResponse.data.response }
            ]);

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
            setSelectedCourse('');
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
        <VStack spacing={4} align="stretch">
            <Box>
                <Text>Welcome to the Chat Interface, {user.name}!</Text>
            </Box>
            {!chatSessionId ? (
                <>
                    <Select
                        placeholder="Select a course"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        {userCourses.map((course) => (
                            <option key={course.id} value={course.id}>
                                {course.name}
                            </option>
                        ))}
                    </Select>
                    <Input
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        placeholder="Type your initial question here..."
                    />
                    <Button
                        onClick={startChatSessionAndAskQuestion}
                        isLoading={isLoading}
                        isDisabled={!selectedCourse || !question.trim()}
                    >
                        Start Chat and Ask Question
                    </Button>
                </>
            ) : (
                <>
                    <HStack>
                        <Input
                            value={question}
                            onChange={(e) => setQuestion(e.target.value)}
                            placeholder="Type your question here..."
                        />
                        <Button onClick={handleSubmitQuestion} isLoading={isLoading}>Send</Button>
                    </HStack>
                    <Button onClick={endChatSession}>End Chat</Button>
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
    );
};