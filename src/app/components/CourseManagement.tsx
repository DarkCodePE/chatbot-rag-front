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
import CourseFolderView from "@/app/components/CourseFolderView";
import CourseDetailView from "@/app/components/CourseDetailView";
import AddUserModal from "@/app/modal/AddUserModal";
import RemoveUserDialog from "@/app/modal/RemoveUserDialogProps";
import {User} from "@/app/types/user";
import EmptyCourseState from "@/app/components/EmptyCourseState";


interface Course {
    id: string;
    name: string;
    google_drive_folder_id: string;
    created_at: string;
    updated_at: string | null;
    users: User[];
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
    // Cargar usuarios asignados
    const [selectedCourseDetails, setSelectedCourseDetails] = useState<Course | null>(null);
    const [assignedUsers, setAssignedUsers] = useState<User[]>([]);
    const [isAddUserModalOpen, setIsAddUserModalOpen] = useState(false);
    //desasignar users
    const [userToRemove, setUserToRemove] = useState<{id: string; name: string} | null>(null);
    const [isRemoveDialogOpen, setIsRemoveDialogOpen] = useState(false);

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

    const handleSelectCourse = async (course: Course) => {
        setSelectedCourseDetails(course);
        // Cargar archivos
        await fetchCourseFiles(course.id);
        // Cargar usuarios asignados
        //await fetchCourseUsers(course.id);
    };

    const handleAddUser = () => {
        setIsAddUserModalOpen(true);
    };

    //función para manejar cuando se agregan usuarios
    const handleUserAdded = async () => {
        if (selectedCourseDetails) {
            try {
                // Obtener los datos actualizados del curso directamente de la API
                const response = await axios.get(`${API_URL}/courses/${selectedCourseDetails.id}`);
                const updatedCourse = response.data;

                // Actualizar el curso seleccionado con los nuevos datos
                setSelectedCourseDetails(updatedCourse);

                // Actualizar la lista completa de cursos
                const coursesResponse = await axios.get(`${API_URL}/courses`);
                setCourses(coursesResponse.data);

                toast({
                    title: 'Success',
                    description: 'User added successfully',
                    status: 'success',
                    duration: 3000,
                    isClosable: true,
                });
            } catch (error) {
                console.error('Error updating course details:', error);
                toast({
                    title: 'Error',
                    description: 'Failed to update course details',
                    status: 'error',
                    duration: 3000,
                    isClosable: true,
                });
            }
        }
    };
    const handleRemoveUser = (userId: string) => {
        const userToRemove = selectedCourseDetails?.users?.find((user: User) => user.id === userId);
        if (userToRemove) {
            setUserToRemove(userToRemove);
            setIsRemoveDialogOpen(true);
        }
    };

    const handleConfirmRemove = async () => {
        if (!userToRemove || !selectedCourseDetails) return;

        try {
            await axios.delete(`${API_URL}/courses/${selectedCourseDetails.id}/users/${userToRemove.id}`);

            // Obtener los datos actualizados del curso
            const response = await axios.get(`${API_URL}/courses/${selectedCourseDetails.id}`);
            setSelectedCourseDetails(response.data);

            // Actualizar la lista completa de cursos
            const coursesResponse = await axios.get(`${API_URL}/courses`);
            setCourses(coursesResponse.data);

            toast({
                title: 'Success',
                description: `${userToRemove.name} has been removed from the course`,
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            console.error('Error removing user:', error);
            toast({
                title: 'Error',
                description: 'Failed to remove user from course',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsRemoveDialogOpen(false);
            setUserToRemove(null);
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
            const response = await axios.put(`${API_URL}/courses/${courseToEdit.id}`, {
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
            const response = await axios.delete(`${API_URL}/courses/${courseToDelete.id}`);
            setCourses(courses.filter(course => course.id !== courseToDelete.id));
            // Limpiar la selección de curso y archivos si el curso eliminado era el seleccionado
            if (selectedCourse === courseToDelete.id) {
                setSelectedCourse(''); // Limpiar curso seleccionado
                setCourseFiles([]); // Limpiar lista de archivos
            }
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
    const handleCourseCreated = (newCourse) => {
        setCourses(prevCourses => [...prevCourses, newCourse]);
    };

    return (

        <VStack spacing={6} align="stretch" p={6}>
            {selectedCourseDetails ? (
                <>
                    <CourseDetailView
                        course={selectedCourseDetails}
                        files={courseFiles}
                        onAddUser={handleAddUser}
                        onBack={() => setSelectedCourseDetails(null)}
                        onRemoveUser={handleRemoveUser}
                        onFileUpload={() => fetchCourseFiles(selectedCourseDetails.id)}
                        onFileDelete={() => fetchCourseFiles(selectedCourseDetails.id)}
                    />
                    {/* Modal para agregar usuarios al curso */}
                    <AddUserModal
                        isOpen={isAddUserModalOpen}
                        onClose={() => setIsAddUserModalOpen(false)}
                        courseId={selectedCourseDetails.id}
                        onUserAdded={handleUserAdded}
                    />
                    {/* Modal de confirmación desasignar usuarios */}
                    <RemoveUserDialog
                        isOpen={isRemoveDialogOpen}
                        onClose={() => {
                            setIsRemoveDialogOpen(false);
                            setUserToRemove(null);
                        }}
                        onConfirm={handleConfirmRemove}
                        userName={userToRemove?.name || ''}
                    />
                </>
            ) : (
                <>
                    <Box>
                        <Heading size="lg" mb={4}>Course Management</Heading>
                    </Box>
                    <Box>
                        <Heading size="md" mb={4}>All Courses</Heading>
                        {courses.length === 0 ? (
                            <EmptyCourseState onCourseCreated={handleCourseCreated} />
                        ) : (
                            <CourseFolderView
                                courses={courses.map(course => ({
                                    ...course,
                                    filesCount: courseFiles.filter(f => f.course_id === course.id).length,
                                    storageUsage: '0 MB'
                                }))}
                                onSelect={handleSelectCourse}
                                onEdit={handleEditCourse}
                                onDelete={handleDeleteCourse}
                            />
                        )}
                    </Box>
                </>
            )}
            <input
                type="file"
                id="fileInput"
                style={{ display: 'none' }}
                onChange={handleFileUpload}
            />
        </VStack>

    );
};