// pages/index.tsx
'use client';
import React, { useState } from 'react';
import {
    ChakraProvider,
    Box,
    VStack,
    Input,
    Button,
    Tabs,
    TabList,
    TabPanels,
    Tab,
    TabPanel,
    useToast,
} from '@chakra-ui/react';
import axios from 'axios';
import {CoursesProvider} from "@/app/hook/CoursesProvider";
import {CourseManagement} from "@/app/components/CourseManagement";
import {ChatInterface} from "@/app/components/ChatInterface";


interface User {
    id: string;
    name: string;
    session_id: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [loginName, setLoginName] = useState('');
    const toast = useToast();

    const handleLogin = async () => {
        try {
            const response = await axios.post(`${API_URL}/users/login`, { name: loginName });
            setUser(response.data);
            toast({
                title: 'Login Successful',
                description: `Welcome, ${response.data.name}!`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Login error:', error);
            toast({
                title: 'Login Failed',
                description: 'There was an error logging in. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <ChakraProvider>
            <Box maxWidth="800px" margin="auto" p={5}>
                {!user ? (
                    <VStack spacing={4}>
                        <Input
                            placeholder="Enter your name"
                            value={loginName}
                            onChange={(e) => setLoginName(e.target.value)}
                        />
                        <Button onClick={handleLogin}>Login</Button>
                    </VStack>
                ) : (
                    <CoursesProvider user={user}>
                        <Tabs>
                            <TabList>
                                <Tab>Course Management</Tab>
                                <Tab>Chat</Tab>
                            </TabList>
                            <TabPanels>
                                <TabPanel>
                                    <CourseManagement user={user} />
                                </TabPanel>
                                <TabPanel>
                                    <ChatInterface user={user} />
                                </TabPanel>
                            </TabPanels>
                        </Tabs>
                    </CoursesProvider>
                )}
            </Box>
        </ChakraProvider>
    );
}