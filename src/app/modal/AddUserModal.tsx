import React, { useState, useEffect } from 'react';
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalCloseButton,
    ModalBody,
    ModalFooter,
    Button,
    List,
    ListItem,
    HStack,
    Avatar,
    VStack,
    Text,
    Checkbox,
    useToast,
    Spinner
} from '@chakra-ui/react';
import axios from "axios";

interface User {
    id: string;
    name: string;
    email: string;
}

interface AddUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    courseId: string;
    onUserAdded: () => void;
}

export const AddUserModal: React.FC<AddUserModalProps> = ({
                                                              isOpen,
                                                              onClose,
                                                              courseId,
                                                              onUserAdded
                                                          }) => {
    const [unassignedUsers, setUnassignedUsers] = useState<User[]>([]);
    const [selectedUsers, setSelectedUsers] = useState<string[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const toast = useToast();

    const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';

    useEffect(() => {
        if (isOpen) {
            fetchUnassignedUsers();
        }
    }, [isOpen, courseId]);

    const fetchUnassignedUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get(`${API_URL}/courses/${courseId}/unassigned-users`);
            setUnassignedUsers(response.data);
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to fetch unassigned users',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
        setIsLoading(false);
    };

    const handleUserToggle = (userId: string) => {
        setSelectedUsers(prev =>
            prev.includes(userId)
                ? prev.filter(id => id !== userId)
                : [...prev, userId]
        );
    };

    const handleSubmit = async () => {
        if (selectedUsers.length === 0) {
            toast({
                title: 'Warning',
                description: 'Please select at least one user',
                status: 'warning',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setIsSubmitting(true);
        try {
            await Promise.all(selectedUsers.map(userId =>
                axios.post(`${API_URL}/users/assign-course`, {
                    user_id: userId,
                    course_id: courseId
                })
            ));

            onUserAdded(); // Llamar a la función de actualización
            onClose(); // Cerrar el modal
            setSelectedUsers([]); // Limpiar la selección

            toast({
                title: 'Success',
                description: 'Users assigned successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to assign users',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Modal isOpen={isOpen} onClose={onClose} size="lg">
            <ModalOverlay />
            <ModalContent>
                <ModalHeader>Add Users to Course</ModalHeader>
                <ModalCloseButton />
                <ModalBody>
                    {isLoading ? (
                        <VStack py={8}>
                            <Spinner />
                            <Text>Loading users...</Text>
                        </VStack>
                    ) : (
                        <List spacing={3}>
                            {unassignedUsers.map(user => (
                                <ListItem
                                    key={user.id}
                                    p={3}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    <HStack justify="space-between">
                                        <HStack spacing={3}>
                                            <Checkbox
                                                isChecked={selectedUsers.includes(user.id)}
                                                onChange={() => handleUserToggle(user.id)}
                                            />
                                            <Avatar
                                                size="sm"
                                                name={user.name}
                                                src={`https://www.gravatar.com/avatar/${user.email}?d=mp`}
                                            />
                                            <VStack align="start" spacing={0}>
                                                <Text fontWeight="medium">{user.name}</Text>
                                                <Text fontSize="sm" color="gray.500">
                                                    {user.email}
                                                </Text>
                                            </VStack>
                                        </HStack>
                                    </HStack>
                                </ListItem>
                            ))}
                        </List>
                    )}
                </ModalBody>
                <ModalFooter>
                    <Button variant="ghost" mr={3} onClick={onClose}>
                        Cancel
                    </Button>
                    <Button
                        colorScheme="blue"
                        onClick={handleSubmit}
                        isLoading={isSubmitting}
                        loadingText="Adding users..."
                        disabled={selectedUsers.length === 0}
                    >
                        Add Selected Users
                    </Button>
                </ModalFooter>
            </ModalContent>
        </Modal>
    );
};

export default AddUserModal;