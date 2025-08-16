// src/components/documents/DocumentCamera.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Modal,
  Image,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';

import { DocumentData } from '../../types/queue.types';
import { colors, spacing, typography } from '../../constants/theme';

const { width: screenWidth } = Dimensions.get('window');

interface DocumentCameraProps {
  onDocumentCaptured: (document: DocumentData) => void;
  documentType?: string;
  disabled?: boolean;
}

const DocumentCamera: React.FC<DocumentCameraProps> = ({
  onDocumentCaptured,
  documentType = 'general',
  disabled = false,
}) => {
  const [capturedImage, setCapturedImage] = useState<any>(null);
  const [processing, setProcessing] = useState<boolean>(false);
  const [showOptions, setShowOptions] = useState<boolean>(false);

  const requestPermissions = async () => {
    const cameraPermission = await ImagePicker.requestCameraPermissionsAsync();
    const libraryPermission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
    if (!cameraPermission.granted || !libraryPermission.granted) {
      Alert.alert(
        'Permissions Required',
        'Camera and photo library permissions are required to capture documents.'
      );
      return false;
    }
    return true;
  };

  const handleCameraCapture = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3],
        allowsEditing: true,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets);
        setShowOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to capture image');
    }
  };

  const handleGallerySelect = async () => {
    const hasPermission = await requestPermissions();
    if (!hasPermission) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 0.8,
        aspect: [4, 3],
        allowsEditing: true,
        base64: false,
      });

      if (!result.canceled && result.assets[0]) {
        setCapturedImage(result.assets);
        setShowOptions(false);
      }
    } catch (error) {
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const processDocument = async () => {
    if (!capturedImage) return;

    setProcessing(true);
    try {
      // Simulate OCR processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const processedDocument: DocumentData = {
        id: Date.now().toString(),
        type: documentType,
        originalImage: capturedImage,
        extractedText: 'Mock extracted text from document processing...',
        confidence: 0.95,
        status: 'processed',
        processedAt: new Date(),
        createdAt: new Date(),
      };

      onDocumentCaptured(processedDocument);
      setCapturedImage(null);
      Alert.alert('Success', 'Document processed successfully!');
    } catch (error) {
      Alert.alert('Error', 'Failed to process document');
    } finally {
      setProcessing(false);
    }
  };

  const retakePhoto = () => {
    setCapturedImage(null);
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Document Capture</Text>
        <Text style={styles.instruction}>
          {documentType === 'nic' && 'Please capture your National ID card clearly'}
          {documentType === 'certificate' && 'Capture your certificate or document'}
          {documentType === 'general' && 'Capture the required document'}
        </Text>

        {!capturedImage ? (
          <View style={styles.captureContainer}>
            <TouchableOpacity
              style={[styles.captureButton, disabled && styles.disabledButton]}
              onPress={() => setShowOptions(true)}
              disabled={disabled}
            >
              <Ionicons name="camera" size={32} color={colors.white} />
              <Text style={styles.captureButtonText}>Capture Document</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.previewContainer}>
            <Image source={{ uri: capturedImage.uri }} style={styles.previewImage} />
            
            <View style={styles.actionButtons}>
              <TouchableOpacity style={styles.retakeButton} onPress={retakePhoto}>
                <Ionicons name="refresh" size={20} color={colors.textPrimary} />
                <Text style={styles.retakeButtonText}>Retake</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.processButton, processing && styles.disabledButton]}
                onPress={processDocument}
                disabled={processing}
              >
                {processing ? (
                  <ActivityIndicator color={colors.white} size="small" />
                ) : (
                  <Ionicons name="checkmark" size={20} color={colors.white} />
                )}
                <Text style={styles.processButtonText}>
                  {processing ? 'Processing...' : 'Process'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      </View>

      <Modal
        visible={showOptions}
        transparent
        animationType="slide"
        onRequestClose={() => setShowOptions(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.optionsContainer}>
            <Text style={styles.optionsTitle}>Select Image Source</Text>
            
            <TouchableOpacity style={styles.optionButton} onPress={handleCameraCapture}>
              <Ionicons name="camera" size={24} color={colors.white} />
              <Text style={styles.optionText}>Take Photo</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={styles.optionButton} onPress={handleGallerySelect}>
              <Ionicons name="images" size={24} color={colors.white} />
              <Text style={styles.optionText}>Choose from Gallery</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.cancelButton}
              onPress={() => setShowOptions(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    margin: spacing.md,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 16,
    padding: spacing.lg,
    shadowColor: colors.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  title: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight as any,
    color: colors.textPrimary,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  instruction: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing.lg,
    lineHeight: 20,
  },
  captureContainer: {
    alignItems: 'center',
    paddingVertical: spacing.xl,
  },
  captureButton: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  captureButtonText: {
    color: colors.white,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as any,
  },
  disabledButton: {
    opacity: 0.5,
  },
  previewContainer: {
    alignItems: 'center',
  },
  previewImage: {
    width: screenWidth - spacing.xl * 2,
    height: (screenWidth - spacing.xl * 2) * 0.75,
    borderRadius: 8,
    marginBottom: spacing.lg,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    gap: spacing.md,
  },
  retakeButton: {
    flex: 1,
    backgroundColor: colors.surface,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  retakeButtonText: {
    color: colors.textPrimary,
    fontSize: typography.button.fontSize,
    fontWeight: '500',
  },
  processButton: {
    flex: 1,
    backgroundColor: colors.success,
    paddingVertical: spacing.md,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.xs,
  },
  processButtonText: {
    color: colors.white,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as any,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  optionsContainer: {
    backgroundColor: colors.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: spacing.xl,
  },
  optionsTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight as any,
    textAlign: 'center',
    marginBottom: spacing.xl,
    color: colors.textPrimary,
  },
  optionButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    marginBottom: spacing.md,
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'center',
    gap: spacing.sm,
  },
  optionText: {
    color: colors.white,
    fontSize: typography.button.fontSize,
    fontWeight: typography.button.fontWeight as any,
  },
  cancelButton: {
    backgroundColor: colors.surface,
    paddingVertical: spacing.lg,
    borderRadius: 12,
    alignItems: 'center',
  },
  cancelText: {
    color: colors.textPrimary,
    fontSize: typography.button.fontSize,
    fontWeight: '500',
  },
});

export default DocumentCamera;
