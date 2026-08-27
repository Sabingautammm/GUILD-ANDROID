import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Avatar } from '../components/Avatar';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { Camera, X, File, Loader, RefreshCw, ChevronRight } from 'lucide-react-native';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../context/AuthContext';
import { getMedia, uploadMedia, applyToGuild } from '../services/guild';
import { theme } from '../theme';

interface MediaItem {
  _id: string;
  url: string;
  type: 'image' | 'video';
  category: string;
  approvalStatus?: string;
}

export function GalleryScreen() {
  const { isAuthenticated, membership } = useAuth();
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<any>(null);
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState('');
  const [rejectedMedia, setRejectedMedia] = useState<MediaItem[]>([]);
  const [uploadedAt, setUploadedAt] = useState(0);

  const loadData = async () => {
    try {
      setRefreshing(true);
      setError(null);
      const data = await getMedia({ limit: 20 });
      setMedia(Array.isArray(data) ? data : []);
    } catch (err: any) {
      setError(err?.message || 'Could not load gallery.');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [uploadedAt]);

  const onRefresh = () => loadData();

  const openPicker = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: false,
      quality: 0.8,
    });

    if (!result.canceled && result.assets?.[0]) {
      const asset = result.assets[0];
      const isVideo = asset.mimeType?.startsWith('video/');
      setSelectedFile({
        uri: asset.uri,
        name: asset.fileName,
        type: asset.mimeType,
        size: asset.fileSize,
        isVideo,
      });
      setUploadError('');
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a photo or video.');
      return;
    }
    setUploadError('');
    setUploading(true);

    try {
      const formData = new FormData();
      formData.append('file', {
        uri: selectedFile.uri,
        type: selectedFile.type,
        name: selectedFile.name || 'media',
      } as any);

      await uploadMedia(formData);
      setShowUpload(false);
      setUploadedAt(Date.now());
      setSelectedFile(null);
    } catch (err: any) {
      setUploadError(err?.message || 'Upload failed.');
    } finally {
      setUploading(false);
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <ActivityIndicator size="large" color={theme.colors.gold} />
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.center}>
          <X size={48} color={theme.colors.gold} />
          <Text style={styles.errorText}>{error}</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.title}>Gallery</Text>
          <Text style={styles.subtitle}>Photos and videos from the community.</Text>
        </View>
        {isAuthenticated && (
          <Button
            title="Upload"
            variant="gold"
            size="sm"
            icon={<Camera size={14} />}
            onPress={() => setShowUpload(true)}
          />
        )}
      </View>

      {media.length === 0 ? (
        <View style={styles.center}>
          <Camera size={48} color={theme.colors.textDim} />
          <Text style={styles.emptyText}>No media yet. Uploaded media appears after admin approval.</Text>
        </View>
      ) : (
        <FlatList
          contentContainerStyle={styles.listContent}
          data={media}
          keyExtractor={(item) => item._id}
          numColumns={2}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.mediaCell}
              activeOpacity={0.9}
              onPress={() => {}}
            >
              {item.type === 'video' ? (
                <View style={styles.videoPlaceholder}>
                  <Text style={styles.videoIcon}>▶</Text>
                </View>
              ) : (
                <Image
                  source={{ uri: item.url }}
                  style={styles.mediaImage}
                  resizeMode="cover"
                />
              )}
              {item.approvalStatus === 'rejected' && (
                <View style={styles.rejectedBadge}>
                  <Text style={styles.rejectedText}>Rejected</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={theme.colors.gold}
            />
          }
        />
      )}

      <Modal
        visible={showUpload}
        transparent
        animationType="fade"
        onRequestClose={() => setShowUpload(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={() => setShowUpload(false)}
        >
          <TouchableOpacity style={styles.modalContent} activeOpacity={1}>
            <Text style={styles.modalTitle}>Upload media</Text>

            {!selectedFile ? (
              <TouchableOpacity style={styles.uploadDropzone} onPress={openPicker}>
                <Camera size={32} color={theme.colors.gold} />
                <Text style={styles.uploadText}>Choose photo or video</Text>
                <Text style={styles.uploadHint}>JPG, PNG, WEBP · MP4, WEBM, MOV (up to 50 MB)</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.previewContainer}>
                {selectedFile.isVideo ? (
                  <VideoPreview uri={selectedFile.uri} />
                ) : (
                  <Image source={{ uri: selectedFile.uri }} style={styles.previewImage} resizeMode="contain" />
                )}
                <View style={styles.previewFooter}>
                  <Text style={styles.fileName}>{selectedFile.name || 'media'}</Text>
                  <Button
                    title="Change"
                    variant="secondary"
                    size="sm"
                    onPress={() => setSelectedFile(null)}
                  />
                </View>
              </View>
            )}

            {uploadError && <Text style={styles.errorText}>{uploadError}</Text>}

            <View style={styles.modalActions}>
              <Button
                title="Cancel"
                variant="secondary"
                size="md"
                onPress={() => setShowUpload(false)}
                disabled={uploading}
              />
              <Button
                title={uploading ? 'Uploading…' : 'Upload'}
                variant="gold"
                size="md"
                loading={uploading}
                onPress={handleUpload}
                disabled={!selectedFile}
              />
            </View>
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </SafeAreaView>
  );
}

