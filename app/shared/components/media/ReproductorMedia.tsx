import React, { useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { useVideoPlayer, VideoView } from 'expo-video';

const mediaItems = [
    {
        id: '1123456789',
        title: 'Video 1',
        source: require('../../../assets/videos/video.mp4'),
        type: 'video'
    },
    {
        id: '12341234',
        title: 'Video 2',
        source: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4',
        type: 'video'
    },
    {
        id: '1237654',
        title: 'Audio 3',
        source: require('../../../assets/videos/audio.mp3'),
        type: 'audio'
    }
];

const ReproductorMedia = () => {
    const [selectedMedia, setSelectedMedia] = useState<any>(null);
    const [modalVisible, setModalVisible] = useState(false);
    const [isPlaying, setIsPlaying] = useState(false);

    const handleSelectMedia = (item: any) => {
        setSelectedMedia(item);
        setModalVisible(true);
        setIsPlaying(true);
    };

    const handleEnd = () => {
        setIsPlaying(false);
    };

    const player = useVideoPlayer(selectedMedia?.source, player => {
        player.loop = false;
        isPlaying ? player.play() : player.pause();
    })

    return (
        <View style={styles.container}>
            <FlatList
                style={{ height: '100%', width: '100%' }}
                data={mediaItems}
                keyExtractor={item => item.id}
                renderItem={({ item }: any) => (
                    <TouchableOpacity style={styles.item} onPress={() => handleSelectMedia(item)}>
                        <Text style={styles.title}>{item.title}</Text>
                    </TouchableOpacity>
                )}
            />

            <Modal
                visible={modalVisible}
                animationType="slide"
                onRequestClose={() => {
                    setModalVisible(false);
                    setIsPlaying(false);
                }}
            >
                <View style={styles.modalContainer}>
                    <Text style={styles.header}>{selectedMedia?.title}</Text>
                    {selectedMedia && (
                        <VideoView
                            style={styles.media}
                            player={player}
                            allowsFullscreen
                            allowsPictureInPicture
                        />
                    )}
                    <View style={styles.infoContainer}>
                        <Text style={styles.infoText}>Reproduciendo: {isPlaying ? 'Sí' : 'No'}</Text>
                    </View>
                    <TouchableOpacity
                        onPress={() => {
                            setModalVisible(false);
                            setIsPlaying(false);
                        }}
                        style={styles.closeButton}
                    >
                        <Text style={styles.closeText}>Cerrar</Text>
                    </TouchableOpacity>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        height: '100%',
    },
    item: {
        padding: 15,
        borderBottomWidth: 1,
        borderColor: '#ccc'
    },
    title: {
        fontSize: 18,
        color: '#333'
    },
    modalContainer: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 20,
        justifyContent: 'center',
        alignItems: 'center',
        width: '100%',
        height: '100%'
    },
    header: {
        fontSize: 22,
        fontWeight: 'bold',
        marginBottom: 15
    },
    media: {
        width: '100%',
        height: 300,
        backgroundColor: '#000',
        marginVertical: 20
    },
    infoContainer: {
        marginTop: 10
    },
    infoText: {
        fontSize: 16,
        color: '#555'
    },
    closeButton: {
        marginTop: 20,
        paddingVertical: 10,
        paddingHorizontal: 20,
        backgroundColor: '#007AFF',
        borderRadius: 5
    },
    closeText: {
        color: '#fff',
        fontSize: 16
    }
});

export default ReproductorMedia;