import React from 'react';
import { Grid, Box, HStack, Text, Menu, MenuButton, MenuList, MenuItem, IconButton, VStack } from '@chakra-ui/react';
import { FolderIcon, MoreVertical } from 'lucide-react';

interface Course {
    id: string;
    name: string;
    google_drive_folder_id: string;
    created_at: string;
    updated_at: string | null;
    users: User[];
    filesCount?: number;
    storageUsage?: string;
}

interface User {
    id: string;
    name: string;
    email: string;
}
interface CourseFolderViewProps {
    courses: Course[];
    onEdit?: (course: Course) => void;
    onDelete?: (course: Course) => void;
    onSelect?: (course: Course) => void;
}

const CourseFolderView: React.FC<CourseFolderViewProps> = ({
                                                               courses,
                                                               onEdit,
                                                               onDelete,
                                                               onSelect
                                                           }) => {
    return (
        <Box>
            <Text mb={4} fontWeight="medium" color="gray.500">
                All document files are in here
            </Text>
            <Grid
                templateColumns="repeat(auto-fill, minmax(200px, 1fr))"
                gap={4}
            >
                {courses.map((course) => (
                    <Box
                        key={course.id}
                        bg="white"
                        p={4}
                        borderRadius="lg"
                        boxShadow="sm"
                        cursor="pointer"
                        onClick={() => onSelect?.(course)}
                        transition="all 0.2s"
                        _hover={{
                            transform: 'translateY(-2px)',
                            boxShadow: 'md'
                        }}
                    >
                        <HStack justify="space-between" mb={3}>
                            <HStack spacing={3}>
                                <FolderIcon
                                    size={24}
                                    className="text-blue-500"
                                />
                                <Text fontWeight="medium">
                                    {course.name}
                                </Text>
                            </HStack>
                            {(onEdit || onDelete) && (
                                <Menu>
                                    <MenuButton
                                        as={IconButton}
                                        icon={<MoreVertical size={16} />}
                                        variant="ghost"
                                        size="sm"
                                        onClick={(e) => e.stopPropagation()}
                                    />
                                    <MenuList>
                                        {onEdit && (
                                            <MenuItem
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onEdit(course);
                                                }}
                                            >
                                                Edit
                                            </MenuItem>
                                        )}
                                        {onDelete && (
                                            <MenuItem
                                                color="red.500"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    onDelete(course);
                                                }}
                                            >
                                                Delete
                                            </MenuItem>
                                        )}
                                    </MenuList>
                                </Menu>
                            )}
                        </HStack>
                        <VStack align="stretch" spacing={1}>
                            <Text fontSize="sm" color="gray.500">
                                {course.filesCount || 0} Files
                            </Text>
                            <Text fontSize="sm" color="gray.500">
                                {course.storageUsage || '0 MB'} Usage
                            </Text>
                        </VStack>
                    </Box>
                ))}
            </Grid>
        </Box>
    );
};

export default CourseFolderView;