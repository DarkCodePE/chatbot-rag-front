// app/register/page.tsx
'use client'
import { useRouter } from 'next/navigation'
import { UserRegistration } from "@/app/components/UserRegistration";
import {ChakraProvider} from "@chakra-ui/react";


export default function RegisterPage() {
    const router = useRouter()

    const handleRegistrationSuccess = (user: { name: string, group_id: string }) => {
        console.log('User registered:', user)
        router.push('/dashboard')
    }

    return (
        <UserRegistration onRegistrationSuccess={handleRegistrationSuccess}/>
    )
}