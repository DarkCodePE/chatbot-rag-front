import React, { useState, useEffect } from 'react';
import { Input, Button, HStack, FormControl, FormLabel, useToast } from '@chakra-ui/react';
import styles from './ChatInterface.module.css';


interface CourseFormProps {
    onSubmit: (courseName: string) => void;
    initialValue?: string;
    submitLabel: string;
}

const CourseForm: React.FC<CourseFormProps> = ({ onSubmit, initialValue = '', submitLabel }) => {
    const [courseName, setCourseName] = useState(initialValue);
    const toast = useToast();

    useEffect(() => {
        setCourseName(initialValue);
    }, [initialValue]);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const trimmedName = courseName.trim();
        if (trimmedName.length < 3) {
            toast({
                title: 'Invalid Name',
                description: 'El nombre del curso debe tener al menos 3 caracteres.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        // Validación de caracteres especiales
        if (!/^[a-zA-Z0-9\s-]+$/.test(trimmedName)) {
            toast({
                title: 'Invalid Characters',
                description: 'Course name can only contain letters, numbers, spaces, and hyphens.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        onSubmit(trimmedName);
        setCourseName('');
    };

    return (
        <form onSubmit={handleSubmit} className={styles.form}>
            <HStack className={styles.formContainer}>
                <FormControl isRequired>
                    <FormLabel className={styles.inputLabel}>Course Name</FormLabel>
                    <Input
                        placeholder="Enter course name"
                        value={courseName}
                        onChange={(e) => setCourseName(e.target.value)}
                        className={styles.input}
                    />
                </FormControl>
                <Button type="submit" className={styles.button}>
                    {submitLabel}
                </Button>
            </HStack>
        </form>
    );
};

export default CourseForm;