// components/CourseList.tsx
import React from 'react';
import { List, ListItem, Button, HStack, Text, Box } from '@chakra-ui/react';

interface Course {
    id: string;
    name: string;
}

interface CourseListProps {
    courses: Course[];
    onEdit: (course: Course) => void;
    onDelete: (course: Course) => void;
}

const CourseList: React.FC<CourseListProps> = ({ courses, onEdit, onDelete }) => {
    return (
        <List spacing={3}>
            {courses.map((course) => (
                <ListItem key={course.id} borderWidth="1px" borderRadius="md" p={3}>
                    <HStack justifyContent="space-between">
                        <Text>{course.name}</Text>
                        <HStack>
                            <Button size="sm" colorScheme="teal" onClick={() => onEdit(course)}>
                                Edit
                            </Button>
                            <Button size="sm" colorScheme="red" onClick={() => onDelete(course)}>
                                Delete
                            </Button>
                        </HStack>
                    </HStack>
                </ListItem>
            ))}
        </List>
    );
};

export default CourseList;
