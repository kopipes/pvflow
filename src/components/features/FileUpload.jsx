import React, { useState, useRef } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { X, Upload, FileText, CheckCircle } from 'lucide-react';
import './AIFeedbackImport.css';

function FileUpload({ isOpen, onClose, taskId }) {
  const { addFile, currentUser } = useTaskStore();
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFile, setSelectedFile] = useState(null);
  const [version, setVersion] = useState(1);
  const [notes, setNotes] = useState('');
  const fileInputRef = useRef(null);
  
  if (!isOpen) return null;
  
  const getFileType = (filename) => {
    const ext = filename.split('.').pop().toLowerCase();
    const typeMap = {
      'psd': 'psd',
      'ai': 'ai',
      'pdf': 'pdf',
      'jpg': 'jpg',
      'jpeg': 'jpeg',
      'png': 'png',
      'gif': 'gif',
      'webp': 'webp',
      'zip': 'zip',
      'rar': 'zip',
    };
    return typeMap[ext] || 'file';
  };
  
  const handleDragOver = (e) => {
    e.preventDefault();
    setDragging(true);
  };
  
  const handleDragLeave = () => {
    setDragging(false);
  };
  
  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileSelect(files[0]);
    }
  };
  
  const handleFileSelect = (file) => {
    // Store the actual file object so we can create a blob URL for preview
    setSelectedFile(file);
  };
  
  const handleInputChange = (e) => {
    if (e.target.files.length > 0) {
      handleFileSelect(e.target.files[0]);
    }
  };
  
  const handleUpload = async () => {
    if (!selectedFile) return;
    
    // Check file size - warn if over 5MB (base64 has ~33% overhead)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (selectedFile.size > maxSize) {
      alert('File is too large. Maximum size is 5MB for preview support. Consider using a smaller file or a file hosting service.');
      return;
    }
    
    setUploading(true);
    setUploadProgress(0);
    
    // Convert file to base64 data URL for persistent storage
    const readFileAsDataURL = (file) => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };
    
    try {
      // Read file progress
      setUploadProgress(25);
      const dataUrl = await readFileAsDataURL(selectedFile);
      setUploadProgress(75);
      
      // Create file object
      const fileObj = {
        filename: selectedFile.name,
        type: getFileType(selectedFile.name),
        size: selectedFile.size,
        version: version,
        notes: notes,
        url: dataUrl, // Use base64 data URL instead of blob URL
      };
      
      setUploadProgress(100);
      
      // Add file to store
      addFile(taskId, fileObj);
      
      setUploading(false);
      setSelectedFile(null);
      setNotes('');
      setVersion(1);
      onClose();
    } catch (error) {
      console.error('Error uploading file:', error);
      alert('Failed to upload file. Please try again.');
      setUploading(false);
    }
  };
  
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-container ai-import-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Upload File</h2>
          <button className="close-btn" onClick={onClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {/* Drop Zone */}
          <div 
            className={`drop-zone ${dragging ? 'dragging' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
          >
            <input 
              type="file" 
              ref={fileInputRef}
              onChange={handleInputChange}
              style={{ display: 'none' }}
              accept=".psd,.ai,.pdf,.jpg,.jpeg,.png,.gif,.webp,.zip,.rar"
            />
            
            {selectedFile ? (
              <div className="selected-file">
                <FileText size={40} />
                <div className="file-info">
                  <p className="file-name">{selectedFile.name}</p>
                  <p className="file-size">{(selectedFile.size / 1024 / 1024).toFixed(2)} MB</p>
                </div>
                <button 
                  className="remove-file"
                  onClick={(e) => {
                    e.stopPropagation();
                    setSelectedFile(null);
                  }}
                >
                  <X size={16} />
                </button>
              </div>
            ) : (
              <>
                <Upload size={40} />
                <p>Drop file here or click to browse</p>
                <span>Supports: PSD, AI, PDF, JPG, JPEG, PNG, GIF, WEBP, ZIP</span>
              </>
            )}
          </div>
          
          {selectedFile && (
            <>
              {/* Version */}
              <div className="form-group">
                <label>Version Number</label>
                <div className="version-input">
                  <button onClick={() => setVersion(v => Math.max(1, v - 1))}>-</button>
                  <input 
                    type="number" 
                    value={version}
                    onChange={(e) => setVersion(Math.max(1, parseInt(e.target.value) || 1))}
                    min="1"
                  />
                  <button onClick={() => setVersion(v => v + 1)}>+</button>
                </div>
              </div>
              
              {/* Notes */}
              <div className="form-group">
                <label>Notes (optional)</label>
                <textarea
                  placeholder="Add notes about this version..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
              
              {/* Upload Progress */}
              {uploading && (
                <div className="upload-progress">
                  <div className="progress-bar">
                    <div 
                      className="progress-fill"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <p>{uploadProgress}% uploaded</p>
                </div>
              )}
            </>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={onClose}>
            Cancel
          </button>
          <button 
            className="btn-primary" 
            onClick={handleUpload}
            disabled={!selectedFile || uploading}
          >
            <Upload size={16} />
            Upload File
          </button>
        </div>
      </div>
    </div>
  );
}

export default FileUpload;