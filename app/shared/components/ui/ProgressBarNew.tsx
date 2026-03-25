import React from 'react';
import { View, Text } from 'react-native';
import { useTailwind } from 'tailwind-rn';

const ProgressBarII = ({ total, current }: any) => {

    const tailwind = useTailwind();
    const progress = ((current / total) * 100) || 0;

    return (
        <View style={tailwind("mb-4 mx-4")}>
            <View style={tailwind("w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner")}>
                <View
                    style={[{ width: `${progress}%` }, tailwind("h-full bg-blue-500 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 transition-all duration-300 ease-in-out")]}
                />
            </View>
            <Text style={tailwind("text-sm text-gray-600 mt-2 text-center")}>
                Pregunta {current + 1} de {total + 1}
            </Text>
        </View>
    );
};

export default ProgressBarII;