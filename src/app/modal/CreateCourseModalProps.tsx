import React, { useState } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalCloseButton,
    useToast
} from '@chakra-ui/react';
import axios from 'axios';
import CourseForm from '../components/CourseForm';
import { User } from "@/app/types/user";

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';

interface Course {
    id: string;
    name: string;
    google_drive_folder_id: string;
    created_at: string;
    updated_at: string | null;
    users: User[];
}

interface CreateCourseModalProps {
    isOpen: boolean;
    onClose: () => void;
    onCourseCreated: (course: Course) => void;
}

const CreateCourseModal: React.FC<CreateCourseModalProps> = ({
                                                                 isOpen,
                                                                 onClose,
                                                                 onCourseCreated
                                                             }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const handleCreateCourse = async (courseName: string) => {
        setIsSubmitting(true);
        try {
            const response = await axios.post<Course>(`${API_URL}/courses`, {
                name: courseName
            });

            toast({
                title: 'Success',
                description: 'Course created successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });

            onCourseCreated(response.data);
            onClose(); // Asegurarnos de que el modal se cierre
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to create course',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            closeOnOverlayClick={!isSubmitting}
            closeOnEsc={!isSubmitting}
        >
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Create New Course</ModalHeader>
                <ModalCloseButton isDisabled={isSubmitting} />
                <ModalBody pb={6}>
                    <CourseForm
                        onSubmit={handleCreateCourse}
                        submitLabel="Create Course"
                        isDisabled={isSubmitting}
                    />
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};

export default CreateCourseModal;