import React, { useState, useRef } from 'react';
import { View, TextInput, StyleSheet, Animated, ViewStyle, TextStyle } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';

interface SearchInputProps<T> {
    data: T[];
    onSearch: (results: T[]) => void;
    searchKey: keyof T;
    placeholder?: string;
    containerStyle?: ViewStyle;
    inputStyle?: TextStyle;
}

function SearchInput<T>({
    data,
    onSearch,
    searchKey,
    placeholder = 'Search...',
    containerStyle,
    inputStyle
}: SearchInputProps<T>) {
    const [searchText, setSearchText] = useState('');
    const iconAnimation = useRef(new Animated.Value(1)).current;

    const handleSearch = (text: string) => {
        setSearchText(text);

        // Trigger animation when text is entered
        if (text.length > 0) {
            Animated.sequence([
                Animated.timing(iconAnimation, {
                    toValue: 1.2,
                    duration: 200,
                    useNativeDriver: true
                }),
                Animated.timing(iconAnimation, {
                    toValue: 1,
                    duration: 200,
                    useNativeDriver: true
                })
            ]).start();

            // Filter the data array
            const filteredResults = data.filter(item =>
                String(item[searchKey])
                    .toLowerCase()
                    .includes(text.toLowerCase())
            );
            onSearch(filteredResults);
        } else {
            onSearch(data); // Reset to original data when search is empty
        }
    };

    return (
        <View style={[styles.container, containerStyle]}>
            <Animated.View style={[{
                transform: [{ scale: iconAnimation }]
            }]}>
                <MaterialIcons
                    name="search"
                    size={24}
                    color="#666666"
                    style={styles.searchIcon}
                />
            </Animated.View>
            <TextInput
                style={[styles.input, inputStyle]}
                value={searchText}
                onChangeText={handleSearch}
                placeholder={placeholder}
                placeholderTextColor="#999999"
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#FFFFFF',
        borderRadius: 10,
        paddingHorizontal: 15,
        marginVertical: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 3.84,
    },
    searchIcon: {
        marginRight: 10,
    },
    input: {
        flex: 1,
        paddingVertical: 12,
        fontSize: 16,
        color: '#333333',
        paddingStart: 10
    },
});

export default SearchInput;