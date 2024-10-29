// types/user.ts

export interface User {
    id: string;
    name: string;
    email: string;
    group_id?: string;
    session_id: string;
    chat_status?: string;
    created_at?: string;
    updated_at?: string;
}

export interface Course {
    id: string;
    name: string;
    google_drive_folder_id: string;
    created_at?: string;
    updated_at?: string;
    users?: User[];
}

export interface UserResponse extends User {}

export interface UserCreate {
    name: string;
    group_id: string;
}