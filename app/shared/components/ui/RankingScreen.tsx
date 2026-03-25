import { UserRank } from "@/shared/types/ranking";
import { useState, useRef, useEffect } from "react";
import { View, FlatList, RefreshControl, Text, Image, StyleSheet } from "react-native";
import { ProgressBar } from "react-native-paper";
import { MAX_SCORE } from "../../utils/constants";

const RankingScreen = () => {
    const [rankings, setRankings] = useState<UserRank[]>([]);
    const ws: any = useRef<WebSocket>(null);

    const fetchRankings = async () => {
        const response = await fetch('http://localhost:4000/ranking');
        const data = await response.json();
        setRankings(data);
    };

    useEffect(() => {
        ws.current = new WebSocket('http://localhost:4000');
        ws.current.onmessage = (e: any) => {
            const data = JSON.parse(e.data);
            if (data.type === 'rankingUpdate') {
                setRankings(data.payload);
            }
        };

        return () => ws.current?.close();
    }, []);

    const renderItem = ({ item }: any) => (
        <View style={styles.rankItem}>
            <Text style={styles.rankPosition}>#{item.position}</Text>
            <Image source={{ uri: item.avatar }} style={styles.avatar} />
            <View style={styles.userInfo}>
                <Text style={styles.username}>{item.username}</Text>
                <ProgressBar progress={item.score / MAX_SCORE} />
            </View>
            <Text style={styles.score}>{item.score} pts</Text>
        </View>
    );

    return (
        <FlatList
            data={rankings}
            renderItem={renderItem}
            keyExtractor={item => item.userId}
            refreshControl={<RefreshControl refreshing onRefresh={fetchRankings} />}
        />
    );
};


const styles = StyleSheet.create({
    rankItem: {

    },
    rankPosition: {

    },
    userInfo: {

    },
    username: {

    },
    score: {

    },
    avatar: {

    }
});
export default RankingScreen;