function VideoPreview({ uri }: { uri: string }) {
  return null; // In production, use a real video component
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.bg,
  },
  center: {
    flex: 1,
    backgroundColor: theme.colors.bg,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: theme.colors.border,
  },
  headerLeft: {
    flex: 1,
  },
  title: {
    color: theme.colors.text,
    fontSize: 20,
    fontWeight: '900',
  },
  subtitle: {
    color: theme.colors.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  listContent: {
    padding: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  mediaCell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    backgroundColor: theme.colors.surface,
    marginRight: theme.spacing.sm,
    position: 'relative',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  videoPlaceholder: {
    width: '100%',
    height: '100%',
    backgroundColor: theme.colors.surfaceAlt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  videoIcon: {
    color: theme.colors.gold,
    fontSize: 32,
  },
  rejectedBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: theme.colors.danger + 'CC',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: theme.radius.sm,
  },
  rejectedText: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
  },
  emptyText: {
    color: theme.colors.textDim,
    fontSize: 14,
    textAlign: 'center',
    marginTop: theme.spacing.md,
    lineHeight: 20,
  },
  errorText: {
    color: theme.colors.danger,
    fontSize: 12,
    textAlign: 'center',
    marginVertical: theme.spacing.sm,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: theme.colors.overlay,
    alignItems: 'center',
    justifyContent: 'center',
    padding: theme.spacing.lg,
  },
  modalContent: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: theme.colors.bgElevated,
    borderRadius: theme.radius.xl,
    borderWidth: 1,
    borderColor: theme.colors.border,
    padding: theme.spacing.lg,
    gap: theme.spacing.md,
  },
  modalTitle: {
    color: theme.colors.text,
    fontSize: 18,
    fontWeight: '800',
    textAlign: 'center',
  },
  uploadDropzone: {
    borderStyle: 'dashed',
    borderWidth: 2,
    borderColor: theme.colors.borderHover,
    borderRadius: theme.radius.lg,
    padding: theme.spacing.xxl,
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  uploadText: {
    color: theme.colors.text,
    fontSize: 14,
    fontWeight: '700',
  },
  uploadHint: {
    color: theme.colors.textDim,
    fontSize: 11,
    textAlign: 'center',
  },
  previewContainer: {
    borderRadius: theme.radius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  previewImage: {
    width: '100%',
    height: 200,
  },
  previewFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.md,
    backgroundColor: theme.colors.surface,
  },
  fileName: {
    color: theme.colors.text,
    fontSize: 12,
    fontWeight: '700',
    flex: 1,
    marginRight: theme.spacing.sm,
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.sm,
    paddingTop: theme.spacing.sm,
  },
});