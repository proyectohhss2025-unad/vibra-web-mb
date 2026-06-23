import React, { useState, useCallback, useEffect } from 'react';
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useTailwind } from 'tailwind-rn';
import { LinearGradient } from 'expo-linear-gradient';
import { showTamaguiAlert } from '@shared/components/ui/tamagui';
import TamaguiButton from '@shared/components/ui/tamagui/TamaguiButton';
import TamaguiInput from '@shared/components/ui/tamagui/TamaguiInput';
import usePasswordStrength from '@shared/hooks/usePasswordStrength';
import api from '@shared/services/api/api';
import useAuthContext from '@/context/AuthContext';
import useParticipant from '@/context/ParticipantContext';
import { maskFormatPhoneNumber, unmaskPhoneNumber } from '@shared/utils/number';
import * as ImagePicker from 'expo-image-picker';
import * as ImageManipulator from 'expo-image-manipulator';
import * as FileSystem from 'expo-file-system';

interface EditProfileModalProps {
  visible: boolean;
  onClose: () => void;
}

type TabType = 'datos' | 'avatar' | 'seguridad';

const GENDER_OPTIONS = [
  { label: 'Masculino', value: 'MALE' },
  { label: 'Femenino', value: 'FEMALE' },
  { label: 'Otro', value: 'OTHER' },
];

