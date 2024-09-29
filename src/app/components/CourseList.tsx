import React, {useEffect, useState} from 'react';
import {Box, Heading, SimpleGrid, Button, useToast} from '@chakra-ui/react';
import axios from 'axios';
import {useCourses} from "@/app/hook/CoursesProvider";


const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';

interface Course {
    id: string;
    name: string;
}
interface User {
    id: string;
    name: string;
}

interface CourseListProps {
    onSelectCourse: (courseId: string) => void,
    user: User;
}

export const CourseList: React.FC<CourseListProps> = ({onSelectCourse, user}) => {
    const {userCourses, fetchUserCourses} = useCourses();
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    useEffect(() => {
        fetchUserCourses(user.id);
    }, []);

    const handleCourseClick = (courseId: string) => {
        setIsLoading(true);
        // Aquí podrías añadir lógica para cargar datos del curso si es necesario
        onSelectCourse(courseId);
        setIsLoading(false);
    };

    return (
        <Box>
            <Heading mb={6}>Your Courses</Heading>
            <SimpleGrid columns={[1, 2, 3]} spacing={6}>
                {userCourses.map((course) => (
                    <Button
                        key={course.id}
                        onClick={() => handleCourseClick(course.id)}
                        height="100px"
                        isLoading={isLoading}
                    >
                        {course.name}
                    </Button>
                ))}
            </SimpleGrid>
        </Box>
    );
};
