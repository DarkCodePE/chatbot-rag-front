import React, { useState } from 'react';
import {
    Box,
    Button,
    FormControl,
    FormLabel,
    FormErrorMessage,
    Input,
    VStack,
    useToast,
} from '@chakra-ui/react';
import axios from 'axios';

interface User {
    name: string;
    group_id: string;
}

interface UserRegistrationProps {
    onRegistrationSuccess: (user: User) => void;
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
            console.log('Submitting registration:', { name, group_id: groupId });
            const response = await axios.post<User>('/api/users/register', {
                name,
                group_id: groupId,
            });

            console.log('Registration response:', response.data);
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
        <Box as="form" onSubmit={handleSubmit}>
            <VStack spacing={4}>
                <FormControl isRequired>
                    <FormLabel>Name</FormLabel>
                    <Input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Enter your name"
                    />
                </FormControl>
                <FormControl isRequired>
                    <FormLabel>Group ID</FormLabel>
                    <Input
                        value={groupId}
                        onChange={(e) => setGroupId(e.target.value)}
                        placeholder="Enter your group ID"
                    />
                </FormControl>
                <Button type="submit" colorScheme="blue" isLoading={isLoading}>
                    Register
                </Button>
            </VStack>
        </Box>
    );
};