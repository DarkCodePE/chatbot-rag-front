// frontend/src/app/api/feedback/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';
const API_URL = process.env.API_URL_IA || 'http://104.130.168.24:30007';
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await axios.post(`${API_URL}/feedback`, body);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error:', error);
    if (axios.isAxiosError(error)) {
      console.error('Response data:', error.response?.data);
      console.error('Response status:', error.response?.status);
    }
    return NextResponse.json({ error: 'An error occurred while submitting feedback' }, { status: 500 });
  }
}