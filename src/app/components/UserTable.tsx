import React, { useState, useEffect } from 'react';
import { Table, Thead, Tbody, Tr, Th, Td, TableCaption, TableContainer, Button, useToast } from '@chakra-ui/react';
import axios from 'axios';

interface User {
    id: string;
    name: string;
    group_id: string;
    session_id: string;
}

export function UserTable() {
    const [users, setUsers] = useState<User[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const toast = useToast();

    const fetchUsers = async () => {
        setIsLoading(true);
        try {
            const response = await axios.get('/api/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Error fetching users:', error);
            toast({
                title: 'Error',
                description: 'Failed to fetch users',
                status: 'error',
                duration: 3000,
                isClosable: true,
            });
        }
        setIsLoading(false);
    };

    useEffect(() => {
        fetchUsers();
    }, []);

    return (
        <TableContainer>
            <Table variant="simple">
                <TableCaption>Users List</TableCaption>
                <Thead>
                    <Tr>
                        <Th>ID</Th>
                        <Th>Name</Th>
                        <Th>Group ID</Th>
                        <Th>Session ID</Th>
                    </Tr>
                </Thead>
                <Tbody>
                    {users.map((user) => (
                        <Tr key={user.id}>
                            <Td>{user.id}</Td>
                            <Td>{user.name}</Td>
                            <Td>{user.group_id}</Td>
                            <Td>{user.session_id}</Td>
                        </Tr>
                    ))}
                </Tbody>
            </Table>
            <Button onClick={fetchUsers} isLoading={isLoading} mt={4}>
                Refresh Users
            </Button>
        </TableContainer>
    );
}