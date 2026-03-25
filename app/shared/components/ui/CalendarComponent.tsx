import React, { useState } from 'react';
import { Text, View } from 'react-native';
import { Calendar, LocaleConfig } from 'react-native-calendars';
import { useTailwind } from 'tailwind-rn';

LocaleConfig.locales['es'] = {
    monthNames: [
        'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
    ],
    monthNamesShort: [
        'Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'
    ],
    dayNames: [
        'Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'
    ],
    dayNamesShort: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
    today: 'Hoy',
};

LocaleConfig.defaultLocale = 'es';

const CalendarComponent = () => {
    const tailwind = useTailwind();
    const [selectedDate, setSelectedDate] = useState<string | null>(null);

    const handleDayPress = (day: { dateString: string }) => {
        setSelectedDate(day.dateString);
    };

    return (
        <View style={tailwind('p-4 bg-white rounded-lg shadow-sm')}>
            <Text style={tailwind('text-xl font-bold mb-4 text-gray-800')}>
                Selecciona una fecha
            </Text>

            <Calendar
                onDayPress={handleDayPress}
                markedDates={{
                    [selectedDate ?? '']: { selected: true, selectedColor: '#3B82F6' },
                }}
                theme={{
                    backgroundColor: '#ffffff',
                    calendarBackground: '#ffffff',
                    textSectionTitleColor: '#6B7280',
                    selectedDayBackgroundColor: '#3B82F6',
                    selectedDayTextColor: '#ffffff',
                    todayTextColor: '#3B82F6',
                    dayTextColor: '#1F2937',
                    textDisabledColor: '#D1D5DB',
                    dotColor: '#3B82F6',
                    selectedDotColor: '#ffffff',
                    arrowColor: '#3B82F6',
                    monthTextColor: '#1F2937',
                    indicatorColor: '#3B82F6',
                    textDayFontFamily: 'Inter',
                    textMonthFontFamily: 'Inter',
                    textDayHeaderFontFamily: 'Inter',
                    textDayFontSize: 14,
                    textMonthFontSize: 16,
                    textDayHeaderFontSize: 12,
                }}
            />

            {selectedDate && (
                <View style={tailwind('mt-4 p-3 bg-blue-50 rounded-lg')}>
                    <Text style={tailwind('text-blue-700 font-medium')}>
                        Fecha seleccionada: {selectedDate}
                    </Text>
                </View>
            )}
        </View>
    );
};

export default CalendarComponent;