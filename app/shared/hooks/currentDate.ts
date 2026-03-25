import { useState, useEffect } from 'react';

const useCurrentDate = () => {
    const [currentDate, setCurrentDate] = useState<string>('');

    useEffect(() => {
        const updateDate = () => {
            const date = new Date();
            const options: Intl.DateTimeFormatOptions = {
                weekday: 'long',
                year: 'numeric',
                month: 'long',
                day: 'numeric'
            };

            const formattedDate = date.toLocaleDateString('es-ES', options);
            const finalDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
            setCurrentDate(finalDate);
        };

        updateDate();
        const interval = setInterval(updateDate, 60000);

        return () => clearInterval(interval);
    }, []);

    return currentDate;
};

export default useCurrentDate;
