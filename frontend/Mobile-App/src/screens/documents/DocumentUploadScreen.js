import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  Alert,
  Image,
  FlatList,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

import { colors, typography, spacing, borderRadius } from '../../constants/theme';

const DocumentUploadScreen = ({ navigation }) => {
  const { t } = useTranslation();
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const mediaPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (cameraPermission.status !== 'granted' || mediaPermission.status !== 'granted') {
      Alert.alert(
        'Permissions Required',
        'This app needs camera and media library permissions to upload documents.',
        [{ text: 'OK' }]
      );
    }
  };

  const takePhoto = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newDocument = {
          id: Date.now().toString(),
          uri: result.assets[0].uri,
          type: 'image',
          name: `Document_${Date.now()}.jpg`,
          uploaded: false,
        };
        setDocuments(prev => [...prev, newDocument]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to take photo');
    }
  };

  const pickFromGallery = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
        allowsMultipleSelection: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newDocuments = result.assets.map((asset, index) => ({
          id: (Date.now() + index).toString(),
          uri: asset.uri,
          type: 'image',
          name: `Document_${Date.now() + index}.jpg`,
          uploaded: false,
        }));
        setDocuments(prev => [...prev, ...newDocuments]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const pickDocument = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: ['application/pdf', 'image/*'],
        multiple: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const newDocuments = result.assets.map((asset, index) => ({
          id: (Date.now() + index).toString(),
          uri: asset.uri,
          type: asset.mimeType?.includes('pdf') ? 'pdf' : 'image',
          name: asset.name,
          size: asset.size,
          uploaded: false,
        }));
        setDocuments(prev => [...prev, ...newDocuments]);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to pick document');
    }
  };

  const removeDocument = (id) => {
    setDocuments(prev => prev.filter(doc => doc.id !== id));
  };

  const uploadDocuments = async () => {
    if (documents.length === 0) {
      Alert.alert('No Documents', 'Please add documents to upload');
      return;
    }

    setUploading(true);
    try {
      // Simulate upload process
      for (let i = 0; i < documents.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 1000));
        setDocuments(prev => prev.map(doc => 
          doc.id === documents[i].id ? { ...doc, uploaded: true } : doc
        ));
      }
      
      Alert.alert('Success', 'All documents uploaded successfully!');
    } catch (error) {
      Alert.alert('Upload Failed', 'Some documents failed to upload');
    } finally {
      setUploading(false);
    }
  };

  const renderDocument = ({ item }) => (
    <View style={styles.documentItem}>
      <View style={styles.documentInfo}>
        {item.type === 'image' ? (
          <Image source={{ uri: item.uri }} style={styles.documentThumbnail} />
        ) : (
          <View style={styles.pdfThumbnail}>
            <Ionicons name="document-text" size={32} color={colors.primary} />
          </View>
        )}
        
        <View style={styles.documentDetails}>
          <Text style={styles.documentName} numberOfLines={2}>
            {item.name}
          </Text>
          {item.size && (
            <Text style={styles.documentSize}>
              {(item.size / (1024 * 1024)).toFixed(2)} MB
            </Text>
          )}
          <View style={styles.documentStatus}>
            <Ionicons
              name={item.uploaded ? 'checkmark-circle' : 'time'}
              size={16}
              color={item.uploaded ? colors.success : colors.warning}
            />
            <Text style={[
              styles.statusText,
              { color: item.uploaded ? colors.success : colors.warning }
            ]}>
              {item.uploaded ? 'Uploaded' : 'Pending'}
            </Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.removeButton}
        onPress={() => removeDocument(item.id)}
      >
        <Ionicons name="close-circle" size={24} color={colors.error} />
      </TouchableOpacity>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <Text style={styles.title}>Upload Documents</Text>
          <Text style={styles.subtitle}>
            Add your required documents for faster processing
          </Text>
        </View>

        <View style={styles.actionButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={takePhoto}>
            <Ionicons name="camera" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>{t('takePhoto')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={pickFromGallery}>
            <Ionicons name="images" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>{t('chooseFromGallery')}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.actionButton} onPress={pickDocument}>
            <Ionicons name="document-text" size={24} color={colors.primary} />
            <Text style={styles.actionButtonText}>Pick Document</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.documentsSection}>
          <Text style={styles.sectionTitle}>
            Selected Documents ({documents.length})
          </Text>
          
          {documents.length > 0 ? (
            <FlatList
              data={documents}
              renderItem={renderDocument}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="document-outline" size={64} color={colors.textSecondary} />
              <Text style={styles.emptyStateText}>No documents selected</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the buttons above to add documents
              </Text>
            </View>
          )}
        </View>

        <View style={styles.requirementsSection}>
          <Text style={styles.sectionTitle}>Document Requirements</Text>
          
          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.requirementText}>
              Images should be clear and well-lit
            </Text>
          </View>

          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.requirementText}>
              File size should be less than 10MB
            </Text>
          </View>

          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.requirementText}>
              Supported formats: JPG, PNG, PDF
            </Text>
          </View>

          <View style={styles.requirement}>
            <Ionicons name="checkmark-circle" size={16} color={colors.success} />
            <Text style={styles.requirementText}>
              All text should be clearly readable
            </Text>
          </View>
        </View>
      </ScrollView>

      {documents.length > 0 && (
        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.uploadButton, uploading && styles.uploadButtonDisabled]}
            onPress={uploadDocuments}
            disabled={uploading}
          >
            <Text style={styles.uploadButtonText}>
              {uploading ? 'Uploading...' : `Upload ${documents.length} Document${documents.length > 1 ? 's' : ''}`}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: spacing.md,
  },
  header: {
    paddingVertical: spacing.lg,
  },
  title: {
    ...typography.h2,
    color: colors.text,
    marginBottom: spacing.sm,
  },
  subtitle: {
    ...typography.body,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  actionButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.xl,
  },
  actionButton: {
    flex: 1,
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    paddingVertical: spacing.lg,
    alignItems: 'center',
    marginHorizontal: spacing.xs,
    borderWidth: 1,
    borderColor: colors.border,
  },
  actionButtonText: {
    ...typography.caption,
    color: colors.primary,
    marginTop: spacing.sm,
    textAlign: 'center',
    fontWeight: '600',
  },
  documentsSection: {
    marginBottom: spacing.xl,
  },
  sectionTitle: {
    ...typography.h3,
    color: colors.text,
    marginBottom: spacing.md,
  },
  documentItem: {
    flexDirection: 'row',
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.md,
    marginBottom: spacing.md,
    alignItems: 'center',
  },
  documentInfo: {
    flexDirection: 'row',
    flex: 1,
    alignItems: 'center',
  },
  documentThumbnail: {
    width: 50,
    height: 50,
    borderRadius: borderRadius.sm,
    marginRight: spacing.md,
  },
  pdfThumbnail: {
    width: 50,
    height: 50,
    backgroundColor: colors.lightBlue,
    borderRadius: borderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: spacing.md,
  },
  documentDetails: {
    flex: 1,
  },
  documentName: {
    ...typography.body,
    color: colors.text,
    marginBottom: spacing.xs,
    fontWeight: '600',
  },
  documentSize: {
    ...typography.caption,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  documentStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusText: {
    ...typography.caption,
    marginLeft: spacing.xs,
  },
  removeButton: {
    padding: spacing.xs,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: spacing.xxl,
  },
  emptyStateText: {
    ...typography.body,
    color: colors.textSecondary,
    marginTop: spacing.md,
    marginBottom: spacing.sm,
  },
  emptyStateSubtext: {
    ...typography.caption,
    color: colors.textSecondary,
    textAlign: 'center',
  },
  requirementsSection: {
    backgroundColor: colors.surface,
    borderRadius: borderRadius.md,
    padding: spacing.lg,
    marginBottom: spacing.xl,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  requirementText: {
    ...typography.body,
    color: colors.text,
    marginLeft: spacing.sm,
    flex: 1,
  },
  footer: {
    padding: spacing.md,
    backgroundColor: colors.surface,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  uploadButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    alignItems: 'center',
  },
  uploadButtonDisabled: {
    backgroundColor: colors.textSecondary,
  },
  uploadButtonText: {
    ...typography.button,
    color: colors.surface,
  },
});

export default DocumentUploadScreen;
