// components/AssignedCourseList.tsx
import React from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, Text } from '@chakra-ui/react';

interface AssignedCourseListProps {
    assignedCourses: { id: string; name: string }[];
}

const AssignedCourseList: React.FC<AssignedCourseListProps> = ({ assignedCourses }) => {
    return (
        <Table variant="simple">
            <Thead>
                <Tr>
                    <Th>Course Name</Th>
                </Tr>
            </Thead>
            <Tbody>
                {assignedCourses.map((course) => (
                    <Tr key={course.id}>
                        <Td>{course.name}</Td>
                    </Tr>
                ))}
            </Tbody>
        </Table>
    );
};

export default AssignedCourseList;
