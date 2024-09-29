// app/Providers.tsx
'use client';

import { ChakraProvider } from "@chakra-ui/react";
import customTheme from "@/app/theme";

interface ProvidersProps {
    children: React.ReactNode;
}

export function Providers({ children }: ProvidersProps) {
    return (
        <ChakraProvider theme={customTheme}>
            {children}
        </ChakraProvider>
    );
}
