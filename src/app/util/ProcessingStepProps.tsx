import React, { useState, useEffect } from 'react';
import {
    Box,
    VStack,
    HStack,
    Text,
    Progress,
    useToken
} from '@chakra-ui/react';
import {
    Brain,
    MessageCircle,
    Database,
    Sparkles,
    CheckCircle2
} from 'lucide-react';

interface ProcessingStepProps {
    icon: React.ReactNode;
    title: string;
    description: string;
    isActive: boolean;
    isCompleted: boolean;
}

interface ProcessingStep {
    id: string;
    icon: React.ReactNode;
    title: string;
    description: string;
    estimatedTime?: number; // tiempo estimado en milisegundos
}

const ProcessingStep: React.FC<ProcessingStepProps> = ({
                                                           icon,
                                                           title,
                                                           description,
                                                           isActive,
                                                           isCompleted
                                                       }) => {
    const [blue500] = useToken('colors', ['blue.500']);

    return (
        <HStack
            spacing={4}
            opacity={isActive || isCompleted ? 1 : 0.5}
            transition="all 0.3s ease"
        >
            <Box
                p={2}
                borderRadius="full"
                bg={isCompleted ? 'green.500' : (isActive ? 'blue.500' : 'gray.500')}
                color="white"
                transition="all 0.3s ease"
            >
                {isCompleted ? <CheckCircle2 size={24} /> : icon}
            </Box>
            <VStack align="start" spacing={0}>
                <Text
                    fontSize="lg"
                    fontWeight="bold"
                    color={isCompleted ? 'green.500' : (isActive ? 'blue.500' : 'gray.500')}
                >
                    {title}
                </Text>
                <Text fontSize="sm" color="gray.500">
                    {description}
                </Text>
            </VStack>
        </HStack>
    );
};

interface ProcessingChatOverlayProps {
    isVisible: boolean;
    onComplete?: () => void;
    progress?: number; // Agregar esta línea
    response?: any;    // Agregar esta línea si vas a usar la prop response
}

const ProcessingChatOverlay: React.FC<ProcessingChatOverlayProps> = ({
                                                                         isVisible,
                                                                         onComplete,
                                                                         response
                                                                     }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [progress, setProgress] = useState(0);
    const [stepProgress, setStepProgress] = useState<{[key: string]: number}>({});

    const steps: ProcessingStep[] = [
        {
            id: 'process',
            icon: <MessageCircle size={24} />,
            title: "Procesando pregunta",
            description: "Analizando tu consulta para mejor comprensión",
            estimatedTime: 1000
        },
        {
            id: 'search',
            icon: <Database size={24} />,
            title: "Buscando información",
            description: "Recopilando datos relevantes de la base de conocimiento",
            estimatedTime: 2000
        },
        {
            id: 'generate',
            icon: <Brain size={24} />,
            title: "Generando respuesta",
            description: "Elaborando una respuesta precisa y contextualizada",
            estimatedTime: 3000
        },
        {
            id: 'optimize',
            icon: <Sparkles size={24} />,
            title: "Optimizando resultado",
            description: "Refinando y organizando la información",
            estimatedTime: 1000
        }
    ];

    const totalEstimatedTime = steps.reduce((acc, step) => acc + (step.estimatedTime || 0), 0);

    useEffect(() => {
        if (!isVisible) {
            setCurrentStep(0);
            setProgress(0);
            setStepProgress({});
            return;
        }

        const startTime = Date.now();
        let animationFrame: number;

        const updateProgress = () => {
            const currentTime = Date.now();
            const elapsedTime = currentTime - startTime;

            // Calcular el progreso basado en el tiempo real de respuesta
            const responseProgress = response?.progress || 0;
            const timeBasedProgress = Math.min((elapsedTime / totalEstimatedTime) * 100, 100);

            // Usar el mayor valor entre el progreso real y el basado en tiempo
            const currentProgress = Math.max(responseProgress, timeBasedProgress);

            setProgress(currentProgress);

            // Calcular en qué paso estamos basado en el progreso
            const currentStepIndex = Math.floor((currentProgress / 100) * steps.length);
            setCurrentStep(Math.min(currentStepIndex, steps.length - 1));

            // Actualizar el progreso individual de cada paso
            const newStepProgress = {...stepProgress};
            for (let i = 0; i < steps.length; i++) {
                if (i < currentStepIndex) {
                    newStepProgress[steps[i].id] = 100;
                } else if (i === currentStepIndex) {
                    const stepProgress = ((currentProgress % (100 / steps.length)) / (100 / steps.length)) * 100;
                    newStepProgress[steps[i].id] = Math.min(stepProgress, 100);
                } else {
                    newStepProgress[steps[i].id] = 0;
                }
            }
            setStepProgress(newStepProgress);

            if (currentProgress < 100) {
                animationFrame = requestAnimationFrame(updateProgress);
            } else if (onComplete) {
                onComplete();
            }
        };

        animationFrame = requestAnimationFrame(updateProgress);

        return () => {
            if (animationFrame) {
                cancelAnimationFrame(animationFrame);
            }
        };
    }, [isVisible, response, totalEstimatedTime, onComplete]);

    useEffect(() => {
        setCurrentStep(Math.floor((progress / 100) * steps.length));
    }, [progress]);

    if (!isVisible) return null;

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.85)"
            backdropFilter="blur(8px)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="modal"
        >
            <VStack
                bg="white"
                p={8}
                borderRadius="2xl"
                spacing={6}
                maxW="600px"
                w="90%"
                position="relative"
                boxShadow="2xl"
            >
                <Progress
                    value={progress}
                    size="xs"
                    width="100%"
                    colorScheme="blue"
                    borderRadius="full"
                    isAnimated
                    hasStripe
                />

                <VStack spacing={6} width="100%" align="stretch">
                    {steps.map((step, index) => (
                        <ProcessingStep
                            key={index}
                            icon={step.icon}
                            title={step.title}
                            description={step.description}
                            isActive={index === currentStep}
                            isCompleted={index < currentStep}
                        />
                    ))}
                </VStack>
            </VStack>
        </Box>
    );
};

export default ProcessingChatOverlay;