import React, { useState, useEffect } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import { useLanguage } from '../../contexts/LanguageContext'
import { useNotifications } from '../../contexts/NotificationContext'
import { supportAPI } from '../../services/api'
import LoadingSpinner from '../common/LoadingSpinner'
import {
  DocumentIcon,
  EyeIcon,
  ArrowDownTrayIcon,
  TrashIcon,
  MagnifyingGlassIcon,
  FunnelIcon,
  CalendarIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline'

export default function DocumentList() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const { showToast } = useNotifications()
  
  const [documents, setDocuments] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedType, setSelectedType] = useState('')
  const [selectedStatus, setSelectedStatus] = useState('')
  const [sortBy, setSortBy] = useState('created_at')
  const [sortOrder, setSortOrder] = useState('desc')

  const documentTypes = [
    { value: '', label: 'All Types' },
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

  const statusTypes = [
    { value: '', label: 'All Status' },
    { value: 'pending', label: 'Pending Review' },
    { value: 'approved', label: 'Approved' },
    { value: 'rejected', label: 'Rejected' },
    { value: 'processing', label: 'Processing' }
  ]

  useEffect(() => {
    loadDocuments()
  }, [sortBy, sortOrder])

  const loadDocuments = async () => {
    try {
      setLoading(true)
      const response = await supportAPI.getUserDocuments({
        userId: user.id,
        sortBy,
        sortOrder
      })
      
      if (response.data.success) {
        setDocuments(response.data.data)
      }
    } catch (error) {
      console.error('Error loading documents:', error)
      showToast({
        type: 'error',
        message: 'Failed to load documents'
      })
    } finally {
      setLoading(false)
    }
  }

  const deleteDocument = async (documentId) => {
    if (!window.confirm('Are you sure you want to delete this document?')) {
      return
    }

    try {
      const response = await supportAPI.deleteDocument(documentId)
      
      if (response.data.success) {
        setDocuments(prev => prev.filter(doc => doc.id !== documentId))
        showToast({
          type: 'success',
          message: 'Document deleted successfully'
        })
      } else {
        showToast({
          type: 'error',
          message: response.data.message || 'Failed to delete document'
        })
      }
    } catch (error) {
      console.error('Error deleting document:', error)
      showToast({
        type: 'error',
        message: error.response?.data?.message || 'Failed to delete document'
      })
    }
  }

  const downloadDocument = async (documentId, filename) => {
    try {
      const response = await supportAPI.downloadDocument(documentId, {
        responseType: 'blob'
      })
      
      // Create blob link to download
      const url = window.URL.createObjectURL(new Blob([response.data]))
      const link = document.createElement('a')
      link.href = url
      link.setAttribute('download', filename)
      document.body.appendChild(link)
      link.click()
      link.remove()
      window.URL.revokeObjectURL(url)
      
      showToast({
        type: 'success',
        message: 'Document downloaded successfully'
      })
    } catch (error) {
      console.error('Error downloading document:', error)
      showToast({
        type: 'error',
        message: 'Failed to download document'
      })
    }
  }

  const previewDocument = async (documentId) => {
    try {
      const response = await supportAPI.previewDocument(documentId)
      
      if (response.data.success && response.data.data.previewUrl) {
        window.open(response.data.data.previewUrl, '_blank')
      } else {
        showToast({
          type: 'info',
          message: 'Preview not available for this document type'
        })
      }
    } catch (error) {
      console.error('Error previewing document:', error)
      showToast({
        type: 'error',
        message: 'Failed to preview document'
      })
    }
  }

  const getStatusIcon = (status) => {
    switch (status) {
      case 'approved':
        return <CheckCircleIcon className="w-5 h-5 text-green-500" />
      case 'rejected':
        return <ExclamationTriangleIcon className="w-5 h-5 text-red-500" />
      case 'processing':
        return <ClockIcon className="w-5 h-5 text-yellow-500" />
      default:
        return <ClockIcon className="w-5 h-5 text-gray-500" />
    }
  }

  const getStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800'
      case 'rejected':
        return 'bg-red-100 text-red-800'
      case 'processing':
        return 'bg-yellow-100 text-yellow-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const getDocumentTypeLabel = (type) => {
    const docType = documentTypes.find(dt => dt.value === type)
    return docType ? docType.label : type
  }

  const filteredDocuments = documents.filter(doc => {
    const matchesSearch = doc.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         doc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesType = !selectedType || doc.document_type === selectedType
    const matchesStatus = !selectedStatus || doc.status === selectedStatus
    
    return matchesSearch && matchesType && matchesStatus
  })

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="large" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">{t('documents.list')}</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage and view your uploaded documents
        </p>
      </div>

      {/* Filters and Search */}
      <div className="bg-white shadow rounded-lg p-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {/* Search */}
          <div className="lg:col-span-2">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <MagnifyingGlassIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="Search documents..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Document Type Filter */}
          <div>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {documentTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              {statusTypes.map(status => (
                <option key={status.value} value={status.value}>
                  {status.label}
                </option>
              ))}
            </select>
          </div>

          {/* Sort */}
          <div>
            <select
              value={`${sortBy}-${sortOrder}`}
              onChange={(e) => {
                const [field, order] = e.target.value.split('-')
                setSortBy(field)
                setSortOrder(order)
              }}
              className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="created_at-desc">Newest First</option>
              <option value="created_at-asc">Oldest First</option>
              <option value="filename-asc">Name A-Z</option>
              <option value="filename-desc">Name Z-A</option>
              <option value="file_size-desc">Largest First</option>
              <option value="file_size-asc">Smallest First</option>
            </select>
          </div>
        </div>
      </div>

      {/* Documents Grid */}
      <div className="bg-white shadow rounded-lg">
        {filteredDocuments.length > 0 ? (
          <div className="p-6">
            <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {filteredDocuments.map((document) => (
                <div key={document.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Document Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center">
                      <DocumentIcon className="w-8 h-8 text-blue-500 mr-3" />
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {document.filename}
                        </h3>
                        <p className="text-xs text-gray-500">
                          {getDocumentTypeLabel(document.document_type)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {getStatusIcon(document.status)}
                    </div>
                  </div>

                  {/* Status Badge */}
                  <div className="mb-3">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(document.status)}`}>
                      {document.status}
                    </span>
                  </div>

                  {/* Document Info */}
                  <div className="space-y-1 mb-4 text-xs text-gray-500">
                    <div className="flex justify-between">
                      <span>Size:</span>
                      <span>{formatFileSize(document.file_size)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Uploaded:</span>
                      <span>{formatDate(document.created_at)}</span>
                    </div>
                    {document.updated_at !== document.created_at && (
                      <div className="flex justify-between">
                        <span>Updated:</span>
                        <span>{formatDate(document.updated_at)}</span>
                      </div>
                    )}
                  </div>

                  {/* Description */}
                  {document.description && (
                    <div className="mb-4">
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {document.description}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center justify-between space-x-2">
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => previewDocument(document.id)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition-colors"
                        title="Preview"
                      >
                        <EyeIcon className="w-4 h-4" />
                      </button>
                      
                      <button
                        onClick={() => downloadDocument(document.id, document.filename)}
                        className="p-1 text-gray-400 hover:text-green-500 transition-colors"
                        title="Download"
                      >
                        <ArrowDownTrayIcon className="w-4 h-4" />
                      </button>
                    </div>

                    {document.status === 'pending' && (
                      <button
                        onClick={() => deleteDocument(document.id)}
                        className="p-1 text-gray-400 hover:text-red-500 transition-colors"
                        title="Delete"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    )}
                  </div>

                  {/* Rejection Reason */}
                  {document.status === 'rejected' && document.rejection_reason && (
                    <div className="mt-3 p-2 bg-red-50 border border-red-200 rounded">
                      <p className="text-xs text-red-700">
                        <strong>Rejection Reason:</strong> {document.rejection_reason}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <DocumentIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No documents found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedType || selectedStatus
                ? 'Try adjusting your search or filters.'
                : 'Upload your first document to get started.'
              }
            </p>
          </div>
        )}
      </div>

      {/* Summary Stats */}
      {documents.length > 0 && (
        <div className="bg-white shadow rounded-lg p-6">
          <h3 className="text-lg font-medium text-gray-900 mb-4">Document Summary</h3>
          
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-900">
                {documents.length}
              </div>
              <div className="text-sm text-gray-500">Total Documents</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">
                {documents.filter(doc => doc.status === 'approved').length}
              </div>
              <div className="text-sm text-gray-500">Approved</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-600">
                {documents.filter(doc => doc.status === 'pending' || doc.status === 'processing').length}
              </div>
              <div className="text-sm text-gray-500">Pending</div>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">
                {documents.filter(doc => doc.status === 'rejected').length}
              </div>
              <div className="text-sm text-gray-500">Rejected</div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
