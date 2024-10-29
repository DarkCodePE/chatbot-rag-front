'use client';

import React, { useState, useEffect, useCallback } from 'react';
import {
    VStack,
    HStack,
    Box,
    Text,
    Input,
    Button,
    Select,
    useToast, List, ListItem, Divider, Flex, Heading, IconButton,
} from '@chakra-ui/react';
import axios from 'axios';
import { useCourses } from "@/app/hook/CoursesProvider";
import {ArrowLeftIcon, ArrowRightIcon, ChevronLeftIcon} from '@chakra-ui/icons';
import styles from './ChatInterface.module.css';
import ActiveChat from "@/app/components/ActiveChatProps";
import LoadingChatOverlay from "@/app/util/LoadingChatOverlay";
import AnimatedLoadingOverlay from "@/app/util/AnimatedLoadingOverlayProps";
import ProcessingChatOverlay from "@/app/util/ProcessingStepProps";
import ErrorDisplay, {useChatState, useErrorHandler} from "@/app/util/ErrorDisplay";

interface User {
    id: string;
    name: string;
}
interface Document {
    id: string;
    file_name: string;
    last_modified: string;
}

interface ChatListItem {
    id: string;
    initialTitle: string;
    finalTitle: string | null;
    timestamp: string;
    isTitleFinalized: boolean;
}

interface Course {
    id: string;
    name: string;
}

interface ChatInterfaceProps {
    user: User;
    selectedCourse: string; // Add this line
}

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';


