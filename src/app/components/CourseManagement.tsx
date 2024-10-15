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
import CourseFiles from "@/app/components/CourseFiles";
import ConfirmationDialog from "@/app/components/ConfirmationDialog";
import CourseForm from "@/app/components/CourseForm";
import CourseNewList from "@/app/components/CourseNewList";
import AssignedCourseList from "@/app/components/AssignedCourseList";
import styles from './Home.module.css';

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

    // Estados para edición y eliminación
    const [courseToEdit, setCourseToEdit] = useState<{ id: string; name: string } | null>(null);
    const [isEditMode, setIsEditMode] = useState(false);
    const [courseToDelete, setCourseToDelete] = useState<{ id: string; name: string } | null>(null);
    const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

    // Estados de carga
    const [isCreating, setIsCreating] = useState(false);
    const [isAssigning, setIsAssigning] = useState(false);
    const [isEditing, setIsEditing] = useState(false);

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
        setIsCreating(true);
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
        setIsCreating(false);
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
        setIsAssigning(true);
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
        setIsAssigning(false);
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

    const handleEditCourse = (course: Course) => {
        setCourseToEdit(course);
        setIsEditMode(true);
    };

    const handleUpdateCourse = async (updatedName: string) => {
        if (!courseToEdit) return;

        setIsEditing(true);
        try {
            const response = await axios.put(`/courses/${courseToEdit.id}`, {
                name: updatedName
            });
            setCourses(courses.map(course => course.id === courseToEdit.id ? response.data : course));
            toast({
                title: 'Course Updated',
                description: `Course "${response.data.name}" has been updated successfully.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsEditMode(false);
            setCourseToEdit(null);
        } catch (error) {
            console.error('Error updating course:', error);
            toast({
                title: 'Error',
                description: 'Failed to update course',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
        setIsEditing(false);
    };

    const handleDeleteCourse = (course: { id: string; name: string }) => {
        setCourseToDelete(course);
        setIsDeleteDialogOpen(true);
    };

    const confirmDeleteCourse = async () => {
        if (!courseToDelete) return;

        try {
            const response = await axios.delete(`/courses/${courseToDelete.id}`);
            setCourses(courses.filter(course => course.id !== courseToDelete.id));
            toast({
                title: 'Course Deleted',
                description: `Course "${courseToDelete.name}" has been deleted successfully.`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            setIsDeleteDialogOpen(false);
            setCourseToDelete(null);
        } catch (error) {
            console.error('Error deleting course:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete course',
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
        <VStack spacing={6} align="stretch" p={6}>
            {/* Header */}
            <Box>
                <Heading size="lg" mb={4}>Course Management</Heading>
            </Box>

            {/* Crear Nuevo Curso */}
            <Box>
                <Heading size="md" mb={2}>Create New Course</Heading>
                <CourseForm
                    onSubmit={handleCreateCourse}
                    submitLabel="Create Course"
                />
            </Box>

            {/* Asignar Curso */}
            <Box>
                <Heading size="md" mb={2}>Assign Course</Heading>
                <HStack>
                    <FormControl isRequired>
                        <FormLabel>Select a Course</FormLabel>
                        <Select
                            placeholder="Select a course"
                            value={selectedCourse}
                            onChange={(e) => setSelectedCourse(e.target.value)}
                        >
                            {courses.map((course) => (
                                <option key={course.id} value={course.id}>{course.name}</option>
                            ))}
                        </Select>
                    </FormControl>
                    <Button
                        colorScheme="green"
                        onClick={handleAssignCourse}
                        isLoading={isAssigning}
                        loadingText="Assigning"
                    >
                        Assign Course
                    </Button>
                </HStack>
            </Box>

            {/* Listado de Cursos Asignados */}
            <Box>
                <Heading size="md" mb={2}>Your Assigned Courses</Heading>
                {userCourses.length > 0 ? (
                    <AssignedCourseList assignedCourses={userCourses} />
                ) : (
                    <Text>No courses assigned yet.</Text>
                )}
            </Box>

            {/* Listado de Todos los Cursos con Opciones de Editar y Eliminar */}
            <Box>
                <Heading size="md" mb={2}>All Courses</Heading>
                {courses.length > 0 ? (
                    <CourseNewList
                        courses={courses}
                        onEdit={handleEditCourse}
                        onDelete={handleDeleteCourse}
                    />
                ) : (
                    <Text>No courses available.</Text>
                )}
            </Box>

            {/* Formulario de Edición de Curso */}
            {isEditMode && courseToEdit && (
                <Box>
                    <Heading size="md" mb={2}>Edit Course</Heading>
                    <CourseForm
                        onSubmit={handleUpdateCourse}
                        initialValue={courseToEdit.name}
                        submitLabel="Update Course"
                    />
                    <Button mt={2} onClick={() => setIsEditMode(false)}>
                        Cancel
                    </Button>
                </Box>
            )}

            {/* Diálogo de Confirmación para Eliminación de Curso */}
            {courseToDelete && (
                <ConfirmationDialog
                    isOpen={isDeleteDialogOpen}
                    onClose={() => setIsDeleteDialogOpen(false)}
                    onConfirm={confirmDeleteCourse}
                    title="Delete Course"
                    message={`Are you sure you want to delete the course "${courseToDelete.name}"? This action cannot be undone.`}
                />
            )}

            {/* Gestión de Archivos del Curso Seleccionado */}
            {selectedCourse && (
                <Box>
                    <Heading size="md" mb={2}>Course Files</Heading>
                    <CourseFiles
                        courseId={selectedCourse}
                        files={courseFiles}
                        onFileUpload={() => fetchCourseFiles(selectedCourse)}
                        onFileDelete={() => fetchCourseFiles(selectedCourse)}
                    />
                </Box>
            )}
        </VStack>
    );
};