// frontend/src/app/api/ask/route.ts
import { NextResponse } from 'next/server';
import axios from 'axios';

const API_URL = process.env.API_URL_IA || 'http://104.130.168.24:30007';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const response = await axios.post(`${API_URL}/ask`, body);
    return NextResponse.json(response.data);
  } catch (error) {
    console.error('Error:', error);

    return NextResponse.json({ error: error }, { status: 500 });
  }

}