import { FlatList, Text } from 'react-native';

const data = Array.from({ length: 1000 }, (_, i) => ({ id: i, text: `Elemento ${i}` }));

const FlatListComponente = () => (
    <FlatList
        data={data}
        renderItem={({ item }) => <Text>{item.text}</Text>}
        keyExtractor={item => item.id.toString()}
        initialNumToRender={10} // Elementos a renderizar inicialmente
        windowSize={5} // Número de "pantallas" a mantener en memoria (por defecto: 21)
        getItemLayout={(data, index) => (
            { length: 50, offset: 50 * index, index } // Acelera el scroll con elementos de altura fija
        )}
    />
);

export default FlatListComponente;