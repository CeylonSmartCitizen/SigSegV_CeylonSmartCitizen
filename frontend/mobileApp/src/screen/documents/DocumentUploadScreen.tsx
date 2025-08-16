// src/screens/documents/DocumentUploadScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DocumentCamera from '../../components/documents/DocumentCamera';
import { DocumentData } from '../../types/queue.types';
import { colors, spacing, typography } from '../../constants/theme';

const DocumentUploadScreen: React.FC = () => {
  const [documents, setDocuments] = useState<DocumentData[]>([]);

  const handleDocumentCaptured = (document: DocumentData) => {
    setDocuments(prev => [document, ...prev]);
    Alert.alert(
      'Document Processed',
      `Your ${document.type} document has been processed successfully!`
    );
  };

  const renderDocumentItem = ({ item }: { item: DocumentData }) => (
    <View style={styles.documentItem}>
      <Text style={styles.documentType}>{item.type.toUpperCase()}</Text>
      <Text style={styles.documentStatus}>Status: {item.status}</Text>
      {item.extractedText && (
        <Text style={styles.extractedText} numberOfLines={3}>
          Extracted: {item.extractedText}
        </Text>
      )}
      <Text style={styles.documentDate}>
        {item.createdAt.toLocaleDateString()} {item.createdAt.toLocaleTimeString()}
      </Text>
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
        <Text style={styles.title}>Document Upload</Text>
        <Text style={styles.subtitle}>
          Capture your documents for verification and processing
        </Text>

        <DocumentCamera
          onDocumentCaptured={handleDocumentCaptured}
          documentType="nic"
        />

        {documents.length > 0 && (
          <View style={styles.documentsSection}>
            <Text style={styles.sectionTitle}>Uploaded Documents</Text>
            <FlatList
              data={documents}
              renderItem={renderDocumentItem}
              keyExtractor={(item) => item.id}
              scrollEnabled={false}
            />
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  title: {
    fontSize: typography.h2.fontSize,
    fontWeight: typography.h2.fontWeight as any,
    textAlign: 'center',
    margin: spacing.lg,
    color: colors.textPrimary,
  },
  subtitle: {
    fontSize: typography.body.fontSize,
    textAlign: 'center',
    marginHorizontal: spacing.lg,
    marginBottom: spacing.lg,
    color: colors.textSecondary,
    lineHeight: 20,
  },
  documentsSection: {
    margin: spacing.md,
  },
  sectionTitle: {
    fontSize: typography.h3.fontSize,
    fontWeight: typography.h3.fontWeight as any,
    marginBottom: spacing.md,
    color: colors.textPrimary,
  },
  documentItem: {
    backgroundColor: colors.white,
    padding: spacing.md,
    borderRadius: 8,
    marginBottom: spacing.sm,
    shadowColor: colors.shadow,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 1,
  },
  documentType: {
    fontSize: typography.subtitle.fontSize,
    fontWeight: '600',
    color: colors.primary,
    marginBottom: spacing.xs,
  },
  documentStatus: {
    fontSize: typography.body.fontSize,
    color: colors.textSecondary,
    marginBottom: spacing.xs,
  },
  extractedText: {
    fontSize: typography.caption.fontSize,
    color: colors.textTertiary,
    fontStyle: 'italic',
    marginBottom: spacing.xs,
  },
  documentDate: {
    fontSize: typography.caption.fontSize,
    color: colors.textTertiary,
  },
});

export default DocumentUploadScreen;
