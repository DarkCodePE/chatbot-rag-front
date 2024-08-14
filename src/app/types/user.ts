// types/user.ts

export interface User {
    id: string;
    name: string;
    group_id: string;
    session_id: string;
}

export interface UserResponse extends User {}

export interface UserCreate {
    name: string;
    group_id: string;
}