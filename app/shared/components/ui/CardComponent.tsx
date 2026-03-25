import useUser from '@/context/UserContext';
import ActivityHistoryList from '@/features/activity/screens/ActivityHistoryList';
import useCurrentDate from '@/shared/hooks/currentDate';
import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import ProgressBarVibra from './ProgressBar';

const CardComponent = ({ emotion }: any) => {
  const { user } = useUser();
  const tailwind = useTailwind();
  const currentDate = useCurrentDate();
  const [historyActivate, setHistoryActivate] = React.useState(false);

  return (
    <View style={tailwind('w-full p-2 bg-white rounded-lg shadow-sm dark:bg-white')}>
      {!historyActivate && <>
        <View style={{ alignItems: 'center', padding: 10 }}>
          <Text style={tailwind('text-xl font-bold text-gray-600 mb-4')}>
            {currentDate}
          </Text>
          {/*<Image
            source={require('../../../assets/sponsors/menu_emotions.png')}
            style={[{ width: 200, height: 200 }, tailwind('align-center text-gray-500 dark:text-gray-400 mb-3 justify-center')]}
          />*/}
        </View>
        <Text style={tailwind('font-bold text-lg text-gray-500 dark:text-gray-400 px-4')}>Hola {user.username}</Text>
        <Text style={tailwind('mb-3 font-normal text-lg text-gray-500 dark:text-gray-400 p-4')}>
          ¿Que tal tu dia! Enseñanos tus emociones y asi podemos ayudarte a equilibrarte.
        </Text>
        <ProgressBarVibra />
      </>
      }
    </View>
  );
};


const styles = StyleSheet.create({
  scrollView: {
    backgroundColor: '#EAEAEA',
    padding: 4,
    borderColor: 'transparent',
  },
  gameContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 16,
    marginVertical: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  gameTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 8,
  },
  gameDescription: {
    fontSize: 14,
    color: '#666',
    marginBottom: 16,
  },
  box: {
    width: 50,
    height: 50,
    backgroundColor: 'tomato',
    borderRadius: 4,
  },
});

export default CardComponent;