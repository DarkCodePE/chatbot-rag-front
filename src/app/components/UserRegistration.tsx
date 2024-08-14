import React, { useState } from 'react';
import { ChakraProvider, Box, VStack, Input, Button, Text, useToast } from '@chakra-ui/react';
import axios, { AxiosError } from 'axios';
import { User, UserCreate } from '../types/user';

export function UserRegistration() {
    const [name, setName] = useState('');
    const [groupId, setGroupId] = useState('');
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const handleRegister = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        try {
            const userCreate: UserCreate = { name, group_id: groupId };
            const response = await axios.post<User>('/api/register', userCreate);
            setUser(response.data);
            toast({
                title: 'Registration successful',
                description: `Welcome, ${response.data.name}!`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            const axiosError = error as AxiosError;
            console.error('Error registering user:', axiosError.response?.data || axiosError.message);
            toast({
                title: 'Registration failed',
                description: 'There was an error registering. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ChakraProvider>
            <Box maxWidth="400px" margin="auto" p={5}>
                {!user ? (
                    <form onSubmit={handleRegister}>
                        <VStack spacing={4}>
                            <Input
                                placeholder="Enter your name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                            />
                            <Input
                                placeholder="Enter your group ID"
                                value={groupId}
                                onChange={(e) => setGroupId(e.target.value)}
                            />
                            <Button type="submit" colorScheme="blue" isLoading={isLoading}>
                                Register
                            </Button>
                        </VStack>
                    </form>
                ) : (
                    <Text>Welcome, {user.name}! (Group: {user.group_id})</Text>
                )}
            </Box>
        </ChakraProvider>
    );
}