const EditProfileModal: React.FC<EditProfileModalProps> = ({
  visible,
  onClose,
}) => {
  const tailwind = useTailwind();
  const { user } = useAuthContext();
  const { participant, refreshParticipant } = useParticipant();

  const [activeTab, setActiveTab] = useState<TabType>('datos');
  const [saving, setSaving] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(false);

  const [name, setName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthDate, setBirthDate] = useState('');
  const [gender, setGender] = useState<'MALE' | 'FEMALE' | 'OTHER'>('MALE');
  const [nickname, setNickname] = useState('');
  const [avatar, setAvatar] = useState('');

  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');

  const initFields = useCallback(() => {
    if (participant && user) {
      setName(user.name || '');
      setPhoneNumber(maskFormatPhoneNumber(user.phoneNumber || ''));
      setBirthDate(
        user.birthDate
          ? new Date(user.birthDate).toISOString().split('T')[0]
          : '',
      );
      setGender(user.gender || 'MALE');
      setNickname(participant.nickname || '');
      setAvatar(participant.avatar || '');
    }
  }, [participant, user]);

  useEffect(() => {
    if (visible) initFields();
  }, [visible, initFields]);

  const handleSaveDatos = async () => {
    setSaving(true);
    try {
      if (user?._id || user?.sub) {
        await api.post('/api/users', {
          _id: user._id || user.sub,
          name,
          phoneNumber: unmaskPhoneNumber(phoneNumber),
          birthDate: birthDate ? new Date(birthDate).toISOString() : undefined,
          gender,
          avatar: avatar || undefined,
        });
      }
      if (participant?._id) {
        const updatePayload: Record<string, any> = { _id: participant._id, nickname };
        if (avatar) updatePayload.avatar = avatar;
        await api.post('/api/participants/update', updatePayload);
      }
      await refreshParticipant();
      showTamaguiAlert('Éxito', 'Datos actualizados correctamente');
      onClose();
    } catch (err: any) {
      showTamaguiAlert(
        'Error',
        err?.response?.data?.message || 'No se pudieron guardar los datos',
      );
    } finally {
      setSaving(false);
    }
  };

  const handleChangePassword = async () => {
    setPasswordError('');
    if (!currentPassword) {
      setPasswordError('Ingresa tu contraseña actual');
      return;
    }
    if (newPassword.length < 8) {
      setPasswordError('La nueva contraseña debe tener al menos 8 caracteres');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Las contraseñas no coinciden');
      return;
    }
    if (newPassword === currentPassword) {
      setPasswordError('La nueva contraseña no puede ser igual a la actual');
      return;
    }

    setLoadingPassword(true);
    try {
      await api.post('/api/auth/change-password', {
        currentPassword,
        newPassword,
      });
      showTamaguiAlert('Éxito', 'Contraseña actualizada correctamente');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setActiveTab('datos');
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || 'No se pudo cambiar la contraseña';
      if (msg.includes('incorrecta')) {
        setPasswordError('La contraseña actual es incorrecta');
      } else {
        showTamaguiAlert('Error', msg);
      }
    } finally {
      setLoadingPassword(false);
    }
  };

  const handleClose = () => {
    setActiveTab('datos');
    setPasswordError('');
    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
    onClose();
  };

  // ─── Pick & upload desde cámara/galería ─────────────────────────────
  const [uploadingAvatar, setUploadingAvatar] = useState(false);

  const pickAndUpload = async (useCamera: boolean) => {
    try {
      // Solicitar permisos
      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== 'granted') {
          showTamaguiAlert('Permiso denegado', 'Se necesita acceso a la cámara para tomar una foto.');
          return;
        }
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== 'granted') {
          showTamaguiAlert('Permiso denegado', 'Se necesita acceso a la galería para seleccionar una foto.');
          return;
        }
      }

      // Abrir cámara o galería
      const launcher = useCamera ? ImagePicker.launchCameraAsync : ImagePicker.launchImageLibraryAsync;
      const result = await launcher({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 1,
      });

      if (result.canceled || !result.assets?.[0]?.uri) return;
      const uri = result.assets[0].uri;

      setUploadingAvatar(true);

      // Comprimir con expo-image-manipulator
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 500 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG },
      );

      // Leer archivo comprimido como base64 para FormData
      const base64 = await FileSystem.readAsStringAsync(manipulated.uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      // Subir al backend
      const formData = new FormData();
      formData.append('file', {
        uri: Platform.OS === 'web' ? manipulated.uri : manipulated.uri,
        type: 'image/jpeg',
        name: `avatar-${Date.now()}.jpg`,
      } as any);

      const res = await api.post('/api/users/avatar/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
        timeout: 30000,
      });

      // Usar el fileId real retornado por el backend (GridFS fileId)
      const uploadedFileId = res.data?.avatar || res.data?.galleryItem?.src || '';
      showTamaguiAlert(
        'Éxito',
        uploadedFileId
          ? 'Foto de perfil actualizada correctamente'
          : 'Foto subida correctamente. Guarda los cambios para aplicarla.',
      );
      if (uploadedFileId) {
        setAvatar(uploadedFileId); // fileId real de GridFS
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || err?.message || 'Error al subir la imagen';
      showTamaguiAlert('Error', msg);
    } finally {
      setUploadingAvatar(false);
    }
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <LinearGradient
          colors={['#1a0a2e', '#0d1b2a']}
          style={StyleSheet.absoluteFill}
        />
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.center}
        >
          <View style={styles.card}>
            {/* Header */}
            <View style={styles.header}>
              <Text style={styles.headerTitle}>Editar Perfil</Text>
              <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
                <MaterialIcons name="close" size={22} color="#FFFFFF" />
              </TouchableOpacity>
            </View>

            {/* Tabs */}
            <View style={styles.tabRow}>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'datos' && styles.tabActive]}
                onPress={() => setActiveTab('datos')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'datos' && styles.tabTextActive,
                  ]}
                >
                  Datos
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.tab, activeTab === 'avatar' && styles.tabActive]}
                onPress={() => setActiveTab('avatar')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'avatar' && styles.tabTextActive,
                  ]}
                >
                  Avatar
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.tab,
                  activeTab === 'seguridad' && styles.tabActive,
                ]}
                onPress={() => setActiveTab('seguridad')}
              >
                <Text
                  style={[
                    styles.tabText,
                    activeTab === 'seguridad' && styles.tabTextActive,
                  ]}
                >
                  Seguridad
                </Text>
              </TouchableOpacity>
            </View>

            <ScrollView
              showsVerticalScrollIndicator={false}
              style={styles.scrollArea}
            >
              {activeTab === 'datos' && (
                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Nombre completo</Text>
                    <TamaguiInput
                      placeholder="Nombre"
                      value={name}
                      onChangeText={setName}
                      autoCapitalize="words"
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Teléfono</Text>
                    <TamaguiInput
                      placeholder="+57 (300) 123-4567"
                      value={phoneNumber}
                      onChangeText={(t) => setPhoneNumber(maskFormatPhoneNumber(t))}
                      keyboardType="phone-pad"
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Fecha de nacimiento</Text>
                    <TamaguiInput
                      placeholder="AAAA-MM-DD"
                      value={birthDate}
                      onChangeText={setBirthDate}
                      keyboardType="numbers-and-punctuation"
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Género</Text>
                    <View style={styles.genderRow}>
                      {GENDER_OPTIONS.map((opt) => {
                        const selected = gender === opt.value;
                        return (
                          <TouchableOpacity
                            key={opt.value}
                            onPress={() =>
                              setGender(
                                opt.value as 'MALE' | 'FEMALE' | 'OTHER',
                              )
                            }
                            style={[
                              styles.genderOption,
                              selected && styles.genderOptionSelected,
                            ]}
                          >
                            <Text
                              style={[
                                styles.genderText,
                                selected && styles.genderTextSelected,
                              ]}
                            >
                              {opt.label}
                            </Text>
                          </TouchableOpacity>
                        );
                      })}
                    </View>
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Nickname</Text>
                    <TamaguiInput
                      placeholder="Nickname público"
                      value={nickname}
                      onChangeText={setNickname}
                      autoCapitalize="none"
                    />
                  </View>

                  <View style={styles.buttonWrapper}>
                    <TamaguiButton
                      title={saving ? 'Guardando...' : 'Guardar cambios'}
                      variantColor="blue"
                      onPress={handleSaveDatos}
                      disabled={saving}
                      neonEffect={true}
                      icon={saving ? 'loading' : 'check'}
                    />
                  </View>
                </View>
              )}

              {activeTab === 'avatar' && (
                <View style={styles.form}>
                  <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 13, textAlign: 'center', marginBottom: 12 }}>
                    Toma una foto o selecciona de la galería
                  </Text>

                  {/* Botones de cámara y galería */}
                  <View style={{ flexDirection: 'row', gap: 10, marginBottom: 16 }}>
                    <TouchableOpacity
                      onPress={() => pickAndUpload(true)}
                      disabled={uploadingAvatar}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: 'rgba(99,102,241,0.15)',
                        borderWidth: 1,
                        borderColor: 'rgba(99,102,241,0.3)',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>📸</Text>
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                        {uploadingAvatar ? 'Subiendo...' : 'Tomar foto'}
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => pickAndUpload(false)}
                      disabled={uploadingAvatar}
                      style={{
                        flex: 1,
                        paddingVertical: 14,
                        borderRadius: 12,
                        backgroundColor: 'rgba(34,197,94,0.15)',
                        borderWidth: 1,
                        borderColor: 'rgba(34,197,94,0.3)',
                        alignItems: 'center',
                        gap: 4,
                      }}
                    >
                      <Text style={{ fontSize: 22 }}>🖼️</Text>
                      <Text style={{ color: '#FFFFFF', fontSize: 12, fontWeight: '600' }}>
                        {uploadingAvatar ? 'Subiendo...' : 'Galería'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <Text style={{ color: 'rgba(255,255,255,0.4)', fontSize: 11, textAlign: 'center', marginBottom: 12 }}>
                    O elige de los disponibles:
                  </Text>

                  <AvatarGalleryGrid
                    userAvatar={user?.avatar}
                    onSelect={(url) => {
                      setAvatar(url);
                      showTamaguiAlert('Avatar', 'Avatar seleccionado. Guarda los cambios para aplicarlo.');
                    }}
                  />
                </View>
              )}

              {activeTab === 'seguridad' && (
                <View style={styles.form}>
                  <View style={styles.field}>
                    <Text style={styles.label}>Contraseña actual</Text>
                    <TamaguiInput
                      placeholder="••••••••"
                      value={currentPassword}
                      onChangeText={(t) => {
                        setCurrentPassword(t);
                        setPasswordError('');
                      }}
                      secureTextEntry
                    />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Nueva contraseña</Text>
                    <TamaguiInput
                      placeholder="Mín. 8 caracteres"
                      value={newPassword}
                      onChangeText={(t) => {
                        setNewPassword(t);
                        setPasswordError('');
                      }}
                      secureTextEntry
                    />
                    <PasswordStrengthIndicator password={newPassword} />
                  </View>

                  <View style={styles.field}>
                    <Text style={styles.label}>Confirmar nueva contraseña</Text>
                    <TamaguiInput
                      placeholder="••••••••"
                      value={confirmPassword}
                      onChangeText={(t) => {
                        setConfirmPassword(t);
                        setPasswordError('');
                      }}
                      secureTextEntry
                    />
                  </View>

                  {passwordError ? (
                    <Text style={styles.errorText}>{passwordError}</Text>
                  ) : null}

                  <Text style={styles.hint}>
                    La nueva contraseña debe tener al menos 8 caracteres
                  </Text>

                  <View style={styles.buttonWrapper}>
                    <TamaguiButton
                      title={
                        loadingPassword
                          ? 'Cambiando...'
                          : 'Cambiar contraseña'
                      }
                      variantColor="blue"
                      onPress={handleChangePassword}
                      disabled={loadingPassword}
                      neonEffect={true}
                      icon={loadingPassword ? 'loading' : 'lock'}
                    />
                  </View>
                </View>
              )}
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
};

