import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_URL_IA || 'https://orlandokuan.org';

export async function POST(request: Request) {
    try {
        const body = await request.json();
        const { name, group_id } = body;
        console.log('Received registration request:', { name, group_id });

        const response = await axios.post(`${API_URL}/users`, {
            name,
            group_id,
        });

        console.log('API response:', response.data);
        return NextResponse.json(response.data, { status: 200 });
    } catch (error) {
        console.error('Error registering user:', error);
        return NextResponse.json({ message: 'Error registering user' }, { status: 500 });
    }
}