import React, { useState } from 'react';
import { ActivityIndicator, Text, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import type { ActivityHistoryEntry } from '../_hooks/useProfileData';

interface ActivityChartProps {
  history: ActivityHistoryEntry[];
  isLoading: boolean;
}

const DAYS_SHORT = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];

const ActivityChart: React.FC<ActivityChartProps> = ({ history, isLoading }) => {
  const tailwind = useTailwind();
  const [showDays, setShowDays] = useState(7);

  const filtered = history.slice(-showDays);
  const maxCount = Math.max(1, ...filtered.map((h) => h.count));

  if (isLoading) {
    return (
      <View style={tailwind('mx-4 mb-4 p-4 bg-white rounded-xl shadow-sm items-center')}>
        <ActivityIndicator size="small" color="#6366f1" />
      </View>
    );
  }

  return (
    <View style={tailwind('mx-4 mb-4 p-4 bg-white rounded-xl shadow-sm')}>
      <View style={tailwind('flex-row justify-between items-center mb-3')}>
        <Text style={tailwind('text-sm font-semibold text-gray-600')}>
          📊 Actividades completadas
        </Text>
        {/* Selector 7/30 días */}
        <View style={tailwind('flex-row')}>
          <TouchableOpacity
            onPress={() => setShowDays(7)}
            style={[
              tailwind('px-3 py-1 rounded-l-full'),
              showDays === 7 ? tailwind('bg-indigo-500') : tailwind('bg-gray-200'),
            ]}
          >
            <Text style={showDays === 7 ? tailwind('text-white text-xs') : tailwind('text-gray-600 text-xs')}>
              7d
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowDays(30)}
            style={[
              tailwind('px-3 py-1 rounded-r-full'),
              showDays === 30 ? tailwind('bg-indigo-500') : tailwind('bg-gray-200'),
            ]}
          >
            <Text style={showDays === 30 ? tailwind('text-white text-xs') : tailwind('text-gray-600 text-xs')}>
              30d
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Gráfico de barras */}
      <View style={tailwind('flex-row items-end h-24 gap-[2px]')}>
        {filtered.map((entry, i) => {
          const height = (entry.count / maxCount) * 80;
          const isToday = i === filtered.length - 1;
          const date = new Date(entry.date);
          const dayName = DAYS_SHORT[date.getDay()];

          return (
            <View key={entry.date} style={tailwind('flex-1 items-center')}>
              <View
                style={{
                  width: '80%',
                  height: Math.max(4, height),
                  backgroundColor: isToday ? '#6366f1' : '#a5b4fc',
                  borderRadius: 4,
                  opacity: entry.count > 0 ? 1 : 0.3,
                }}
              />
              {showDays <= 14 && (
                <Text style={tailwind('text-[8px] text-gray-400 mt-1')}>
                  {dayName}
                </Text>
              )}
            </View>
          );
        })}
      </View>

      {filtered.length === 0 && (
        <Text style={tailwind('text-center text-gray-400 text-sm py-4')}>
          No hay actividades registradas en este período
        </Text>
      )}
    </View>
  );
};

export default ActivityChart;