const PasswordStrengthIndicator = ({ password }: { password: string }) => {
  const strength = usePasswordStrength(password);

  if (!password) return null;

  return (
    <View style={{ marginTop: 6 }}>
      <View style={{ height: 4, backgroundColor: 'rgba(255,255,255,0.1)', borderRadius: 2, overflow: 'hidden' }}>
        <View
          style={{
            height: '100%',
            width: `${strength.barPercent}%`,
            backgroundColor: strength.color,
            borderRadius: 2,
          }}
        />
      </View>
      {strength.label ? (
        <Text style={{ color: strength.color, fontSize: 11, fontWeight: '600', marginTop: 3 }}>
          {strength.label}
        </Text>
      ) : null}
    </View>
  );
};

// ═════════════════════════════════════════════════════════════════════════
//  Avatar Gallery Grid (embebido)
// ═════════════════════════════════════════════════════════════════════════

const PRESET_AVATARS = [
  'default-avatar.svg', '01.svg', '02.svg', '03.jpg', '04.jpg',
  '05.jpg', '06.jpg', '07.jpg', '08.jpg', '09.jpg',
];

// URL base desde la instancia axios centralizada (config/env.json)
const API_BASE = api.defaults.baseURL || 'http://localhost:4000';

interface AvatarGalleryGridProps {
  userAvatar?: string;
  onSelect: (url: string) => void;
}

