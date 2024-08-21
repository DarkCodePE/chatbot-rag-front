'use client';
import { ChakraProvider } from '@chakra-ui/react';
import { Dashboard } from '@/app/components/Dashboard';

export default function Home() {
  return (
      <ChakraProvider>
        <Dashboard />
      </ChakraProvider>
  );
}