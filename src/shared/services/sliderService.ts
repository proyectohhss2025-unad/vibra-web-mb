// Servicio para gestionar los datos del slider de cards

export interface SliderCard {
    id: number;
    title: string;
    description: string;
    bannerImage: any; // Ruta de la imagen del banner
    backgroundColor: string;
    buttonText?: string;
    buttonLink?: string;
}

// Datos de ejemplo para el slider
const sliderData: SliderCard[] = [
    {
        id: 1,
        title: 'Bienestar Emocional',
        description: 'Descubre cómo mejorar tu bienestar emocional con nuestras actividades diarias.',
        bannerImage: require('@assets/sponsors/menu_emotions.png'),
        backgroundColor: '#0066FF',
        buttonText: 'Explorar',
        buttonLink: '/features/activity/screens/emotion'
    },
    {
        id: 2,
        title: 'Retos Semanales',
        description: 'Participa en nuestros retos semanales y aumenta tu nivel de Vibra.',
        bannerImage: require('@assets/sponsors/menu_emotions.png'),
        backgroundColor: '#6600CC',
        buttonText: 'Participar',
        buttonLink: '/features/(tabs)/two'
    },
    {
        id: 3,
        title: 'Consejos Diarios',
        description: 'Recibe consejos diarios para mantener un equilibrio emocional saludable.',
        bannerImage: require('@assets/sponsors/menu_emotions.png'),
        backgroundColor: '#FFCC00',
        buttonText: 'Ver consejos',
        buttonLink: '/features/(tabs)/three'
    }
];

export const getSliderData = () => {
    return sliderData;
};

export const getSliderCardById = (id: number) => {
    return sliderData.find(card => card.id === id);
};