const AvatarGalleryGrid: React.FC<AvatarGalleryGridProps> = ({ userAvatar, onSelect }) => {
  const [gallery, setGallery] = useState<{ id: string; type: string; src: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [active, setActive] = useState<string>(userAvatar || '');

  useEffect(() => {
    const loadGallery = async () => {
      try {
        const res = await api.get('/api/users/avatar/gallery');
        setGallery(res.data?.gallery || []);
        setActive(res.data?.activeAvatar || userAvatar || '');
      } catch {
        // Fallback: mostrar solo presets
        setGallery(PRESET_AVATARS.map((src) => ({ id: src, type: 'preset', src })));
      } finally {
        setLoading(false);
      }
    };
    loadGallery();
  }, []);

  const getUrl = (item: { type: string; src: string }) => {
    if (item.type === 'upload') return `${API_BASE}/api/users/avatar/stream/${item.src}`;
    return `${API_BASE}/avatars/${item.src}`;
  };

  const presets = gallery.filter((i) => i.type === 'preset');
  const uploads = gallery.filter((i) => i.type === 'upload');

  if (loading) {
    return <ActivityIndicator color="#FFFFFF" style={{ marginVertical: 20 }} />;
  }

  return (
    <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 280 }}>
      {/* Prediseñados */}
      <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>
        Prediseñados
      </Text>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
        {presets.map((item) => {
          const isActive = item.src === active;
          return (
            <TouchableOpacity
              key={item.id}
              onPress={() => {
                setActive(item.src);
                onSelect(item.src);
              }}
              style={{
                width: 56, height: 56, borderRadius: 28,
                borderWidth: 2,
                borderColor: isActive ? '#FBBF24' : 'rgba(255,255,255,0.15)',
                backgroundColor: 'rgba(255,255,255,0.08)',
                alignItems: 'center', justifyContent: 'center',
                overflow: 'hidden',
              }}
            >
              <Image source={{ uri: getUrl(item) }} style={{ width: 48, height: 48, borderRadius: 24 }} />
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Subidas */}
      {uploads.length > 0 && (
        <>
          <Text style={{ color: 'rgba(255,255,255,0.5)', fontSize: 11, fontWeight: '600', marginBottom: 6, textTransform: 'uppercase' }}>
            Mis subidas
          </Text>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8 }}>
            {uploads.map((item) => {
              const isActive = item.src === active;
              return (
                <TouchableOpacity
                  key={item.id}
                  onPress={() => {
                    setActive(item.src);
                    onSelect(item.src);
                  }}
                  style={{
                    width: 56, height: 56, borderRadius: 28,
                    borderWidth: 2,
                    borderColor: isActive ? '#FBBF24' : 'rgba(255,255,255,0.15)',
                    backgroundColor: 'rgba(255,255,255,0.08)',
                    alignItems: 'center', justifyContent: 'center',
                    overflow: 'hidden',
                  }}
                >
                  <Image source={{ uri: getUrl(item) }} style={{ width: 48, height: 48, borderRadius: 24 }} />
                </TouchableOpacity>
              );
            })}
          </View>
        </>
      )}

      {uploads.length === 0 && (
        <Text style={{ color: 'rgba(255,255,255,0.3)', fontSize: 12, textAlign: 'center', marginTop: 8 }}>
          Sube imágenes desde la web para verlas aquí
        </Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    width: '100%',
    maxWidth: 380,
    maxHeight: '85%',
    backgroundColor: 'rgba(255,255,255,0.08)',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(255,255,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabRow: {
    flexDirection: 'row',
    backgroundColor: 'rgba(255,255,255,0.06)',
    borderRadius: 12,
    padding: 3,
    marginBottom: 16,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  tabActive: {
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  tabText: {
    fontSize: 13,
    fontWeight: '600',
    color: 'rgba(255,255,255,0.4)',
  },
  tabTextActive: {
    color: '#FFFFFF',
  },
  scrollArea: {
    maxHeight: 420,
  },
  form: {
    gap: 14,
  },
  field: {
    gap: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.7)',
    marginLeft: 4,
  },
  genderRow: {
    flexDirection: 'row',
    gap: 8,
  },
  genderOption: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
    backgroundColor: 'rgba(255,255,255,0.05)',
    alignItems: 'center',
  },
  genderOptionSelected: {
    borderColor: 'rgba(255,255,255,0.5)',
    backgroundColor: 'rgba(255,255,255,0.15)',
  },
  genderText: {
    fontSize: 12,
    fontWeight: '500',
    color: 'rgba(255,255,255,0.5)',
  },
  genderTextSelected: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  avatarPreview: {
    marginTop: 6,
    alignItems: 'center',
  },
  avatarImage: {
    width: 48,
    height: 48,
    borderRadius: 24,
  },
  buttonWrapper: {
    marginTop: 4,
  },
  errorText: {
    color: '#f87171',
    fontSize: 13,
    textAlign: 'center',
    fontWeight: '500',
  },
  hint: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: 11,
    textAlign: 'center',
  },
});

export default EditProfileModal;
