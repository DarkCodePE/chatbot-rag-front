import React, { useState, useEffect, useCallback } from 'react';
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
    initialTitle: string;
    finalTitle: string | null;
    timestamp: string;
    isTitleFinalized: boolean;
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
    const [topicId, setTopicId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatList, setChatList] = useState<ChatListItem[]>([]);
    const [currentTopicTitle, setCurrentTopicTitle] = useState<string>('');
    const [titleTaskId, setTitleTaskId] = useState<string | null>(null);
    const [isTitleFinalized, setIsTitleFinalized] = useState(false);
    const toast = useToast();

    const updateTitle = useCallback((chatId: string, newTitle: string, isFinalized: boolean) => {
        setCurrentTopicTitle(newTitle);
        if (isFinalized) {
            setIsTitleFinalized(true);
            setTitleTaskId(null);
            updateChatInList(chatId, newTitle, true);
        }
        console.log(`Title updated for chat ${chatId}: ${newTitle} (Finalized: ${isFinalized})`);
    }, []);

    const updateChatInList = useCallback((chatId: string, newTitle: string, isFinalized: boolean) => {
        setChatList(prevList =>
            prevList.map(chat =>
                chat.id === chatId
                    ? {
                        ...chat,
                        finalTitle: isFinalized ? newTitle : chat.finalTitle,
                        initialTitle: !isFinalized ? newTitle : chat.initialTitle,
                        isTitleFinalized: isFinalized
                    }
                    : chat
            )
        );
    }, []);

    const fetchChatList = useCallback(async () => {
        if (!selectedCourse) return;
        try {
            const response = await axios.get(`${API_URL}/chats/${user.id}/${selectedCourse}`);
            setChatList(response.data.chats.map((chat: any) => ({
                ...chat,
                initialTitle: chat.initial_title || chat.topic_title,
                finalTitle: chat.final_title,
                isTitleFinalized: !!chat.final_title
            })));
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
    }, [selectedCourse, user.id, toast]);

    useEffect(() => {
        if (selectedCourse) {
            fetchChatList();
            setChatSessionId(null);
            setChatHistory([]);
            setCurrentTopicTitle('');
        }
    }, [selectedCourse, fetchChatList]);

    useEffect(() => {
        let eventSource: EventSource | null = null;

        if (chatSessionId && !isTitleFinalized) {
            eventSource = new EventSource(`${API_URL}/sse/topic/${topicId}`);
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('SSE Message:', data);
                if (data.title && data.title !== currentTopicTitle) {
                    updateTitle(chatSessionId, data.title, false);
                    //fetchChatList();
                }
            };
            eventSource.onerror = (error) => {
                console.error('SSE Error:', error);
                eventSource?.close();
            };
        }

        return () => {
            if (eventSource) {
                console.log("Cerrando conexión SSE");
                eventSource.close();
            }
        };
    }, [chatSessionId, topicId, currentTopicTitle, isTitleFinalized, updateTitle]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (titleTaskId) {
            interval = setInterval(checkTitleTaskStatus, 5000);
        }
        return () => clearInterval(interval);
    }, [titleTaskId]);

    const checkTitleTaskStatus = async () => {
        if (!titleTaskId || !chatSessionId || isTitleFinalized) return;
        try {
            const response = await axios.get(`${API_URL}/task/${titleTaskId}`);
            console.log('Title Task Status:', response.data);

            if (response.data.state === 'SUCCESS') {
                if (response.data.result && response.data.result.new_title) {
                    updateTitle(chatSessionId, response.data.result.new_title, true);
                    toast({
                        title: 'Topic Title Finalized',
                        description: `The topic title has been finalized: ${response.data.result.new_title}`,
                        status: 'success',
                        duration: 3000,
                        isClosable: true,
                    });
                }
            } else if (response.data.state === 'FAILURE') {
                setTitleTaskId(null);
                toast({
                    title: 'Title Generation Failed',
                    description: response.data.error || 'Failed to generate the topic title.',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        } catch (error) {
            console.error('Error checking title task status:', error);
            setTitleTaskId(null);
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
            updateTitle(sessionResponse.data.chat_session_id, sessionResponse.data.topic_title, false);
            setTitleTaskId(sessionResponse.data.title_task_id);
            setTopicId(sessionResponse.data.topic_id);
            setIsTitleFinalized(false);

            const questionResponse = await axios.post(`${API_URL}/chat/question`, {
                chat_session_id: sessionResponse.data.chat_session_id,
                text: question
            });

            setChatHistory([
                { type: 'user', content: question },
                { type: 'bot', content: questionResponse.data.response }
            ]);

            await fetchChatList();

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
            await fetchChatList();
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
            const selectedChat = chatList.find(chat => chat.id === chatId);
            if (selectedChat) {
                setCurrentTopicTitle(selectedChat.finalTitle || selectedChat.initialTitle);
                setIsTitleFinalized(!!selectedChat.finalTitle);
            }
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
                            <Text fontWeight="bold">
                                {chat.isTitleFinalized ? chat.finalTitle : chat.initialTitle}
                            </Text>
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
                {currentTopicTitle && (
                    <Text fontSize="xl" fontWeight="semibold">
                        Topic: {currentTopicTitle} {!isTitleFinalized && " (Generating final title...)"}
                    </Text>
                )}
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