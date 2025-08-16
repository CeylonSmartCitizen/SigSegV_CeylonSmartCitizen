import React, { useState, useRef } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { supportAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  CloudArrowUpIcon,
  DocumentIcon,
  TrashIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  ExclamationTriangleIcon,
  CheckCircleIcon
} from '@heroicons/react/24/outline'

export default function DocumentUpload() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useNotifications()
  const fileInputRef = useRef(null)
  
  const [uploading, setUploading] = useState(false)
  const [dragOver, setDragOver] = useState(false)
  const [uploadQueue, setUploadQueue] = useState([])
  const [documentType, setDocumentType] = useState('')
  const [description, setDescription] = useState('')

  const allowedTypes = [
    'image/jpeg',
    'image/png',
    'image/gif',
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain'
  ]

  const maxFileSize = 10 * 1024 * 1024 // 10MB

  const documentTypes = [
    { value: 'national_id', label: 'National ID Card' },
    { value: 'passport', label: 'Passport' },
    { value: 'birth_certificate', label: 'Birth Certificate' },
    { value: 'marriage_certificate', label: 'Marriage Certificate' },
    { value: 'utility_bill', label: 'Utility Bill' },
    { value: 'bank_statement', label: 'Bank Statement' },
    { value: 'employment_letter', label: 'Employment Letter' },
    { value: 'medical_report', label: 'Medical Report' },
    { value: 'other', label: 'Other Document' }
  ]

  const validateFile = (file) => {
    const errors = []

    if (!allowedTypes.includes(file.type)) {
      errors.push('File type not supported')
    }

    if (file.size > maxFileSize) {
      errors.push('File size exceeds 10MB limit')
    }

    return errors
  }

  const handleFileSelect = (files) => {
    const fileList = Array.from(files)
    const newUploads = []

    fileList.forEach((file, index) => {
      const errors = validateFile(file)
      newUploads.push({
        id: Date.now() + index,
        file,
        name: file.name,
        size: file.size,
        type: file.type,
        errors,
        status: errors.length > 0 ? 'error' : 'pending',
        progress: 0
      })
    })

    setUploadQueue(prev => [...prev, ...newUploads])
  }

  const handleDragOver = (e) => {
    e.preventDefault()
    setDragOver(true)
  }

  const handleDragLeave = (e) => {
    e.preventDefault()
    setDragOver(false)
  }

  const handleDrop = (e) => {
    e.preventDefault()
    setDragOver(false)
    const files = e.dataTransfer.files
    handleFileSelect(files)
  }

  const handleFileInputChange = (e) => {
    handleFileSelect(e.target.files)
  }

  const removeFromQueue = (id) => {
    setUploadQueue(prev => prev.filter(item => item.id !== id))
  }

  const uploadFile = async (uploadItem) => {
    const formData = new FormData()
    formData.append('file', uploadItem.file)
    formData.append('documentType', documentType)
    formData.append('description', description)
    formData.append('userId', user.id)

    try {
      // Update progress to show upload starting
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadItem.id 
          ? { ...item, status: 'uploading', progress: 0 }
          : item
      ))

      const response = await supportAPI.uploadDocument(formData, {
        onUploadProgress: (progressEvent) => {
          const progress = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          )
          
          setUploadQueue(prev => prev.map(item => 
            item.id === uploadItem.id 
              ? { ...item, progress }
              : item
          ))
        }
      })

      if (response.data.success) {
        setUploadQueue(prev => prev.map(item => 
          item.id === uploadItem.id 
            ? { ...item, status: 'completed', progress: 100, documentId: response.data.data.id }
            : item
        ))

        showToast({
          type: 'success',
          message: 'Document uploaded successfully'
        })
      } else {
        throw new Error(response.data.message || 'Upload failed')
      }
    } catch (error) {
      console.error('Upload error:', error)
      
      setUploadQueue(prev => prev.map(item => 
        item.id === uploadItem.id 
          ? { ...item, status: 'error', errors: [error.message || 'Upload failed'] }
          : item
      ))

      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to upload document'
      })
    }
  }

  const uploadAll = async () => {
    if (!documentType) {
      showToast({
        type: 'error',
        message: 'Please select a document type'
      })
      return
    }

    setUploading(true)
    
    const pendingUploads = uploadQueue.filter(item => 
      item.status === 'pending' && item.errors.length === 0
    )

    for (const upload of pendingUploads) {
      await uploadFile(upload)
    }

    setUploading(false)
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const getFileIcon = (type) => {
    if (type.startsWith('image/')) {
      return <DocumentIcon className="w-8 h-8 text-blue-500" />
    }
    return <DocumentIcon className="w-8 h-8 text-gray-500" />
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'error':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case 'uploading':
        return <LoadingSpinner size="small" />
      default:
        return null
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('documents.upload')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Upload your documents for government service applications
        </p>
      </div>

      {/* Upload Form */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="space-y-6">
          {/* Document Type Selection */}
          <div>
            <label htmlFor="documentType" className="block text-sm font-medium text-gray-700">
              Document Type *
            </label>
            <select
              id="documentType"
              value={documentType}
              onChange={(e) => setDocumentType(e.target.value)}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="">Select document type...</option>
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700">
              Description (Optional)
            </label>
            <textarea
              id="description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add any additional notes about this document..."
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* File Drop Zone */}
          <div
            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
              dragOver
                ? 'border-blue-400 bg-blue-50'
                : 'border-gray-300 hover:border-gray-400'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <CloudArrowUpIcon className="mx-auto h-12 w-12 text-gray-400" />
              <div className="mt-4">
                <p className="text-sm text-gray-600">
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="font-medium text-blue-600 hover:text-blue-500"
                  >
                    Click to upload
                  </button>
                  {' '}or drag and drop files here
                </p>
                <p className="text-xs text-gray-500 mt-2">
                  Supported: PNG, JPG, PDF, DOC, DOCX, TXT (max 10MB each)
                </p>
              </div>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept=".jpg,.jpeg,.png,.gif,.pdf,.doc,.docx,.txt"
              onChange={handleFileInputChange}
              className="hidden"
            />
          </div>
        </div>
      </div>

      {/* Upload Queue */}
      {uploadQueue.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-gray-900">Upload Queue</h3>
            <div className="flex space-x-2">
              <button
                onClick={() => setUploadQueue([])}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              >
                Clear All
              </button>
              <button
                onClick={uploadAll}
                disabled={uploading || !documentType || uploadQueue.filter(item => item.status === 'pending' && item.errors.length === 0).length === 0}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {uploading ? (
                  <>
                    <LoadingSpinner size="small" className="mr-2" />
                    Uploading...
                  </>
                ) : (
                  <>
                    <CloudArrowUpIcon className="w-4 h-4 mr-2" />
                    Upload All
                  </>
                )}
              </button>
            </div>
          </div>

          <div className="space-y-3">
            {uploadQueue.map((item) => (
              <div key={item.id} className="border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    {getFileIcon(item.type)}
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(item.size)}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    {getStatusIcon(item.status)}
                    <button
                      onClick={() => removeFromQueue(item.id)}
                      className="p-1 text-gray-400 hover:text-red-500"
                    >
                      <TrashIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Progress Bar */}
                {item.status === 'uploading' && (
                  <div className="mt-2">
                    <div className="bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${item.progress}%` }}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">{item.progress}% uploaded</p>
                  </div>
                )}

                {/* Errors */}
                {item.errors.length > 0 && (
                  <div className="mt-2">
                    {item.errors.map((error, index) => (
                      <p key={index} className="text-xs text-red-600">
                        • {error}
                      </p>
                    ))}
                  </div>
                )}

                {/* Success Message */}
                {item.status === 'completed' && (
                  <div className="mt-2">
                    <p className="text-xs text-green-600">
                      ✓ Upload completed successfully
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Upload Guidelines */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-sm font-medium text-blue-900 mb-3">Upload Guidelines</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Ensure documents are clear and legible</li>
          <li>• Upload high-quality scans or photos</li>
          <li>• Maximum file size: 10MB per document</li>
          <li>• Supported formats: JPG, PNG, PDF, DOC, DOCX, TXT</li>
          <li>• Avoid uploading sensitive information unless required</li>
          <li>• Documents will be securely stored and processed</li>
        </ul>
      </div>
    </div>
  )
}