export const ChatInterface: React.FC<ChatInterfaceProps> = ({ user, selectedCourse }) => {
    const { userCourses } = useCourses();
    const [question, setQuestion] = useState('');
    const [chatHistory, setChatHistory] = useState<{type: string, content: string}[]>([]);
    const [chatSessionId, setChatSessionId] = useState<string | null>(null);
    const [topicId, setTopicId] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [chatList, setChatList] = useState<ChatListItem[]>([]);
    const [currentTopicTitle, setCurrentTopicTitle] = useState<string>('');
    const [titleTaskId, setTitleTaskId] = useState<string | null>(null);
    const [isTitleFinalized, setIsTitleFinalized] = useState(false);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [showChatList, setShowChatList] = useState(true);

    // Usar los hooks personalizados de manejo de errores y estado del chat
    const { error, handleError, clearError, showToast } = useErrorHandler();
    const { isProcessing, processingProgress, handleStartNewChat } = useChatState(handleError);

    const chatHistoryRef = React.useRef<HTMLDivElement>(null);
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


    const fetchDocuments = useCallback(async () => {
        if (!selectedCourse) return;
        try {
            const response = await axios.get(`${API_URL}/courses/${selectedCourse}/files`);
            setDocuments(response.data);
        } catch (error) {
            console.error('Error fetching documents:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch course documents',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    }, [selectedCourse, toast]);



    const handleStartChat = async () => {
        if (!selectedCourse || !question.trim()) return;

        await handleStartNewChat(
            question,
            user.id,
            selectedCourse,
            {
                onSuccess: (data) => {
                    // Manejar la respuesta exitosa
                    setChatSessionId(data.chat_session_id);
                    setTopicId(data.topic_id);
                    setCurrentTopicTitle(data.topic_title);
                    setChatHistory([
                        { type: 'user', content: question },
                        { type: 'bot', content: data.initial_answer?.response || 'No response available.' }
                    ]);
                    setShowChatList(false);

                    if (data.title_task_id) {
                        setTitleTaskId(data.title_task_id);
                    }

                    // Limpiar el input
                    setQuestion('');
                },
                onError: () => {
                    // Manejar el error (opcional, ya que el hook ya maneja los errores)
                    console.log('Error starting chat - keeping question for retry');
                }
            }
        );
    };
    // Y actualiza la función handleRetry para mantener la misma lógica
    const handleRetry = async () => {
        try {
            clearError(); // Limpia el error actual
            setIsLoading(true);

            if (question.trim()) {
                await handleStartChat();
            }
        } catch (error) {
            handleError(error);
            // No limpiar la pregunta en caso de error
        } finally {
            setIsLoading(false);
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

    useEffect(() => {
        if (selectedCourse) {
            fetchChatList();
            fetchDocuments();
        }
    }, [selectedCourse, fetchChatList, fetchDocuments]);

    useEffect(() => {
        let eventSource: EventSource | null = null;

        if (chatSessionId && topicId && !isTitleFinalized) { // Asegúrate de que topicId está disponible
            eventSource = new EventSource(`${API_URL}/sse/topic/${topicId}`);
            eventSource.onmessage = (event) => {
                const data = JSON.parse(event.data);
                console.log('SSE Message:', data);
                if (data.title && data.title !== currentTopicTitle) {
                    updateTitle(chatSessionId, data.title, false);
                    // Opcionalmente, puedes actualizar la lista de chats
                    // fetchChatList();
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

    useEffect(() => {
        if (chatHistoryRef.current) {
            chatHistoryRef.current.scrollTop = chatHistoryRef.current.scrollHeight;
        }
    }, [chatHistory]);

    const selectChat = async (chatId: string) => {
        setChatSessionId(chatId);
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/chat/${chatId}/history`);
            setChatHistory(response.data); // Ajusta esto según la estructura de tu backend
            setTopicId(response.data.topic_id); // Establecer topicId desde la respuesta
            const selectedChat = chatList.find(chat => chat.id === chatId);
            if (selectedChat) {
                setCurrentTopicTitle(selectedChat.finalTitle || selectedChat.initialTitle);
            }
            setShowChatList(false);
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

    const selectedCourseName = userCourses.find(course => course.id === selectedCourse)?.name || 'Selected Course';
0
    return (
        <div className={styles.chatInterface}>
            {/* Mostrar el error si existe */}
            {error && (
                <ErrorDisplay
                    error={error}
                    onRetry={handleRetry}
                    onClose={clearError}
                />
            )}
            <ProcessingChatOverlay
                isVisible={isProcessing}
                onComplete={() => {
                    // No necesitas setIsProcessing(false) aquí ya que useChatState lo maneja
                    console.log('Processing completed');
                }}
                progress={processingProgress}  // Ahora será válido
            />
            {chatSessionId ? (
                <ActiveChat
                    chatSessionId={chatSessionId}
                    currentTopicTitle={currentTopicTitle}
                    chatHistory={chatHistory}
                    question={question}
                    isLoading={isLoading}
                    onBackClick={() => setChatSessionId(null)}
                    onQuestionChange={(e) => setQuestion(e.target.value)}
                    onSubmitQuestion={handleSubmitQuestion}
                />
            ) : (
                <div>
                    <HStack p={4} className={styles.header}>
                        <Heading size="md" className={styles.courseTitle}>{selectedCourseName}</Heading>
                    </HStack>
                    <Flex flex={1} className={styles.content}>
                        <VStack flex={1} spacing={4} align="stretch" p={4} overflowY="auto" className={styles.chatList}>
                            <Box position="relative">
                                <Input
                                    value={question}
                                    onChange={(e) => setQuestion(e.target.value)}
                                    placeholder="How can Claude help you today?"
                                    onKeyPress={(e) => {
                                        if (e.key === 'Enter' && !e.shiftKey) {
                                            e.preventDefault();
                                            handleStartChat();
                                        }
                                    }}
                                    className={styles.inputField}
                                    isDisabled={isProcessing}  // Cambiar isStartingChat por isProcessing
                                    _disabled={{
                                        opacity: 0.7,
                                        cursor: 'not-allowed'
                                    }}
                                />
                                {question.trim() && !isProcessing && ( // Cambiar isStartingChat por isProcessing
                                    <Button
                                        position="absolute"
                                        right="2"
                                        top="50%"
                                        transform="translateY(-50%)"
                                        size="sm"
                                        colorScheme="blue"
                                        onClick={handleStartChat}
                                        isLoading={isProcessing}  // Cambiar isStartingChat por isProcessing
                                        loadingText="Starting..."
                                    >
                                        Start Chat
                                    </Button>
                                )}
                            </Box>
                            <Heading size="sm" className={styles.sectionTitle}>Your chats</Heading>
                            <List spacing={3} className={styles.chatItems}>
                                {chatList.map((chat) => (
                                    <ListItem
                                        key={chat.id}
                                        p={2}
                                        className={styles.userMessage}
                                        onClick={() => selectChat(chat.id)}
                                    >
                                        <Text fontWeight="bold" color="white" className={styles.chatTitle}>
                                            {chat.isTitleFinalized ? chat.finalTitle : chat.initialTitle}
                                        </Text>
                                        <Text fontSize="xs" color="white" className={styles.chatTimestamp}>
                                            Last message: {new Date(chat.timestamp).toLocaleString()}
                                        </Text>
                                    </ListItem>
                                ))}
                            </List>
                        </VStack>
                        <VStack width="300px" spacing={4} align="stretch" p={4} bg="gray.700" overflowY="auto">
                            <Heading size="sm" color="white">Course Documents</Heading>
                            <List spacing={3}>
                                {documents.map((doc) => (
                                    <ListItem
                                        key={doc.id}
                                        p={2}
                                        bg="gray.600"
                                        borderRadius="md"
                                    >
                                        <Text fontWeight="bold" fontSize="sm" color="white">{doc.file_name}</Text>
                                        <Text fontSize="xs" color="gray.300">
                                            Last modified: {new Date(doc.last_modified).toLocaleString()}
                                        </Text>
                                    </ListItem>
                                ))}
                            </List>
                        </VStack>
                    </Flex>
                </div>
            )}
        </div>
    );

};