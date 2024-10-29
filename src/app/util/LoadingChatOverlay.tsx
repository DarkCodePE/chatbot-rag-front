import React from 'react';
import { Box, VStack, Spinner, Text } from '@chakra-ui/react';

const LoadingChatOverlay = () => {
    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.7)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="modal"
        >
            <VStack spacing={4} bg="gray.800" p={8} borderRadius="lg" boxShadow="xl">
                <Spinner
                    thickness="4px"
                    speed="0.65s"
                    emptyColor="gray.600"
                    color="blue.500"
                    size="xl"
                />
                <Text color="white" fontSize="lg" fontWeight="medium">
                    Creando su sesión de chat...
                </Text>
                <Text color="gray.300" fontSize="sm">
                    Puede tardar unos instantes
                </Text>
            </VStack>
        </Box>
    );
};

export default LoadingChatOverlay;