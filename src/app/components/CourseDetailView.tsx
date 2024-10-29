import React from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Button,
    IconButton,
    Flex,
    Avatar,
    List,
    ListItem,
} from '@chakra-ui/react';
import { ChevronLeft, Users, Plus, Trash2 } from 'lucide-react';
import CourseFiles from './CourseFiles';

interface User {
    id: string;
    name: string;
    email: string;
}

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

interface CourseDetailViewProps {
    course: Course;
    files: ProcessedDocument[];
    onAddUser: () => void;
    onBack: () => void;
    onRemoveUser: (userId: string) => void;
    onFileUpload: () => void;
    onFileDelete: () => void;
}

const CourseDetailView: React.FC<CourseDetailViewProps> = ({
                                                               course,
                                                               files,
                                                               onAddUser,
                                                               onBack,
                                                               onRemoveUser,
                                                               onFileUpload,
                                                               onFileDelete,
                                                           }) => {
    return (
        <Box bg="white" borderRadius="lg" p={6}>
            {/* Header */}
            <HStack mb={6} spacing={4}>
                <IconButton
                    aria-label="Go back"
                    icon={<ChevronLeft />}
                    variant="ghost"
                    onClick={onBack}
                />
                <Text fontSize="xl" fontWeight="bold">{course.name}</Text>
            </HStack>

            <Flex direction={{ base: 'column', md: 'row' }} gap={8}>
                {/* Left Section - Files usando CourseFiles component */}
                <Box flex="2">
                    <CourseFiles
                        courseId={course.id}
                        files={files}
                        onFileUpload={onFileUpload}
                        onFileDelete={onFileDelete}
                    />
                </Box>

                {/* Right Section - Users */}
                <Box flex="1">
                    <VStack align="stretch" spacing={4}>
                        <HStack justify="space-between">
                            <HStack spacing={2}>
                                <Users size={20} />
                                <Text fontWeight="semibold">Assigned Users</Text>
                            </HStack>
                            <Button
                                leftIcon={<Plus size={16} />}
                                size="sm"
                                onClick={onAddUser}
                                colorScheme="green"
                            >
                                Add User
                            </Button>
                        </HStack>

                        <List spacing={3}>
                            {course.users.map((user) => (
                                <ListItem
                                    key={user.id}
                                    p={3}
                                    borderWidth="1px"
                                    borderRadius="md"
                                    _hover={{ bg: 'gray.50' }}
                                >
                                    <HStack justify="space-between">
                                        <HStack spacing={3}>
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
                                        <IconButton
                                            aria-label="Remove user"
                                            icon={<Trash2 size={16} />}
                                            size="sm"
                                            variant="ghost"
                                            colorScheme="red"
                                            onClick={() => onRemoveUser(user.id)}
                                        />
                                    </HStack>
                                </ListItem>
                            ))}
                        </List>
                    </VStack>
                </Box>
            </Flex>
        </Box>
    );
};

export default CourseDetailView;