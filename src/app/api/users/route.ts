// pages/api/route.ts
import type { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

const API_URL = process.env.API_URL_IA || 'https://orlandokuan.org';