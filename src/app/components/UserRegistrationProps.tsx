import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    Input,
    VStack,
    Heading,
    Text,
    useToast,
} from '@chakra-ui/react';
import axios from 'axios';

interface UserRegistrationProps {
    onRegistrationSuccess: (user: any) => void;
}

export const UserRegistration: React.FC<UserRegistrationProps> = ({ onRegistrationSuccess }) => {
    const [name, setName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const response = await axios.post('/api/users/register', {
                name,
                group_id: groupId,
            });

            toast({
                title: 'Registration Successful',
                description: `Welcome, ${response.data.name}!`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onRegistrationSuccess(response.data);
        } catch (error) {
            console.error('Registration error:', error);
            toast({
                title: 'Registration Failed',
                description: 'There was an error registering your account. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box maxWidth="400px" margin="auto">
            <form onSubmit={handleSubmit}>
                <VStack spacing={4}>
                    <Heading as="h2" size="xl">Register</Heading>
                    <FormControl isRequired>
                        <FormLabel>Name</FormLabel>
                        <Input
                            type="text"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            placeholder="Enter your name"
                        />
                    </FormControl>
                    <FormControl isRequired>
                        <FormLabel>Group ID</FormLabel>
                        <Input
                            type="text"
                            value={groupId}
                            onChange={(e) => setGroupId(e.target.value)}
                            placeholder="Enter your group ID"
                        />
                    </FormControl>
                    <Button
                        type="submit"
                        colorScheme="blue"
                        isLoading={isLoading}
                        loadingText="Registering"
                    >
                        Register
                    </Button>
                </VStack>
            </form>
        </Box>
    );
};