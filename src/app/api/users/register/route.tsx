// pages/api/users/register.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = process.env.API_URL || 'http://localhost:8000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method === 'POST') {
        try {
            const { name, group_id } = req.body;
            const response = await axios.post(`${API_URL}/users/register`, {
                name,
                group_id,
            });
            res.status(200).json(response.data);
        } catch (error) {
            console.error('Error registering user:', error);
            res.status(500).json({ message: 'Error registering user' });
        }
    } else {
        res.setHeader('Allow', ['POST']);
        res.status(405).json({ message: `Method ${req.method} Not Allowed` });
    }
}