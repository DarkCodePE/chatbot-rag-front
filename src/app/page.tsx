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
    Text,
    Flex,
    Link,
    Divider,
    Image,
} from '@chakra-ui/react';
import axios from 'axios';
import {CoursesProvider} from "@/app/hook/CoursesProvider";
import {CourseManagement} from "@/app/components/CourseManagement";
import {ChatInterface} from "@/app/components/ChatInterface";
import styles from './Home.module.css';

interface User {
    id: string;
    name: string;
    session_id: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const toast = useToast();

    const handleAuth = async () => {
        try {
            const endpoint = isLogin ? '/users/login' : '/users/register';
            const data = isLogin ? { email, password } : { name, email, password };

            const response = await axios.post(`${API_URL}${endpoint}`, data);
            setUser(response.data);
            toast({
                title: isLogin ? 'Login Successful' : 'Registration Successful',
                description: `Welcome, ${response.data.name}!`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Authentication error:', error);
            toast({
                title: isLogin ? 'Login Failed' : 'Registration Failed',
                description: 'There was an error. Please try again.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const toggleAuthMode = () => {
        setIsLogin(!isLogin);
        setEmail('');
        setPassword('');
        setName('');
    };

    return (
        <ChakraProvider>
            <Box maxWidth="800px" margin="auto" p={5} className={styles.container}>
                {!user ? (
                    <Box className={`${styles.signIn} techwave_fn_sign`}>
                        <Box className={`${styles.signContent} sign__content`}>
                            <Box className={styles.logoContainer}>
                                <Image
                                    src="/images/logo-preview.png"
                                    alt="Techwave Logo"
                                    className={styles.logo}
                                />
                            </Box>
                            <VStack spacing={4} className={`${styles.formContent} form__content`}>
                                <Text className={`${styles.formTitle} form__title`} fontSize="2xl" fontWeight="bold">
                                    {isLogin ? 'Sign In' : 'Sign Up'}
                                </Text>
                                {!isLogin && (
                                    <Box className={`${styles.formName} form__name`} width="100%">
                                        <Input
                                            type="text"
                                            placeholder="Enter your name"
                                            value={name}
                                            onChange={(e) => setName(e.target.value)}
                                            className={`${styles.input} form__name`}
                                        />
                                    </Box>
                                )}
                                <Box className={`${styles.formEmail} form__email`} width="100%">
                                    <Input
                                        type="email"
                                        placeholder="Enter your email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className={`${styles.input} form__email`}
                                    />
                                </Box>
                                <Box className={`${styles.formPass} form__pass`} width="100%">
                                    <Input
                                        type="password"
                                        placeholder="Password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        className={styles.input}
                                    />
                                </Box>
                                <Button onClick={handleAuth} className={`${styles.button} form__submit`} width="100%">
                                    {isLogin ? 'Sign In' : 'Sign Up'}
                                </Button>
                                <Box className={`${styles.formAlternative} form__alternative`} width="100%">
                                    <Flex align="center" className="fn__lined_text">
                                        <Divider className="line" />
                                    </Flex>
                                    <Button className={`${styles.button} techwave_fn_button`} width="100%" mt={4}>
                                        Sign in with Google
                                    </Button>
                                </Box>
                            </VStack>
                            <Text className={`${styles.signDesc} sign__desc`} mt={4} textAlign="center">
                                {isLogin ? (
                                    <>Not a member? <Link onClick={toggleAuthMode} color="blue.500">Sign Up</Link></>
                                ) : (
                                    <>Already have an account? <Link onClick={toggleAuthMode} color="blue.500">Sign In</Link></>
                                )}
                            </Text>
                        </Box>
                    </Box>
                ) : (
                    <CoursesProvider user={user}>
                        <Tabs className={styles.tabs}>
                            <TabList>
                                <Tab className={styles.tab}>Course Management</Tab>
                                <Tab className={styles.tab}>Chat</Tab>
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