import React, { createContext, useState, useContext, useEffect } from 'react';
import axios from 'axios';

interface Course {
    id: string;
    name: string;
}

interface User {
    id: string;
    name: string;
}

interface CoursesContextType {
    userCourses: Course[];
    fetchUserCourses: (userId: string) => Promise<void>;
}

const CoursesContext = createContext<CoursesContextType | undefined>(undefined);

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';

export const CoursesProvider: React.FC<{children: React.ReactNode, user: User}> = ({ children, user }) => {
    const [userCourses, setUserCourses] = useState<Course[]>([]);

    const fetchUserCourses = async (userId: string) => {
        try {
            const response = await axios.get(`${API_URL}/users/${userId}/courses`);
            setUserCourses(response.data);
        } catch (error) {
            console.error('Error fetching user courses:', error);
        }
    };

    useEffect(() => {
        if (user) {
            fetchUserCourses(user.id);
        }
    }, [user]);

    return (
        <CoursesContext.Provider value={{ userCourses, fetchUserCourses }}>
            {children}
        </CoursesContext.Provider>
    );
};

export const useCourses = () => {
    const context = useContext(CoursesContext);
    if (context === undefined) {
        throw new Error('useCourses must be used within a CoursesProvider');
    }
    return context;
};