import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { format, formatDistanceToNow, isBefore } from 'date-fns';
import {
  X,
  ArrowLeft,
  Clock,
  AlertCircle,
  User,
  Tag,
  Calendar,
  FileText,
  Upload,
  MessageSquare,
  CheckCircle2,
  Send,
  Paperclip,
  Download,
  Eye,
  Trash2,
  ThumbsUp,
  ThumbsDown,
  Bell,
  ChevronDown,
  ChevronUp,
  Pencil,
  ExternalLink,
  Plus,
  CheckSquare,
  Square,
} from 'lucide-react';
import './TaskDetailPanel.css';

function TaskDetailPanel({ taskId, onBack, isFullPage, onEdit, onUploadFile }) {
  const { 
    tasks, 
    users, 
    statuses, 
    priorities, 
    taskLogs, 
    taskFiles, 
    comments,
    taskChecklists,
    setSelectedTask,
    updateTaskStatus,
    addComment,
    addReply,
    deleteComment,
    approveStatusChange,
    rejectStatusChange,
    getPendingApproval,
    currentUser,
    reassignTask,
    getAssignableUsers,
    canEditTask,
    deleteFile,
    addChecklistItem,
    toggleChecklistItem,
    deleteChecklistItem,
  } = useTaskStore();
  
  // Check if current user is admin
  const isAdmin = currentUser.role === 'admin';
  
  const [newComment, setNewComment] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [showAssigneeDropdown, setShowAssigneeDropdown] = useState(false);
  const [previewFile, setPreviewFile] = useState(null);
  const [newChecklistItem, setNewChecklistItem] = useState('');
  const [newChecklistAssignee, setNewChecklistAssignee] = useState('');
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyText, setReplyText] = useState('');
  
  const checklistItems = taskChecklists?.[taskId] || [];
  const completedCount = checklistItems.filter(item => item.completed).length;
  
  // Check if file type can be previewed in browser
  const canPreviewInBrowser = (type) => {
    return ['pdf', 'jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type);
  };
  
  // Handle file preview
  const handlePreview = (file) => {
    if (canPreviewInBrowser(file.type)) {
      setPreviewFile(file);
    } else {
      alert(`Preview not available for ${file.type.toUpperCase()} files. Only PDF, JPG, PNG, GIF, and WEBP can be previewed.`);
    }
  };
  
  // Handle file download
  const handleDownload = (file) => {
    // For demo purposes, create a dummy download
    const link = document.createElement('a');
    link.href = file.url || '#';
    link.download = file.filename;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    
    // Since files are stored as blob URLs in demo, we need to trigger download differently
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
  
  // Handle file delete
  const handleDeleteFile = (file) => {
    if (confirm(`Are you sure you want to delete "${file.filename}"?`)) {
      deleteFile(taskId, file.id);
      if (previewFile?.id === file.id) {
        setPreviewFile(null);
      }
    }
  };
  
  const task = tasks.find(t => t.id === taskId);
  const pendingApproval = getPendingApproval(taskId);
  const canEdit = canEditTask(task);
  const assignableUsers = canEdit ? getAssignableUsers(task) : [];
  
  const handleClose = () => {
    if (onBack) {
      onBack();
    } else {
      setSelectedTask(null);
    }
  };
  
  if (!task) {
    return (
      <div className="task-panel">
        <div className="panel-empty">Task not found</div>
      </div>
    );
  }
  
  const now = new Date();
  const assignee = users.find(u => u.id === task.assignee_id);
  const creator = users.find(u => u.id === task.created_by);
  const logs = taskLogs[taskId] || [];
  const files = taskFiles[taskId] || [];
  const taskComments = comments[taskId] || [];
  
  const statusInfo = statuses.find(s => s.id === task.status);
  const priorityInfo = priorities.find(p => p.id === task.priority);
  const pendingStatusInfo = pendingApproval ? statuses.find(s => s.id === pendingApproval.requestedStatus) : null;
  const requestedByUser = pendingApproval ? users.find(u => u.id === pendingApproval.requestedBy) : null;
  
  const isOverdue = task.due_date && isBefore(new Date(task.due_date), now) && task.status !== 'delivered';
  
  const handleAddComment = () => {
    if (newComment.trim()) {
      addComment(taskId, newComment);
      setNewComment('');
    }
  };
  
  const handleApprove = () => {
    if (confirm('Approve this status change?')) {
      approveStatusChange(taskId);
    }
  };
  
  const handleReject = () => {
    if (confirm('Reject this status change request?')) {
      rejectStatusChange(taskId);
    }
  };
  
  const handleAddReply = (commentId) => {
    if (replyText.trim()) {
      addReply(taskId, commentId, replyText);
      setReplyText('');
      setReplyingTo(null);
    }
  };
  
  const getLogIcon = (action) => {
    switch (action) {
      case 'file': return <Upload size={14} />;
      case 'comment': return <MessageSquare size={14} />;
      case 'status': return <CheckCircle2 size={14} />;
      case 'approval_request': return <Bell size={14} />;
      case 'approved': return <ThumbsUp size={14} />;
      case 'rejected': return <ThumbsDown size={14} />;
      default: return <FileText size={14} />;
    }
  };
  
  const getFileIcon = (type) => {
    switch (type) {
      case 'psd': return <span className="file-type psd">PSD</span>;
      case 'ai': return <span className="file-type ai">AI</span>;
      case 'pdf': return <span className="file-type pdf">PDF</span>;
      case 'zip': return <span className="file-type zip">ZIP</span>;
      default: return <FileText size={16} />;
    }
  };
  
  return (
    <div className={`task-panel ${isFullPage ? 'full-page' : ''}`}>
      <div className="panel-header">
        {isFullPage && (
          <button className="back-btn" onClick={handleClose}>
            <ArrowLeft size={18} />
            <span>Back to Kanban</span>
          </button>
        )}
        <div className="panel-title-row">
          <span className="task-id">#{task.id}</span>
          <div className="panel-actions">
            {canEdit && (
              <button className="edit-btn" onClick={onEdit}>
                <Pencil size={16} />
                Edit
              </button>
            )}
            {!isFullPage && (
              <button className="close-btn" onClick={handleClose}>
                <X size={18} />
              </button>
            )}
          </div>
        </div>
        <h2 className="panel-title">{task.title}</h2>
        <div className="panel-meta">
          <span 
            className="status-badge"
            style={{ background: statusInfo?.color }}
          >
            {statusInfo?.label}
          </span>
          <span 
            className="priority-badge"
            style={{ color: priorityInfo?.color }}
          >
            {priorityInfo?.label}
          </span>
        </div>
        
        {/* Pending Approval Banner */}
        {pendingApproval && (
          <div className="approval-banner">
            <div className="approval-info">
              <AlertCircle size={16} />
              <div>
                <strong>Pending Approval</strong>
                <p>Request to move to <span style={{ color: pendingStatusInfo?.color }}>{pendingStatusInfo?.label}</span> by {requestedByUser?.name}</p>
              </div>
            </div>
            <div className="approval-actions">
              <button className="approve-btn" onClick={handleApprove}>
                <ThumbsUp size={14} />
                Approve
              </button>
              <button className="reject-btn" onClick={handleReject}>
                <ThumbsDown size={14} />
                Reject
              </button>
            </div>
          </div>
        )}
      </div>
      
      <div className="panel-tabs">
        <button 
          className={`tab-btn ${activeTab === 'overview' ? 'active' : ''}`}
          onClick={() => setActiveTab('overview')}
        >
          Overview
        </button>
        <button 
          className={`tab-btn ${activeTab === 'checklist' ? 'active' : ''}`}
          onClick={() => setActiveTab('checklist')}
        >
          Checklist ({completedCount}/{checklistItems.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'files' ? 'active' : ''}`}
          onClick={() => setActiveTab('files')}
        >
          Files ({files.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'activity' ? 'active' : ''}`}
          onClick={() => setActiveTab('activity')}
        >
          Activity
        </button>
      </div>
      
      <div className="panel-content">
        {activeTab === 'overview' && (
          <div className="overview-tab">
            <div className="info-section">
              <h3>Brief</h3>
              <p className="brief-text">{task.brief}</p>
            </div>
            
            <div className="info-grid">
              <div className="info-item">
                <User size={16} />
                <div>
                  <label>Assignee</label>
                  {canEdit && assignableUsers.length > 0 ? (
                    <div className="assignee-selector">
                      <button 
                        className="assignee-btn"
                        onClick={() => setShowAssigneeDropdown(!showAssigneeDropdown)}
                      >
                        {assignee ? (
                          <>
                            <div 
                              className="user-avatar-xs"
                              style={{ background: assignee.color }}
                            >
                              {assignee.initials}
                            </div>
                            {assignee.name}
                          </>
                        ) : (
                          <span className="unassigned">Select Assignee</span>
                        )}
                        <ChevronDown size={14} />
                      </button>
                      
                      {showAssigneeDropdown && (
                        <div className="assignee-dropdown">
                          {assignableUsers.map(user => (
                            <button
                              key={user.id}
                              className={`assignee-option ${user.id === task.assignee_id ? 'active' : ''}`}
                              onClick={() => {
                                reassignTask(taskId, user.id);
                                setShowAssigneeDropdown(false);
                              }}
                            >
                              <div 
                                className="dropdown-avatar"
                                style={{ background: user.color }}
                              >
                                {user.initials}
                              </div>
                              <div className="dropdown-info">
                                <div className="dropdown-name">{user.name}</div>
                                <div className="dropdown-role">{user.role}</div>
                              </div>
                              {user.id === task.assignee_id && (
                                <span className="current-badge">Current</span>
                              )}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="info-value">
                      {assignee ? (
                        <>
                          <div 
                            className="user-avatar-xs"
                            style={{ background: assignee.color }}
                          >
                            {assignee.initials}
                          </div>
                          {assignee.name}
                        </>
                      ) : (
                        <span className="unassigned">Unassigned</span>
                      )}
                    </div>
                  )}
                </div>
              </div>
              
              <div className="info-item">
                <Calendar size={16} />
                <div>
                  <label>Final Deadline</label>
                  <div className={`info-value ${isOverdue ? 'overdue' : ''}`}>
                    {task.due_date ? format(new Date(task.due_date), 'MMM d, yyyy h:mm a') : 'No deadline'}
                    {isOverdue && <AlertCircle size={14} />}
                  </div>
                </div>
              </div>
              
              <div className="info-item">
                <Clock size={16} />
                <div>
                  <label>Revision Deadline</label>
                  <div className="info-value">
                    {task.revision_deadline ? format(new Date(task.revision_deadline), 'MMM d, yyyy') : 'Not set'}
                  </div>
                </div>
              </div>
              
              <div className="info-item">
                <CheckCircle2 size={16} />
                <div>
                  <label>Approval Deadline</label>
                  <div className="info-value">
                    {task.approval_deadline ? format(new Date(task.approval_deadline), 'MMM d, yyyy') : 'Not set'}
                  </div>
                </div>
              </div>
            </div>
            
            {task.tags?.length > 0 && (
              <div className="info-section">
                <h3>Tags</h3>
                <div className="tags-list">
                  {task.tags.map(tag => (
                    <span key={tag} className="tag">
                      <Tag size={12} />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
            
            <div className="info-section">
              <h3>Status Pipeline</h3>
              <div className="status-pipeline">
                {statuses.map((status, idx) => (
                  <div 
                    key={status.id}
                    className={`pipeline-step ${task.status === status.id ? 'current' : ''} ${
                      statuses.findIndex(s => s.id === task.status) > idx ? 'completed' : ''
                    }`}
                    onClick={() => updateTaskStatus(taskId, status.id)}
                  >
                    <div 
                      className="pipeline-dot"
                      style={{ background: status.color }}
                    />
                    <span className="pipeline-label">{status.label}</span>
                  </div>
                ))}
              </div>
              <p className="pipeline-hint">Click a status to request approval for that step</p>
            </div>
            
            <div className="info-section">
              <h3>Comments ({taskComments.length})</h3>
              <div className="comments-list">
                {taskComments.map(comment => {
                  const commentUser = users.find(u => u.id === comment.user_id);
                  return (
                    <div key={comment.id} className="comment-item">
                      <div 
                        className="comment-avatar"
                        style={{ background: commentUser?.color }}
                      >
                        {commentUser?.initials}
                      </div>
                      <div className="comment-body">
                        <div className="comment-header">
                          <span className="comment-author">{commentUser?.name}</span>
                          <span className="comment-time">
                            {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                          </span>
                          {isAdmin && (
                            <button 
                              className="comment-delete-btn"
                              onClick={() => {
                                if (confirm('Delete this comment?')) {
                                  deleteComment(taskId, comment.id);
                                }
                              }}
                              title="Delete comment"
                            >
                              <Trash2 size={14} />
                            </button>
                          )}
                        </div>
                        <p className="comment-text">{comment.content}</p>
                        {comment.replies?.map(reply => {
                          const replyUser = users.find(u => u.id === reply.user_id);
                          return (
                            <div key={reply.id} className="comment-reply">
                              <div 
                                className="comment-avatar small"
                                style={{ background: replyUser?.color }}
                              >
                                {replyUser?.initials}
                              </div>
                              <div className="reply-body">
                                <span className="reply-author">{replyUser?.name}</span>
                                <p className="reply-text">{reply.content}</p>
                              </div>
                            </div>
                          );
                        })}
                        
                        {/* Reply Section */}
                        {replyingTo === comment.id ? (
                          <div className="reply-input-container">
                            <input
                              type="text"
                              placeholder="Write a reply..."
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              onKeyPress={(e) => {
                                if (e.key === 'Enter' && replyText.trim()) {
                                  handleAddReply(comment.id);
                                }
                              }}
                              className="reply-input"
                              autoFocus
                            />
                            <button 
                              className="reply-send-btn"
                              onClick={() => handleAddReply(comment.id)}
                              disabled={!replyText.trim()}
                            >
                              <Send size={14} />
                            </button>
                            <button 
                              className="reply-cancel-btn"
                              onClick={() => {
                                setReplyingTo(null);
                                setReplyText('');
                              }}
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button 
                            className="reply-btn"
                            onClick={() => {
                              setReplyingTo(comment.id);
                              setReplyText('');
                            }}
                          >
                            Reply
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              
              <div className="comment-input">
                <input
                  type="text"
                  placeholder="Add a comment..."
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleAddComment()}
                />
                <button className="send-btn" onClick={handleAddComment}>
                  <Send size={16} />
                </button>
              </div>
            </div>
          </div>
        )}
        
        {activeTab === 'checklist' && (
          <div className="checklist-tab">
            <div className="checklist-header">
              <h3>Checklist</h3>
              {canEdit && (
                <div className="checklist-add-form">
                  <input
                    type="text"
                    placeholder="Task description..."
                    value={newChecklistItem}
                    onChange={(e) => setNewChecklistItem(e.target.value)}
                    className="checklist-task-input"
                  />
                  <input
                    type="text"
                    placeholder="Assignee (name)"
                    value={newChecklistAssignee}
                    onChange={(e) => setNewChecklistAssignee(e.target.value)}
                    className="checklist-assignee-input"
                  />
                  <button 
                    className="checklist-add-btn"
                    onClick={() => {
                      if (newChecklistItem.trim()) {
                        addChecklistItem(taskId, newChecklistItem, newChecklistAssignee);
                        setNewChecklistItem('');
                        setNewChecklistAssignee('');
                      }
                    }}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              )}
            </div>
            
            {checklistItems.length > 0 ? (
              <div className="checklist-list">
                {checklistItems.map((item) => (
                  <div key={item.id} className={`checklist-item ${item.completed ? 'completed' : ''}`}>
                    <button 
                      className="checklist-checkbox"
                      onClick={() => toggleChecklistItem(taskId, item.id)}
                    >
                      {item.completed ? (
                        <CheckSquare size={20} />
                      ) : (
                        <Square size={20} />
                      )}
                    </button>
                    <div className="checklist-content">
                      <span className="checklist-text">{item.text}</span>
                      <div className="checklist-meta">
                        {item.assignee && (
                          <span className="checklist-assignee">
                            <User size={12} />
                            {item.assignee}
                          </span>
                        )}
                        {item.completed && item.completed_at && (
                          <span className="checklist-completed-time">
                            Completed: {format(new Date(item.completed_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        )}
                        {!item.completed && (
                          <span className="checklist-created-time">
                            Created: {format(new Date(item.created_at), 'MMM d, yyyy HH:mm')}
                          </span>
                        )}
                      </div>
                    </div>
                    {canEdit && (
                      <button 
                        className="checklist-delete"
                        onClick={() => deleteChecklistItem(taskId, item.id)}
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <div className="checklist-empty">
                <CheckSquare size={32} />
                <p>No checklist items yet</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'files' && (
          <div className="files-tab">
            <div className="files-header">
              <h3>Version History</h3>
              <button className="upload-btn" onClick={() => onUploadFile?.(taskId)}>
                <Upload size={14} />
                Upload File
              </button>
            </div>
            
            {files.length > 0 ? (
              <div className="files-list">
                {files.map(file => {
                  const uploader = users.find(u => u.id === file.uploaded_by);
                  return (
                    <div key={file.id} className="file-item">
                      <div className="file-icon">
                        {getFileIcon(file.type)}
                      </div>
                      <div className="file-info">
                        <div className="file-name">{file.filename}</div>
                        <div className="file-meta">
                          <span className="version-badge">v{file.version}</span>
                          <span>{(file.size / 1024 / 1024).toFixed(1)} MB</span>
                          <span>by {uploader?.name}</span>
                          <span>{format(new Date(file.uploaded_at), 'MMM d, HH:mm')}</span>
                        </div>
                        {file.notes && (
                          <p className="file-notes">{file.notes}</p>
                        )}
                      </div>
                      <div className="file-actions">
                        <button 
                          className="file-action-btn"
                          onClick={() => handlePreview(file)}
                          title="Preview file"
                        >
                          <Eye size={14} />
                        </button>
                        <button 
                          className="file-action-btn"
                          onClick={() => handleDownload(file)}
                          title="Download file"
                        >
                          <Download size={14} />
                        </button>
                        {canEdit && (
                          <button 
                            className="file-action-btn delete"
                            onClick={() => handleDeleteFile(file)}
                            title="Delete file"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="files-empty">
                <FileText size={32} />
                <p>No files uploaded yet</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'activity' && (
          <div className="activity-tab">
            <h3>Activity Timeline</h3>
            <div className="activity-list">
              {logs.map(log => {
                const logUser = users.find(u => u.id === log.user_id);
                return (
                  <div key={log.id} className={`activity-item ${log.action}`}>
                    <div className="activity-icon">
                      {getLogIcon(log.action)}
                    </div>
                    <div className="activity-body">
                      <div className="activity-header">
                        <span className="activity-author">{logUser?.name}</span>
                        <span className="activity-time">
                          {format(new Date(log.timestamp), 'MMM d, HH:mm')}
                        </span>
                      </div>
                      {log.notes && (
                        <p className="activity-notes">{log.notes}</p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      
      {/* File Preview Modal */}
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
                  onClick={() => handleDownload(previewFile)}
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

export default TaskDetailPanel;