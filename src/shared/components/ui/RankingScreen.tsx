import { UserRank } from "@/shared/types/ranking";
import { useState, useRef, useEffect } from "react";
import { View, FlatList, RefreshControl, Text, Image, StyleSheet } from "react-native";
import { ProgressBar } from "react-native-paper";
import { MAX_SCORE } from "../../utils/constants";
import io from 'socket.io-client';

const SOCKET_URL = typeof window !== 'undefined' ? window.location.origin : '';

const RankingScreen = () => {
    const [rankings, setRankings] = useState<UserRank[]>([]);
    const socketRef: any = useRef(null);

    const fetchRankings = async () => {
        const response = await fetch('/api/rankings/general');
        const data = await response.json();
        setRankings(data);
    };

    useEffect(() => {
        const socket = io(SOCKET_URL, { transports: ['polling', 'websocket'] });
        socketRef.current = socket;

        socket.on('connect', () => {
            socket.emit('joinRankingRoom');
        });

        socket.on('rankingsUpdate', (data: UserRank[]) => {
            setRankings(data);
        });

        socket.on('initialRankings', (data: UserRank[]) => {
            setRankings(data);
        });

        return () => { socket.disconnect(); };
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
            keyExtractor={(item, index) => `${item.userId}-${index}`}
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