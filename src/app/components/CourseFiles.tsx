// components/CourseFiles.tsx
import React, { useState } from 'react';
import {
    List,
    ListItem,
    Button,
    HStack,
    Text,
    FormControl,
    FormLabel,
    Input,
    useToast,
} from '@chakra-ui/react';
import { ArrowRightIcon, DeleteIcon, DownloadIcon } from '@chakra-ui/icons';
import axios from 'axios';

interface ProcessedDocument {
    id: string;
    course_id: string;
    google_file_id: string;
    file_name: string;
    last_modified: string;
    qdrant_point_id: string;
}

interface CourseFilesProps {
    courseId: string;
    files: ProcessedDocument[];
    onFileUpload: () => void;
    onFileDelete: () => void;
}

const CourseFiles: React.FC<CourseFilesProps> = ({ courseId, files, onFileUpload, onFileDelete }) => {
    const [fileToUpload, setFileToUpload] = useState<File | null>(null);
    const toast = useToast();

    const handleFileUpload = async () => {
        if (!courseId || !fileToUpload) {
            toast({
                title: 'Error',
                description: 'Please select a course and a file to upload',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        const formData = new FormData();
        formData.append('course_id', courseId);
        formData.append('file', fileToUpload);

        try {
            await axios.post(`/upload-document`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            toast({
                title: 'File Uploaded',
                description: 'The file has been uploaded successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onFileUpload();
            setFileToUpload(null);
        } catch (error) {
            console.error('Error uploading file:', error);
            toast({
                title: 'Error',
                description: 'Failed to upload file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleFileDelete = async (fileId: string) => {
        try {
            await axios.delete(`/delete-document/${fileId}`);
            toast({
                title: 'File Deleted',
                description: 'The file has been deleted successfully.',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onFileDelete();
        } catch (error) {
            console.error('Error deleting file:', error);
            toast({
                title: 'Error',
                description: 'Failed to delete file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    const handleDownloadFile = async (file: ProcessedDocument) => {
        try {
            const response = await axios.get(`/download-document/${file.id}`, {
                responseType: 'blob',
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.file_name);
            document.body.appendChild(link);
            link.click();
            link.parentNode?.removeChild(link);
        } catch (error) {
            console.error('Error downloading file:', error);
            toast({
                title: 'Error',
                description: 'Failed to download file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
    };

    return (
        <div>
            <HStack mb={4}>
                <FormControl>
                    <FormLabel>Upload New File</FormLabel>
                    <Input type="file" onChange={(e) => setFileToUpload(e.target.files?.[0] || null)} />
                </FormControl>
                <Button
                    colorScheme="blue"
                    leftIcon={<ArrowRightIcon />}
                    onClick={handleFileUpload}
                    isDisabled={!fileToUpload}
                >
                    Upload
                </Button>
            </HStack>
            <List spacing={3}>
                {files.map((file) => (
                    <ListItem key={file.id} borderWidth="1px" borderRadius="md" p={3}>
                        <HStack justifyContent="space-between">
                            <Text>
                                {file.file_name} (Last modified: {new Date(file.last_modified).toLocaleString()})
                            </Text>
                            <HStack>
                                <Button
                                    size="sm"
                                    colorScheme="teal"
                                    leftIcon={<DownloadIcon />}
                                    onClick={() => handleDownloadFile(file)}
                                >
                                    Download
                                </Button>
                                <Button
                                    size="sm"
                                    colorScheme="red"
                                    leftIcon={<DeleteIcon />}
                                    onClick={() => handleFileDelete(file.id)}
                                >
                                    Delete
                                </Button>
                            </HStack>
                        </HStack>
                    </ListItem>
                ))}
            </List>
        </div>
    );
};

export default CourseFiles;
