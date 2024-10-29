import React, { useState } from 'react';
import {
    Box,
    VStack,
    Text,
    Button,
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    Input,
    useDisclosure,
    useToast
} from '@chakra-ui/react';
import { Plus, FolderPlus } from 'lucide-react';
import axios from 'axios';
import {User} from "@/app/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';
interface Course {
    id: string;
    name: string;
    google_drive_folder_id: string;
    created_at: string;
    updated_at: string | null;
    users: User[];
}

interface EmptyCourseStateProps {
    onCourseCreated: (course: Course) => void;
}
const EmptyCourseState: React.FC<EmptyCourseStateProps> = ({ onCourseCreated }) => {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const [newCourseName, setNewCourseName] = useState('');
    const [isCreating, setIsCreating] = useState(false);
    const toast = useToast();

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

        setIsCreating(true);
        try {
            const response = await axios.post(`${API_URL}/courses`, {
                name: newCourseName
            });

            toast({
                title: 'Success',
                description: 'Course created successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onCourseCreated(response.data);
            setNewCourseName('');
            onClose();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create course',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsCreating(false);
        }
    };

    return (
        <>
            <Box
                p={8}
                borderWidth="2px"
                borderStyle="dashed"
                borderRadius="lg"
                borderColor="gray.300"
            >
                <VStack spacing={4}>
                    <Box
                        p={4}
                        borderRadius="full"
                        bg="gray.100"
                    >
                        <FolderPlus size={40} className="text-gray-400" />
                    </Box>
                    <Text fontSize="xl" fontWeight="medium">
                        No courses yet
                    </Text>
                    <Text color="gray.500" textAlign="center">
                        Get started by creating your first course
                    </Text>
                    <Button
                        leftIcon={<Plus size={20} />}
                        colorScheme="blue"
                        onClick={onOpen}
                    >
                        Create Course
                    </Button>
                </VStack>
            </Box>

            <Modal isOpen={isOpen} onClose={onClose}>
                <ModalOverlay />
                <ModalContent>
                    <ModalHeader>Create New Course</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody pb={6}>
                        <VStack spacing={4}>
                            <Input
                                placeholder="Enter course name"
                                value={newCourseName}
                                onChange={(e) => setNewCourseName(e.target.value)}
                            />
                            <Button
                                colorScheme="blue"
                                width="full"
                                onClick={handleCreateCourse}
                                isLoading={isCreating}
                                loadingText="Creating..."
                            >
                                Create Course
                            </Button>
                        </VStack>
                    </ModalBody>
                </ModalContent>
            </Modal>
        </>
    );
};

export default EmptyCourseState;