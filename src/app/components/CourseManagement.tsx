import React, { useState, useEffect } from 'react';
import {
    VStack,
    HStack,
    Box,
    Heading,
    Text,
    Input,
    Button,
    Select,
    useToast,
    Table,
    Thead,
    Tbody,
    Tr,
    Th,
    Td, List, ListItem, FormControl, FormLabel,
} from '@chakra-ui/react';
import axios from 'axios';
import {useCourses} from "@/app/hook/CoursesProvider";


interface Course {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
}

interface ProcessedDocument {
    id: string;
    course_id: string;
    google_file_id: string;
    file_name: string;
    last_modified: string;
    qdrant_point_id: string;
}

interface CourseManagementProps {
    user: User;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';

export const CourseManagement: React.FC<CourseManagementProps> = ({ user }) => {
    const [courses, setCourses] = useState<Course[]>([]);
    const [newCourseName, setNewCourseName] = useState('');
    const [selectedCourse, setSelectedCourse] = useState('');
    const [courseFiles, setCourseFiles] = useState<ProcessedDocument[]>([]);
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const { userCourses, fetchUserCourses } = useCourses();
    const toast = useToast();

    useEffect(() => {
        fetchAllCourses();
    }, []);

    useEffect(() => {
        if (selectedCourse) {
            fetchCourseFiles(selectedCourse);
        }
    }, [selectedCourse]);

    const fetchAllCourses = async () => {
        try {
            const response = await axios.get(`${API_URL}/courses`);
            setCourses(response.data);
        } catch (error) {
            console.error('Error fetching all courses:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch courses',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleCreateCourse = async () => {
        if (!newCourseName.trim()) {
            toast({
                title: 'Error',
                description: 'Course name cannot be empty',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            const response = await axios.post(`${API_URL}/courses`, { name: newCourseName });
            setCourses([...courses, response.data]);
            setNewCourseName('');
            toast({
                title: 'Course Created',
                description: `Course "${response.data.name}" has been created successfully.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error creating course:', error);
            toast({
                title: 'Error',
                description: 'Failed to create course',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleAssignCourse = async () => {
        if (!selectedCourse) {
            toast({
                title: 'Error',
                description: 'Please select a course to assign',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        try {
            await axios.post(`${API_URL}/users/assign-course`, {
                user_id: user.id,
                course_id: selectedCourse
            });
            toast({
                title: 'Course Assigned',
                description: 'The course has been assigned to you successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchUserCourses(user.id);
        } catch (error) {
            console.error('Error assigning course:', error);
            toast({
                title: 'Error',
                description: 'Failed to assign course',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const fetchCourseFiles = async (courseId: string) => {
        try {
            const response = await axios.get<ProcessedDocument[]>(`${API_URL}/courses/${courseId}/files`);
            setCourseFiles(response.data);
        } catch (error) {
            console.error('Error fetching course files:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch course files',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            setFileToUpload(file);
        }
    };

    const uploadFile = async () => {
        if (!selectedCourse || !fileToUpload) {
            toast({
                title: 'Error',
                description: 'Please select a course and a file to upload',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const formData = new FormData();
        formData.append('course_id', selectedCourse);
        formData.append('file', fileToUpload);

        try {
            await axios.post(`${API_URL}/upload-document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast({
                title: 'File Uploaded',
                description: 'The file has been uploaded successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            fetchCourseFiles(selectedCourse);
            setFileToUpload(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                title: 'Error',
                description: 'Failed to upload file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <VStack spacing={6} align="stretch">
            <Box>
                <Heading size="lg" mb={4}>Course Management</Heading>
                <Text mb={2}>Welcome, {user.name}!</Text>
            </Box>

            <Box>
                <Heading size="md" mb={2}>Create New Course</Heading>
                <HStack>
                    <Input
                        placeholder="Enter course name"
                        value={newCourseName}
                        onChange={(e) => setNewCourseName(e.target.value)}
                    />
                    <Button colorScheme="blue" onClick={handleCreateCourse}>Create Course</Button>
                </HStack>
            </Box>

            <Box>
                <Heading size="md" mb={2}>Assign Course</Heading>
                <HStack>
                    <Select
                        placeholder="Select a course"
                        value={selectedCourse}
                        onChange={(e) => setSelectedCourse(e.target.value)}
                    >
                        {courses.map((course) => (
                            <option key={course.id} value={course.id}>{course.name}</option>
                        ))}
                    </Select>
                    <Button colorScheme="green" onClick={handleAssignCourse}>Assign Course</Button>
                </HStack>
            </Box>

            <Box>
                <Heading size="md" mb={2}>Your Assigned Courses</Heading>
                <Table variant="simple">
                    <Thead>
                        <Tr>
                            <Th>Course Name</Th>
                        </Tr>
                    </Thead>
                    <Tbody>
                        {userCourses.map((course) => (
                            <Tr key={course.id}>
                                <Td>{course.name}</Td>
                            </Tr>
                        ))}
                    </Tbody>
                </Table>
            </Box>

            {selectedCourse && (
                <Box>
                    <Heading size="md" mb={2}>Course Files</Heading>
                    <List spacing={3}>
                        {courseFiles.map((file) => (
                            <ListItem key={file.id}>
                                {file.file_name} (Last modified: {new Date(file.last_modified).toLocaleString()})
                            </ListItem>
                        ))}
                    </List>
                    <FormControl mt={4}>
                        <FormLabel>Upload New File</FormLabel>
                        <Input type="file" onChange={handleFileUpload} />
                    </FormControl>
                    <Button mt={2} colorScheme="blue" onClick={uploadFile} isDisabled={!fileToUpload}>
                        Upload File
                    </Button>
                </Box>
            )}
        </VStack>
    );
};