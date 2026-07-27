import React, { useState } from 'react';
import {
    Modal,
    View,
    Text,
    TextInput,
    TouchableOpacity,
    KeyboardAvoidingView,
    Platform,
    StyleSheet,
    ActivityIndicator,
} from 'react-native';
import api from '../../services/api/api';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface FeedbackModalProps {
    visible: boolean;
    initialType: 'improvement' | 'support';
    onClose: () => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ visible, initialType, onClose }) => {
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const insets = useSafeAreaInsets();

    const isImprovement = initialType === 'improvement';

    const handleSubmit = async () => {
        if (!title.trim() || !description.trim()) return;
        setSubmitting(true);
        try {
            await api.post('/api/feedback', {
                title: title.trim(),
                description: description.trim(),
                isFeature: isImprovement,
                isSupport: !isImprovement,
                createdBy: 'mobile-user',
            });
            setTitle('');
            setDescription('');
            onClose();
            alert('✅ Feedback enviado correctamente');
        } catch (error: any) {
            alert(error?.response?.data?.message || 'Error al enviar feedback');
        } finally {
            setSubmitting(false);
        }
    };

    return (
        <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
            <KeyboardAvoidingView
                style={styles.overlay}
                behavior={Platform.OS === 'ios' ? 'padding' : undefined}
            >
                <TouchableOpacity style={styles.overlayTouch} activeOpacity={1} onPress={onClose}>
                    <TouchableOpacity activeOpacity={1} onPress={() => {}} style={[styles.card, { paddingTop: insets.top + 16 }]}>
                        {/* Header */}
                        <View style={styles.header}>
                            <Text style={styles.headerIcon}>{isImprovement ? '✨' : '💬'}</Text>
                            <Text style={styles.headerTitle}>
                                {isImprovement ? 'Sugerir mejora' : 'Enviar apoyo'}
                            </Text>
                            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
                                <Text style={styles.closeBtnText}>✕</Text>
                            </TouchableOpacity>
                        </View>

                        {/* Form */}
                        <View style={styles.form}>
                            <Text style={styles.label}>Título</Text>
                            <TextInput
                                style={styles.input}
                                value={title}
                                onChangeText={setTitle}
                                placeholder="¿Qué te gustaría sugerir?"
                                placeholderTextColor="#9CA3AF"
                            />

                            <Text style={styles.label}>Descripción</Text>
                            <TextInput
                                style={[styles.input, styles.textArea]}
                                value={description}
                                onChangeText={setDescription}
                                placeholder="Cuéntanos más detalles..."
                                placeholderTextColor="#9CA3AF"
                                multiline
                                numberOfLines={4}
                                textAlignVertical="top"
                            />

                            <View style={styles.typeRow}>
                                <Text style={styles.typeLabel}>Tipo:</Text>
                                <View style={[styles.typeBadge, isImprovement ? styles.badgeBlue : styles.badgeGreen]}>
                                    <Text style={[styles.typeBadgeText, isImprovement ? styles.badgeBlueText : styles.badgeGreenText]}>
                                        {isImprovement ? '✨ Mejora' : '💬 Apoyo'}
                                    </Text>
                                </View>
                            </View>

                            <View style={styles.buttons}>
                                <TouchableOpacity style={styles.cancelBtn} onPress={onClose}>
                                    <Text style={styles.cancelBtnText}>Cancelar</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={[styles.submitBtn, (!title.trim() || !description.trim()) && styles.submitBtnDisabled]}
                                    onPress={handleSubmit}
                                    disabled={submitting || !title.trim() || !description.trim()}
                                >
                                    {submitting ? (
                                        <ActivityIndicator color="#fff" size="small" />
                                    ) : (
                                        <Text style={styles.submitBtnText}>💾 Enviar</Text>
                                    )}
                                </TouchableOpacity>
                            </View>
                        </View>
                    </TouchableOpacity>
                </TouchableOpacity>
            </KeyboardAvoidingView>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: { flex: 1 },
    overlayTouch: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
    card: {
        backgroundColor: '#fff',
        borderRadius: 20,
        overflow: 'hidden',
        maxHeight: '90%',
    },
    header: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingHorizontal: 20,
        paddingBottom: 16,
        borderBottomWidth: 1,
        borderBottomColor: '#E5E7EB',
    },
    headerIcon: { fontSize: 22, marginRight: 8 },
    headerTitle: { flex: 1, fontSize: 18, fontWeight: '600', color: '#111827' },
    closeBtn: { width: 28, height: 28, borderRadius: 14, backgroundColor: '#F3F4F6', alignItems: 'center', justifyContent: 'center' },
    closeBtnText: { fontSize: 14, color: '#6B7280', fontWeight: '600' },
    form: { padding: 20, gap: 16 },
    label: { fontSize: 13, fontWeight: '500', color: '#374151', marginBottom: -8 },
    input: {
        borderWidth: 1,
        borderColor: '#D1D5DB',
        borderRadius: 10,
        padding: 12,
        fontSize: 15,
        color: '#111827',
        backgroundColor: '#F9FAFB',
    },
    textArea: { minHeight: 100 },
    typeRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
    typeLabel: { fontSize: 12, color: '#9CA3AF', letterSpacing: 0.5, textTransform: 'uppercase' },
    typeBadge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 20 },
    badgeBlue: { backgroundColor: '#DBEAFE' },
    badgeGreen: { backgroundColor: '#D1FAE5' },
    typeBadgeText: { fontSize: 13, fontWeight: '600' },
    badgeBlueText: { color: '#1D4ED8' },
    badgeGreenText: { color: '#065F46' },
    buttons: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 8 },
    cancelBtn: { paddingHorizontal: 20, paddingVertical: 12, borderRadius: 10, backgroundColor: '#F3F4F6' },
    cancelBtnText: { fontSize: 15, fontWeight: '500', color: '#374151' },
    submitBtn: { paddingHorizontal: 24, paddingVertical: 12, borderRadius: 10, backgroundColor: '#4F46E5', minWidth: 100, alignItems: 'center' },
    submitBtnDisabled: { opacity: 0.5 },
    submitBtnText: { fontSize: 15, fontWeight: '600', color: '#fff' },
});

export default FeedbackModal;
