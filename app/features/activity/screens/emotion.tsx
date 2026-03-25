import React from 'react';
import { SafeAreaView, StatusBar, StyleSheet, View } from 'react-native';
import ReproductorMedia from '../../../shared/components/media/ReproductorMedia';
import ActivityHistoryList from './ActivityHistoryList';
import DailyActivityScreen from './DailyActivityScreen';

interface EmotionScreenProps {
    //
}

export const EmotionScreen: React.FC<EmotionScreenProps> = () => {
    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="dark-content" />
            <View style={styles.content}>
                {false && <ReproductorMedia />}
                <DailyActivityScreen />
                {false && <ActivityHistoryList />}
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    content: {
        flex: 1,
        padding: 2,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        marginTop: 32,
    },
});

export default EmotionScreen;
