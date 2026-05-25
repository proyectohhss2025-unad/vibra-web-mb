import React from 'react';
import { Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';

interface StreakCalendarProps {
  currentStreak: number;
  maxStreak: number;
  activityDates: string[]; // array de fechas "YYYY-MM-DD" con actividad
}

const DAYS_OF_WEEK = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

const StreakCalendar: React.FC<StreakCalendarProps> = ({
  currentStreak,
  maxStreak,
  activityDates,
}) => {
  const tailwind = useTailwind();

  // Generar últimos 30 días
  const today = new Date();
  const days: { date: string; day: number; isActive: boolean; isToday: boolean }[] = [];

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(date.getDate() - i);
    const dateStr = date.toISOString().split('T')[0];
    days.push({
      date: dateStr,
      day: date.getDate(),
      isActive: activityDates.includes(dateStr),
      isToday: i === 0,
    });
  }

  // Agrupar en filas de 7 días
  const weeks: typeof days[] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  return (
    <View style={tailwind('mx-4 mb-4 p-4 bg-white rounded-xl shadow-sm')}>
      {/* Encabezado */}
      <View style={tailwind('flex-row justify-between items-center mb-3')}>
        <Text style={tailwind('text-sm font-semibold text-gray-600')}>
          🔥 Racha
        </Text>
        <View style={tailwind('flex-row')}>
          <Text style={tailwind('text-sm text-gray-500 mr-3')}>
            Actual: <Text style={tailwind('font-bold text-indigo-600')}>{currentStreak}</Text>
          </Text>
          <Text style={tailwind('text-sm text-gray-500')}>
            Récord: <Text style={tailwind('font-bold text-yellow-600')}>{maxStreak}</Text>
          </Text>
        </View>
      </View>

      {/* Días de la semana (encabezados) */}
      <View style={tailwind('flex-row mb-1')}>
        {DAYS_OF_WEEK.map((d, i) => (
          <View key={i} style={tailwind('flex-1 items-center')}>
            <Text style={tailwind('text-[10px] text-gray-400')}>{d}</Text>
          </View>
        ))}
      </View>

      {/* Grid de días */}
      {weeks.map((week, wi) => (
        <View key={wi} style={tailwind('flex-row')}>
          {week.map((day) => (
            <View key={day.date} style={tailwind('flex-1 items-center py-1')}>
              <View
                style={[
                  tailwind('w-7 h-7 rounded-full items-center justify-center'),
                  day.isToday && tailwind('border-2 border-indigo-500'),
                  day.isActive ? tailwind('bg-indigo-500') : tailwind('bg-gray-100'),
                ]}
              >
                <Text
                  style={[
                    tailwind('text-xs'),
                    day.isActive ? tailwind('text-white font-medium') : tailwind('text-gray-400'),
                  ]}
                >
                  {day.day}
                </Text>
              </View>
            </View>
          ))}
        </View>
      ))}
    </View>
  );
};

export default StreakCalendar;
