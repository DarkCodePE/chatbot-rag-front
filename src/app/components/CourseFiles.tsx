import React, { useCallback, useState } from 'react';
import {
    Box,
    List,
    ListItem,
    Button,
    HStack,
    Text,
    useToast,
    VStack,
    Icon,
    Progress
} from '@chakra-ui/react';
import { Upload, X, FileText, Download, Trash } from 'lucide-react';
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

const API_URL = process.env.NEXT_PUBLIC_API_URL_PROD || 'https://orlandokuan.org';

export default function CourseFiles({ courseId, files, onFileUpload, onFileDelete }: CourseFilesProps) {
    const [isDragging, setIsDragging] = useState(false);
    const [uploadProgress, setUploadProgress] = useState<number | null>(null);
    const [uploadingFile, setUploadingFile] = useState<string | null>(null);
    const toast = useToast();

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleFileDrop = useCallback(async (e: React.DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        if (files.length > 0) {
            await handleFileUpload(files[0]);
        }
    }, [courseId]);

    const handleFileUpload = async (file: File) => {
        if (!courseId) {
            toast({
                title: 'Error',
                description: 'Course ID is required',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
            return;
        }

        setUploadingFile(file.name);
        const formData = new FormData();
        formData.append('course_id', courseId);
        formData.append('file', file);

        try {
            await axios.post(`${API_URL}/upload-document`, formData, {
                onUploadProgress: (progressEvent) => {
                    const progress = progressEvent.total
                        ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                        : 0;
                    setUploadProgress(progress);
                },
            });

            toast({
                title: 'Success',
                description: 'File uploaded successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
            onFileUpload();
        } catch (error) {
            toast({
                title: 'Error',
                description: 'Failed to upload file',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        } finally {
            setUploadProgress(null);
            setUploadingFile(null);
        }
    };

    const handleFileDelete = async (fileId: string) => {
        try {
            await axios.delete(`${API_URL}/delete-document/${fileId}`);
            onFileDelete();
            toast({
                title: 'Success',
                description: 'File deleted successfully',
                status: 'success',
                duration: 3000,
                isClosable: true,
            });
        } catch (error) {
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
            const response = await axios.get(`${API_URL}/download-document/${file.id}`, {
                responseType: 'blob',
            });

            // Crear el blob y URL
            const blob = new Blob([response.data]);
            const url = window.URL.createObjectURL(blob);

            // Crear y activar el enlace de descarga
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', file.file_name);
            document.body.appendChild(link);
            link.click();

            // Limpieza
            window.URL.revokeObjectURL(url);
            link.parentNode?.removeChild(link);
        } catch (error) {
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
        <VStack spacing={4} align="stretch">
            <Box
                border="2px dashed"
                borderColor={isDragging ? "blue.400" : "gray.200"}
                borderRadius="lg"
                p={8}
                bg={isDragging ? "blue.50" : "gray.50"}
                transition="all 0.2s"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleFileDrop}
            >
                <VStack spacing={2} align="center">
                    <Icon as={Upload} w={8} h={8} color={isDragging ? "blue.400" : "gray.400"} />
                    <Text color={isDragging ? "blue.600" : "gray.600"} fontWeight="medium">
                        {isDragging ? "Drop your file here" : "Drag and drop your files here"}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        or click to browse
                    </Text>
                    <input
                        type="file"
                        onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                        style={{ display: 'none' }}
                        id="file-upload"
                    />
                    <Button
                        as="label"
                        htmlFor="file-upload"
                        size="sm"
                        colorScheme="blue"
                        variant="outline"
                    >
                        Browse Files
                    </Button>
                </VStack>
            </Box>

            {uploadingFile && (
                <Box p={4} bg="gray.50" borderRadius="md">
                    <HStack justify="space-between" mb={2}>
                        <Text fontSize="sm">{uploadingFile}</Text>
                        <Text fontSize="sm" color="blue.500">{uploadProgress}%</Text>
                    </HStack>
                    <Progress value={uploadProgress || 0} size="sm" colorScheme="blue" />
                </Box>
            )}

            <List spacing={3}>
                {files.map((file) => (
                    <ListItem
                        key={file.id}
                        p={4}
                        bg="white"
                        borderWidth="1px"
                        borderRadius="lg"
                        shadow="sm"
                    >
                        <HStack justify="space-between">
                            <HStack spacing={3}>
                                <Icon as={FileText} color="blue.500" />
                                <VStack align="start" spacing={0}>
                                    <Text fontWeight="medium">{file.file_name}</Text>
                                    <Text fontSize="sm" color="gray.500">
                                        Modified: {new Date(file.last_modified).toLocaleString()}
                                    </Text>
                                </VStack>
                            </HStack>
                            <HStack>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    leftIcon={<Download size={16} />}
                                    onClick={() => handleDownloadFile(file)}
                                >
                                    Download
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    colorScheme="red"
                                    leftIcon={<Trash size={16} />}
                                    onClick={() => handleFileDelete(file.id)}
                                >
                                    Delete
                                </Button>
                            </HStack>
                        </HStack>
                    </ListItem>
                ))}
            </List>
        </VStack>
    );
}