import React, { useState } from 'react';
import { Box, VStack, Heading } from '@chakra-ui/react';
import { UserRegistration } from './UserRegistration';
import { ChatInterface } from './ChatInterface';

interface User {
    name: string;
    group_id: string;
}

export const Dashboard: React.FC = () => {
    const [user, setUser] = useState<User | null>(null);

    const handleRegistrationSuccess = (userData: User) => {
        setUser(userData);
    };

    return (
        <Box maxWidth="800px" margin="auto" p={5}>
            <VStack spacing={8} align="stretch">
                <Heading as="h1" size="xl" textAlign="center">
                    User Dashboard
                </Heading>
                {!user ? (
                    <UserRegistration onRegistrationSuccess={handleRegistrationSuccess} />
                ) : (
                    <>
                        <Heading as="h2" size="lg">
                            Welcome, {user.name}!
                        </Heading>
                        <ChatInterface groupId={user.group_id} />
                    </>
                )}
            </VStack>
        </Box>
    );
};