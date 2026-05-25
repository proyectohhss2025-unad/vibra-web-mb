import React, { useState, useEffect, useRef } from 'react';
import { View, StyleSheet, TouchableOpacity, ActivityIndicator, Text, Platform } from 'react-native';
import { Video, Audio } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import Slider from '@react-native-community/slider';

import { useKeepAwake } from 'expo-keep-awake';
import { Resource } from '@/shared/types/activity';
import { useVideoPlayer, VideoView } from 'expo-video';
import { showTamaguiAlert } from '@/shared/components/ui/tamagui';

interface MediaPlayerProps {
    resource: Resource;
    onComplete: () => void;
}

const KeepAwakeActivator: React.FC = () => {
    if (Platform.OS === 'web') return null;
    useKeepAwake();
    return null;
};

const MediaPlayer: React.FC<MediaPlayerProps> = ({ resource, onComplete }) => {
    const [selectedMedia, setSelectedMedia] = useState<any>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const videoRef = useRef<Video>(null);
    const [status, setStatus] = useState<{
        isPlaying: boolean;
        positionMillis: number;
        durationMillis: number;
        didJustFinish: boolean;
    } | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isFullscreen, setIsFullscreen] = useState(false);

    const handleSelectMedia = (item: any) => {
        setSelectedMedia({
            ...item,
            source: item.url,
        })
        setIsPlaying(true);
    };

    const handleEnd = () => {
        setIsPlaying(false);
    };

    useEffect(() => {
        const loadMedia = async () => {
            try {
                setIsLoading(true);

                console.log('resource:', resource);
                handleSelectMedia(resource);
                if (resource.type === 'video') {
                    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
                    await videoRef.current?.loadAsync({ uri: resource.url });
                    // return () => videoRef.current?.unloadAsync();
                } else {
                    await Audio.setAudioModeAsync({ playsInSilentModeIOS: true });
                    const { sound } = await Audio.Sound.createAsync(
                        { uri: resource.url ?? '' },
                        { shouldPlay: false },
                        onPlaybackStatusUpdate
                    );
                    return () => sound.unloadAsync();
                }
            } catch (error) {
                showTamaguiAlert('Error', 'No se pudo cargar el recurso multimedia');
            } finally {
                setIsLoading(false);
            }
        };

        loadMedia();

        return () => {
            if (resource?.type === 'video') {
                videoRef.current?.unloadAsync();
            }
        };
    }, [resource?.url]);

    const onPlaybackStatusUpdate = (status: any) => {
        setStatus(status);
        if (status.didJustFinish) {
            onComplete();
        }
    };

    const handlePlayPause = async () => {
        if (!status) return;

        if (status.isPlaying) {
            resource?.type === 'video'
                ? await videoRef.current?.pauseAsync()
                : () => { } //await Audio.pauseAsync();
        } else {
            resource?.type === 'video'
                ? await videoRef.current?.playAsync()
                : () => { } // await Audio.playAsync();
        }
    };

    const handleSeek = async (value: number) => {
        if (resource?.type === 'video') {
            await videoRef.current?.setPositionAsync(value);
        } else {
            //await Audio.setPositionAsync(value);
        }
    };

    const toggleFullscreen = async () => {
        if (!videoRef.current) return;

        if (isFullscreen) {
            await videoRef.current.dismissFullscreenPlayer();
        } else {
            await videoRef.current.presentFullscreenPlayer();
        }
        setIsFullscreen(!isFullscreen);
    };

    const formatTime = (millis: number) => {
        const minutes = Math.floor(millis / 60000);
        const seconds = ((millis % 60000) / 1000).toFixed(0);
        return `${minutes}:${Number.parseInt(seconds) < 10 ? '0' : ''}${seconds}`;
    };

    const player = useVideoPlayer(selectedMedia?.source, player => {
        player.loop = false;
        isPlaying ? player.play() : player.pause();
    })

    if (isLoading) {
        return (
            <View style={[styles.container, styles.loadingContainer]}>
                <ActivityIndicator size="large" color="#fff" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <KeepAwakeActivator />
            {resource?.type === 'video' ? (<>
                {/*<Video
                    ref={videoRef}
                    style={styles.media}
                    useNativeControls={false}
                    //resizeMode=""
                    onPlaybackStatusUpdate={onPlaybackStatusUpdate}
                    onFullscreenUpdate={toggleFullscreen}
                />*/}
                <VideoView
                    style={styles.media}
                    player={player}
                    allowsFullscreen
                    allowsPictureInPicture
                />
            </>
            ) : (
                <View style={styles.audioContainer}>
                    <Ionicons name="musical-notes" size={80} color="white" />
                </View>
            )}

            {false && <View style={styles.controls}>
                <TouchableOpacity onPress={handlePlayPause} style={styles.playButton}>
                    <Ionicons
                        name={status?.isPlaying ? 'pause' : 'play'}
                        size={32}
                        color="white"
                    />
                </TouchableOpacity>

                <Slider
                    style={styles.slider}
                    minimumValue={0}
                    maximumValue={status?.durationMillis ?? 0}
                    value={status?.positionMillis ?? 0}
                    onSlidingComplete={handleSeek}
                    minimumTrackTintColor="#FFFFFF"
                    maximumTrackTintColor="rgba(255, 255, 255, 0.5)"
                    thumbTintColor="#FFFFFF"
                    disabled={isLoading}
                />

                <View style={styles.timeContainer}>
                    <Text style={styles.timeText}>
                        {formatTime(status?.positionMillis ?? 0)}
                    </Text>
                    <Text style={styles.timeText}>
                        {formatTime(status?.durationMillis ?? 0)}
                    </Text>
                </View>

                {resource?.type === 'video' && (
                    <TouchableOpacity onPress={toggleFullscreen} style={styles.fullscreenButton}>
                        <Ionicons
                            name={isFullscreen ? 'contract' : 'expand'}
                            size={24}
                            color="white"
                        />
                    </TouchableOpacity>
                )}
            </View>}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: 'black',
        borderRadius: 12,
        overflow: 'hidden',
        height: 800,
    },
    media: {
        flex: 1,
        height: '100%',
    },
    audioContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#2a2a2a',
    },
    controls: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        padding: 16,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
    },
    playButton: {
        alignSelf: 'center',
        marginBottom: 16,
    },
    slider: {
        width: '100%',
        height: 40,
    },
    timeContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 8,
    },
    timeText: {
        color: 'white',
        fontSize: 12,
    },
    fullscreenButton: {
        position: 'absolute',
        top: 16,
        right: 16,
    },
    loadingContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export default MediaPlayer;