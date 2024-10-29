import React, { useState } from 'react';
import {
    Alert,
    AlertIcon,
    AlertTitle,
    AlertDescription,
    Button,
    VStack,
    useToast, Box
} from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';

// Definir tipos de error específicos
interface ChatError {
    code: string;
    message: string;
    action?: () => void;
}
const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';
// Componente para mostrar errores
const ErrorDisplay = ({ error, onRetry, onClose }: {
    error: ChatError;
    onRetry?: () => void;
    onClose: () => void;
}) => {
    return (
        <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            zIndex="modal"
            width="90%"
            maxWidth="500px"
        >
            <Alert
                status="error"
                variant="solid"
                bg="red.600"
                color="white"
                flexDirection="column"
                alignItems="center"
                justifyContent="center"
                textAlign="center"
                borderRadius="xl"
                boxShadow="2xl"
                p={8}
            >
                <AlertIcon boxSize="40px" mr={0} color="white" />
                <AlertTitle mt={4} mb={1} fontSize="xl" fontWeight="bold">
                    {error.code}
                </AlertTitle>
                <AlertDescription maxWidth="sm" fontSize="md" mt={2}>
                    {error.message}
                </AlertDescription>
                <VStack mt={6} spacing={2} width="100%">
                    {onRetry && (
                        <Button
                            onClick={onRetry}
                            bg="white"
                            color="red.600"
                            width="200px"
                            _hover={{ bg: 'gray.100' }}
                        >
                            Retry
                        </Button>
                    )}
                    <Button
                        variant="ghost"
                        onClick={onClose}
                        color="white"
                        width="200px"
                        borderWidth={1}
                        borderColor="white"
                        _hover={{ bg: 'red.700' }}
                    >
                        Dismiss
                    </Button>
                </VStack>
            </Alert>
        </Box>
    );
};

// Hook personalizado para manejar errores
export const useErrorHandler = () => {
    const [error, setError] = useState<ChatError | null>(null);
    const toast = useToast();

    const handleError = (error: unknown) => {
        if (axios.isAxiosError(error)) {
            const axiosError = error as AxiosError;

            // Manejar diferentes tipos de errores
            switch (axiosError.response?.status) {
                case 404:
                    setError({
                        code: 'CHAT_NOT_FOUND',
                        message: 'The chat session could not be created. Please try again.'
                    });
                    break;

                case 401:
                    setError({
                        code: 'UNAUTHORIZED',
                        message: 'Your session has expired. Please log in again.',
                        action: () => {
                            // Redirigir al login
                            window.location.href = '/login';
                        }
                    });
                    break;

                case 429:
                    setError({
                        code: 'RATE_LIMIT_EXCEEDED',
                        message: 'You have made too many requests. Please wait a moment and try again.'
                    });
                    break;

                case 500:
                    setError({
                        code: 'SERVER_ERROR',
                        message: 'An unexpected error occurred. Our team has been notified.'
                    });
                    break;

                default:
                    if (!axiosError.response) {
                        setError({
                            code: 'NETWORK_ERROR',
                            message: 'Unable to connect to the server. Please check your internet connection.'
                        });
                    } else {
                        setError({
                            code: 'UNKNOWN_ERROR',
                            message: 'An unexpected error occurred. Please try again.'
                        });
                    }
            }
        } else {
            // Manejar errores no-Axios
            setError({
                code: 'UNKNOWN_ERROR',
                message: error instanceof Error ? error.message : 'An unexpected error occurred'
            });
        }
    };

    const clearError = () => setError(null);

    const showToast = (message: string, type: 'error' | 'warning' | 'success' = 'error') => {
        toast({
            title: type === 'error' ? 'Error' : type === 'warning' ? 'Warning' : 'Success',
            description: message,
            status: type,
            duration: 5000,
            isClosable: true,
        });
    };

    return {
        error,
        handleError,
        clearError,
        showToast
    };
};

// Hook para manejar el estado del chat
export const useChatState = (handleError: (error: unknown) => void) => {
    //const { handleError, clearError, showToast } = useErrorHandler();
    const [isProcessing, setIsProcessing] = useState(false);
    const [processingProgress, setProcessingProgress] = useState(0);

    const handleStartNewChat = async (
        question: string,
        userId: string,
        courseId: string,
        callbacks: {
            onSuccess: (response: any) => void;
            onError?: () => void;
        }
    ) => {
        if (!courseId || !question.trim() || isProcessing) return;

        setIsProcessing(true);
        const processingStart = Date.now();

        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 30000);

            const response = await axios.post(
                `${API_URL}/chat/start`,
                {
                    user_id: userId,
                    course_id: courseId,
                    initial_question: question
                },
                {
                    signal: controller.signal,
                    onDownloadProgress: (progressEvent) => {
                        if (progressEvent.loaded && progressEvent.total) {
                            const progress = (progressEvent.loaded / progressEvent.total) * 100;
                            setProcessingProgress(progress);
                        }
                    }
                }
            );

            clearTimeout(timeoutId);

            const processingTime = Date.now() - processingStart;
            const minProcessingTime = 2000;

            if (processingTime < minProcessingTime) {
                await new Promise(resolve =>
                    setTimeout(resolve, minProcessingTime - processingTime)
                );
            }

            callbacks.onSuccess(response.data);
            //clearError();

        } catch (error) {
            handleError(error);
            callbacks.onError?.();
        } finally {
            setIsProcessing(false);
            setProcessingProgress(0);
        }
    };

    return {
        isProcessing,
        processingProgress,
        handleStartNewChat,
    };
};

export default ErrorDisplay;