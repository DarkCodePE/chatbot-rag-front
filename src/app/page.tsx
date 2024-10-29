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
    Image, HStack,
} from '@chakra-ui/react';
import axios from 'axios';
import {CoursesProvider} from "@/app/hook/CoursesProvider";
import {CourseManagement} from "@/app/components/CourseManagement";
import {ChatInterface} from "@/app/components/ChatInterface";
import styles from './Home.module.css';
import {CourseList} from "@/app/components/CourseList";
import customTheme from "@/app/theme";
import {User} from "@/app/types/user";


const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';

export default function Home() {
    const [user, setUser] = useState<User | null>(null);
    const [isLogin, setIsLogin] = useState(true);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [name, setName] = useState('');
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
    const [showCourseManagement, setShowCourseManagement] = useState(false);
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
    const handleSelectCourse = (courseId: string) => {
        setSelectedCourseId(courseId);
    };

    const handleBackToCourses = () => {
        setSelectedCourseId(null);
    };

    const toggleCourseManagement = () => {
        setShowCourseManagement(!showCourseManagement);
    };

    return (

        <Box maxWidth="800px" margin="auto" p={5} className={styles.container}>
            {!user ? (
                <Box className={`${styles.signIn} techwave_fn_sign`}>
                    <Box className={`${styles.signContent} sign__content`}>
                        <Box className={styles.logoContainer}>
                            <Image
                                src="/images/logo-preview.png"
                                alt="Techwave Logo"
                                className={`${styles.logo} ${styles.livingLogo}`}
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
                            <Button onClick={handleAuth} className={`${styles.button} techwave_fn_button`} width="100%">
                                {isLogin ? 'Sign In' : 'Sign Up'}
                            </Button>
                            <Box className={`${styles.formAlternative} form__alternative`} width="100%">
                                <Flex align="center" justify="center" position="relative">
                                    <Divider />
                                    <Text position="absolute" px={2} bg="#f5f5f5" color="gray.500">
                                        OR
                                    </Text>
                                </Flex>
                                <Button className={`${styles.button} techwave_fn_button`} width="100%" mt={4}>
                                    Sign in with Google
                                </Button>
                            </Box>
                        </VStack>
                        <Text className={`${styles.signDesc} sign__desc`} mt={4} textAlign="center">
                            {isLogin ? (
                                <>Not a member? <Link onClick={toggleAuthMode} color="#8768f8">Sign Up</Link></>
                            ) : (
                                <>Already have an account? <Link onClick={toggleAuthMode} color="blue.500">Sign In</Link></>
                            )}
                        </Text>
                    </Box>
                </Box>
            ) : (
                <CoursesProvider user={user}>
                    <VStack spacing={4} align="stretch">
                        <HStack justifyContent="space-between">
                            <Text>Welcome, {user.name}!</Text>
                            <Button onClick={toggleCourseManagement}>
                                {showCourseManagement ? 'Back to Courses' : 'Manage Courses'}
                            </Button>
                        </HStack>
                        {showCourseManagement ? (
                            <CourseManagement user={user} />
                        ) : selectedCourseId ? (
                            <>
                                <Button onClick={handleBackToCourses}>Back to Courses</Button>
                                <ChatInterface user={user} selectedCourse={selectedCourseId}/>
                            </>
                        ) : (
                            <CourseList user={user} onSelectCourse={handleSelectCourse} />
                        )}
                    </VStack>
                </CoursesProvider>
            )}
        </Box>

    );
}