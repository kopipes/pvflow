import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { format } from 'date-fns';
import {
  FileText,
  Download,
  Eye,
  Grid,
  List,
  Search,
  Filter,
  Upload,
  FolderOpen,
  Image,
  Film,
  Archive,
  X,
} from 'lucide-react';
import './FileManager.css';

function FileManager() {
  const { tasks, taskFiles, users, setSelectedTask } = useTaskStore();
  const [viewMode, setViewMode] = useState('grid');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [previewFile, setPreviewFile] = useState(null);
  
  // Check if file type can be previewed in browser
  const canPreviewInBrowser = (type) => {
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type);
  };
  
  // Handle file preview
  const handlePreview = (file, e) => {
    e.stopPropagation();
    if (canPreviewInBrowser(file.type)) {
      setPreviewFile(file);
    } else {
      alert(`Preview not available for ${file.type.toUpperCase()} files. Only PDF, JPG, PNG, GIF, and WEBP can be previewed.`);
    }
  };
  
  // Handle file download
  const handleDownload = (file, e) => {
    e.stopPropagation();
    const link = document.createElement('a');
    link.href = file.url || '#';
    link.download = file.filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    if (file.url && file.url.startsWith('blob:')) {
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      // For mock data without real files, create a placeholder download
      const placeholderContent = `File: ${file.filename}\nVersion: ${file.version}\nSize: ${file.size} bytes\nType: ${file.type}\n\nThis is a placeholder download since no actual file was uploaded.`;
      const blob = new Blob([placeholderContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      link.href = url;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  };
  
  // Flatten all files across tasks
  const allFiles = Object.entries(taskFiles).flatMap(([taskId, files]) =>
    files.map(file => ({
      ...file,
      task: tasks.find(t => t.id === taskId),
      taskId,
    }))
  );
  
  // Filter files
  const filteredFiles = allFiles.filter(file => {
    const matchesSearch = file.filename.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         file.task?.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = filterType === 'all' || file.type === filterType;
    return matchesSearch && matchesType;
  });
  
  const getFileIcon = (type) => {
    switch (type) {
      case 'psd':
      case 'ai':
        return <Image size={24} className="file-icon-design" />;
      case 'mp4':
      case 'mov':
        return <Film size={24} className="file-icon-video" />;
      case 'zip':
      case 'rar':
        return <Archive size={24} className="file-icon-archive" />;
      default:
        return <FileText size={24} className="file-icon-doc" />;
    }
  };
  
  const getFileTypeBadge = (type) => {
    const badges = {
      psd: 'PSD',
      ai: 'AI',
      pdf: 'PDF',
      png: 'PNG',
      jpg: 'JPG',
      mp4: 'MP4',
      zip: 'ZIP',
      html: 'HTML',
    };
    return badges[type] || type.toUpperCase();
  };
  
  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1024 / 1024).toFixed(1) + ' MB';
  };
  
  const handleFileClick = (file) => {
    if (file.taskId) {
      setSelectedTask(file.taskId);
    }
  };
  
  return (
    <div className="file-manager">
      <div className="file-manager-header">
        <div className="header-title">
          <FolderOpen size={24} />
          <h1>File Manager</h1>
          <span className="file-count">{allFiles.length} files</span>
        </div>
        
        <div className="header-controls">
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search files..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <select
            className="filter-select"
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
          >
            <option value="all">All Types</option>
            <option value="psd">PSD</option>
            <option value="ai">AI</option>
            <option value="pdf">PDF</option>
            <option value="png">PNG</option>
            <option value="zip">ZIP</option>
            <option value="html">HTML</option>
          </select>
          
          <div className="view-toggle">
            <button
              className={viewMode === 'grid' ? 'active' : ''}
              onClick={() => setViewMode('grid')}
            >
              <Grid size={18} />
            </button>
            <button
              className={viewMode === 'list' ? 'active' : ''}
              onClick={() => setViewMode('list')}
            >
              <List size={18} />
            </button>
          </div>
        </div>
      </div>
      
      <div className={`file-content ${viewMode}`}>
        {filteredFiles.length === 0 ? (
          <div className="files-empty">
            <FolderOpen size={48} />
            <p>No files found</p>
          </div>
        ) : viewMode === 'grid' ? (
          <div className="files-grid">
            {filteredFiles.map((file) => {
              const uploader = users.find(u => u.id === file.uploaded_by);
              return (
                <div
                  key={file.id}
                  className="file-card"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="file-preview">
                    {getFileIcon(file.type)}
                    <span className={`file-type-badge ${file.type}`}>
                      {getFileTypeBadge(file.type)}
                    </span>
                  </div>
                  <div className="file-card-info">
                    <div className="file-name">{file.filename}</div>
                    <div className="file-meta">
                      <span className="file-version">v{file.version}</span>
                      <span className="file-size">{formatSize(file.size)}</span>
                    </div>
                    {file.task && (
                      <div className="file-task">{file.task.title}</div>
                    )}
                    <div className="file-footer">
                      <span className="file-uploader">
                        {uploader?.name} • {format(new Date(file.uploaded_at), 'MMM d')}
                      </span>
                    </div>
                  </div>
                  <div className="file-actions">
                    <button 
                      className="file-action" 
                      title="Preview"
                      onClick={(e) => handlePreview(file, e)}
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="file-action" 
                      title="Download"
                      onClick={(e) => handleDownload(file, e)}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="files-list">
            <div className="list-header">
              <span className="col-name">Name</span>
              <span className="col-task">Task</span>
              <span className="col-version">Version</span>
              <span className="col-size">Size</span>
              <span className="col-uploaded">Uploaded</span>
              <span className="col-actions">Actions</span>
            </div>
            {filteredFiles.map((file) => {
              const uploader = users.find(u => u.id === file.uploaded_by);
              return (
                <div
                  key={file.id}
                  className="list-row"
                  onClick={() => handleFileClick(file)}
                >
                  <div className="col-name">
                    {getFileIcon(file.type)}
                    <span>{file.filename}</span>
                  </div>
                  <div className="col-task">
                    {file.task?.title || 'Unknown task'}
                  </div>
                  <div className="col-version">
                    <span className="version-badge">v{file.version}</span>
                  </div>
                  <div className="col-size">{formatSize(file.size)}</div>
                  <div className="col-uploaded">
                    {uploader?.name} • {format(new Date(file.uploaded_at), 'MMM d')}
                  </div>
                  <div className="col-actions">
                    <button 
                      className="file-action" 
                      title="Preview"
                      onClick={(e) => handlePreview(file, e)}
                    >
                      <Eye size={14} />
                    </button>
                    <button 
                      className="file-action" 
                      title="Download"
                      onClick={(e) => handleDownload(file, e)}
                    >
                      <Download size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      
      {/* Preview Modal */}
      {previewFile && (
        <div className="preview-modal-overlay" onClick={() => setPreviewFile(null)}>
          <div className="preview-modal" onClick={e => e.stopPropagation()}>
            <div className="preview-header">
              <div className="preview-info">
                <FileText size={20} />
                <span>{previewFile.filename}</span>
              </div>
              <div className="preview-actions">
                <button 
                  className="preview-action-btn"
                  onClick={() => handleDownload(previewFile, { stopPropagation: () => {} })}
                  title="Download"
                >
                  <Download size={18} />
                </button>
                <button 
                  className="preview-close-btn"
                  onClick={() => setPreviewFile(null)}
                >
                  <X size={20} />
                </button>
              </div>
            </div>
            <div className="preview-content">
              {previewFile.type === 'pdf' ? (
                <iframe 
                  src={previewFile.url} 
                  title={previewFile.filename}
                  className="preview-iframe"
                />
              ) : (
                <img 
                  src={previewFile.url} 
                  alt={previewFile.filename}
                  className="preview-image"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default FileManager;