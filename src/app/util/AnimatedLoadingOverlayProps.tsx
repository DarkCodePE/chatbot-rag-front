import React, { useState, useEffect } from 'react';
import { Box, VStack, Text } from '@chakra-ui/react';
import Image from 'next/image';

interface AnimatedLoadingOverlayProps {
    isVisible: boolean;
}

const AnimatedLoadingOverlay: React.FC<AnimatedLoadingOverlayProps> = ({ isVisible }) => {
    const [stage, setStage] = useState(1);
    const [message, setMessage] = useState('Enviando información...');

    useEffect(() => {
        if (isVisible) {
            // Reiniciar estados cuando se muestra el overlay
            setStage(1);
            setMessage('Enviando Pregunta...');

            // Secuencia de cambios de etapa
            const stage2 = setTimeout(() => {
                setStage(2);
                setMessage('Creando la session de chat...');
            }, 2000);

            const stage3 = setTimeout(() => {
                setStage(3);
                setMessage('Generando repuesta...');
            }, 4000);

            return () => {
                clearTimeout(stage2);
                clearTimeout(stage3);
            };
        }
    }, [isVisible]);

    if (!isVisible) return null;

    const getCurrentGif = () => {
        switch (stage) {
            case 1:
                return '/images/enviadoInformacion.gif';
            case 2:
                return '/images/generandoRespuesta.gif';
            case 3:
                return '/images/obteniendoDatos.gif';
            default:
                return '/images/enviadoInformacion.gif';
        }
    };

    return (
        <Box
            position="fixed"
            top="0"
            left="0"
            right="0"
            bottom="0"
            bg="rgba(0, 0, 0, 0.8)"
            display="flex"
            alignItems="center"
            justifyContent="center"
            zIndex="modal"
            backdropFilter="blur(4px)"
        >
            <VStack spacing={6} bg="gray.800" p={8} borderRadius="xl" boxShadow="2xl">
                <Box
                    position="relative"
                    width="300px"
                    height="200px"
                    borderRadius="md"
                    overflow="hidden"
                >
                    <Image
                        src={getCurrentGif()}
                        alt="Loading animation"
                        layout="fill"
                        objectFit="cover"
                    />
                </Box>
                <Text
                    color="white"
                    fontSize="xl"
                    fontWeight="medium"
                    textAlign="center"
                >
                    {message}
                </Text>
            </VStack>
        </Box>
    );
};

export default AnimatedLoadingOverlay;