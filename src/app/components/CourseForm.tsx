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
        if (courseName.trim().length < 3) {
            toast({
                title: 'Invalid Name',
                description: 'Course name must be at least 3 characters long.',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }
        onSubmit(courseName.trim());
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