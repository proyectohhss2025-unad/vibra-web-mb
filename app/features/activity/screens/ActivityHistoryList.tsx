import SearchInput from '@/shared/components/ui/SearchInput';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { useTailwind } from 'tailwind-rn';
import EmotionBadge from '../components/EmotionBadge';
import useActivities from '../hooks/activity';

const ActivityHistoryList = () => {
    const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isError, error, isLoading } = useActivities();
    const activities = data?.docs.flatMap((page: any) => page) || [];
    const responses = data?.userResponse.flatMap((item: any) => item) || [];
    const tailwind = useTailwind();
    const [filteredEvents, setFilteredEvents] = useState<Activity[]>(activities);

    if (isLoading) {
        return (
            <View style={tailwind("flex-1 justify-center items-center")}>
                <ActivityIndicator size="large" />
            </View>
        );
    }

    if (isError) {
        return (
            <View style={tailwind("flex-1 justify-center items-center")}>
                <Text style={tailwind("text-red-500")}>Error: {error?.message || 'Something went wrong'}</Text>
            </View>
        );
    }

    return (
        <View style={{ marginHorizontal: 20 }} >
            <SearchInput
                data={activities}
                onSearch={setFilteredEvents}
                searchKey="title"
                placeholder="Buscar actividad..."
                containerStyle={{ backgroundColor: '#ffffff', borderRadius: 10, top: -10 }}
            />
            <FlatList
                data={filteredEvents.length > 0 ? filteredEvents : activities}
                keyExtractor={item => item._id}
                renderItem={({ item }) => (
                    <TouchableOpacity style={tailwind("p-4 bg-white mb-2 rounded-lg shadow-sm")}>
                        <View style={tailwind("flex-row justify-between items-center")}>
                            <EmotionBadge emotion={item.emotion?.name} />
                            <Text style={tailwind("text-gray-500")}>{new Date(item.createdAt).toLocaleDateString()}</Text>
                        </View>
                        <Text style={tailwind("text-lg font-semibold mt-2")}>{item.title}</Text>
                        <View style={tailwind("flex-row mt-2")}>
                            <Text style={tailwind("text-blue-500")}>{item.resources.length} {item.resources.length === 1 ? 'recurso' : 'recursos'} </Text>
                            <Text style={tailwind("ml-4 text-green-600")}>{item.questions.length} {item.questions.length === 1 ? 'pregunta' : 'preguntas'}</Text>
                        </View>
                    </TouchableOpacity>
                )}
                onEndReached={() => hasNextPage && fetchNextPage()}
                onEndReachedThreshold={0.5}
                ListFooterComponent={() => isFetchingNextPage && <ActivityIndicator />}
            />
        </View>
    );
};

export default ActivityHistoryList;