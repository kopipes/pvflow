import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import {
  X,
  Sparkles,
  Wand2,
  FileText,
  Copy,
  ArrowRight,
  Loader2,
} from 'lucide-react';
import './AIFeedbackImport.css';

function AIFeedbackImport({ isOpen, onClose }) {
  const { tasks, users, addComment } = useTaskStore();
  
  const [rawText, setRawText] = useState('');
  const [selectedTask, setSelectedTask] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [parsedFeedback, setParsedFeedback] = useState(null);
  
  if (!isOpen) return null;
  
  const handleParse = async () => {
    if (!rawText.trim() || !selectedTask) return;
    
    setIsProcessing(true);
    
    // Simulate AI processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Mock AI parsing - in real app, this would call an AI API
    const lines = rawText.split('\n').filter(l => l.trim());
    const parsedItems = lines.map((line, idx) => {
      // Simple categorization logic
      const lowerLine = line.toLowerCase();
      let category = 'Content';
      let priority = 'Minor';
      
      if (lowerLine.includes('font') || lowerLine.includes('typography') || lowerLine.includes('text')) {
        category = 'Font';
      } else if (lowerLine.includes('color') || lowerLine.includes('background') || lowerLine.includes('shade')) {
        category = 'Color';
      } else if (lowerLine.includes('layout') || lowerLine.includes('position') || lowerLine.includes('spacing')) {
        category = 'Layout';
      } else if (lowerLine.includes('logo')) {
        category = 'Logo';
      } else if (lowerLine.includes('cta') || lowerLine.includes('button') || lowerLine.includes('link')) {
        category = 'CTA';
      }
      
      if (lowerLine.includes('critical') || lowerLine.includes('urgent') || lowerLine.includes('must') || lowerLine.includes('immediately')) {
        priority = 'Critical';
      } else if (lowerLine.includes('major') || lowerLine.includes('important') || lowerLine.includes('should')) {
        priority = 'Major';
      } else if (lowerLine.includes('minor') || lowerLine.includes('small') || lowerLine.includes('optional')) {
        priority = 'Minor';
      }
      
      return {
        id: `f${idx + 1}`,
        text: line,
        category,
        priority,
        addressed: false,
      };
    });
    
    setParsedFeedback(parsedItems);
    setIsProcessing(false);
  };
  
  const toggleAddressed = (itemId) => {
    setParsedFeedback(prev => prev.map(item => 
      item.id === itemId ? { ...item, addressed: !item.addressed } : item
    ));
  };
  
  const handleApply = () => {
    if (!selectedTask || !parsedFeedback) return;
    
    const feedbackText = parsedFeedback
      .filter(item => !item.addressed)
      .map(item => `[${item.category} - ${item.priority}] ${item.text}`)
      .join('\n\n');
    
    if (feedbackText) {
      addComment(selectedTask, `AI Parsed Feedback:\n\n${feedbackText}`);
    }
    
    handleClose();
  };
  
  const handleClose = () => {
    setRawText('');
    setSelectedTask('');
    setParsedFeedback(null);
    onClose();
  };
  
  const handleSampleText = () => {
    setRawText(`The homepage banner looks mostly good, but a few things need attention:

The main headline font is too light - can we make it bolder?
Colors are slightly off from our brand guidelines
The CTA button position needs to be moved down a bit
Critical: the mobile version is broken on iPhone
Logo placement on the left seems a bit too far from the edge
Can we try a different layout for the hero section?`); 
  };
  
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return 'var(--accent-red)';
      case 'Major': return 'var(--accent-amber)';
      default: return 'var(--accent-blue)';
    }
  };
  
  const getCategoryColor = (category) => {
    const colors = {
      Font: '#8b5cf6',
      Color: '#06b6d4',
      Layout: '#4f7cff',
      Logo: '#f59e0b',
      CTA: '#22c55e',
      Content: '#8b8fa3',
    };
    return colors[category] || colors.Content;
  };
  
  return (
    <div className="modal-overlay" onClick={handleClose}>
      <div className="modal-container ai-modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div className="header-title">
            <Sparkles size={20} className="ai-icon" />
            <h2>AI Feedback Import</h2>
          </div>
          <button className="close-btn" onClick={handleClose}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body">
          {!parsedFeedback ? (
            <>
              <div className="intro-text">
                <p>Paste feedback from WhatsApp, email, or any text source. Our AI will parse and categorize it into structured revision notes.</p>
              </div>
              
              <div className="form-group">
                <label>Select Task</label>
                <select
                  value={selectedTask}
                  onChange={(e) => setSelectedTask(e.target.value)}
                >
                  <option value="">Choose a task...</option>
                  {tasks.map(task => (
                    <option key={task.id} value={task.id}>
                      {task.title}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <div className="label-row">
                  <label>Feedback Text</label>
                  <button className="sample-btn" onClick={handleSampleText}>
                    <Copy size={12} />
                    Load Sample
                  </button>
                </div>
                <textarea
                  value={rawText}
                  onChange={(e) => setRawText(e.target.value)}
                  placeholder="Paste feedback here...&#10;&#10;Example:&#10;The banner looks great but the font is too light.&#10;Can we change the background color to blue?&#10;CTA button needs to be bigger."
                  rows={8}
                />
              </div>
              
              <div className="ai-hint">
                <Wand2 size={14} />
                <span>AI will identify: Category, Priority, and specific instructions from your feedback</span>
              </div>
            </>
          ) : (
            <div className="parsed-results">
              <div className="results-header">
                <h3>Parsed Feedback ({parsedFeedback.length} items)</h3>
                <p className="results-desc">Review and uncheck items you want to skip before applying</p>
              </div>
              
              <div className="feedback-list">
                {parsedFeedback.map((item, idx) => (
                  <div 
                    key={item.id} 
                    className={`feedback-item ${item.addressed ? 'addressed' : ''}`}
                  >
                    <button 
                      className="checkbox"
                      onClick={() => toggleAddressed(item.id)}
                    >
                      {item.addressed ? '✓' : ''}
                    </button>
                    <div className="feedback-content">
                      <div className="feedback-tags">
                        <span 
                          className="category-tag"
                          style={{ background: getCategoryColor(item.category) }}
                        >
                          {item.category}
                        </span>
                        <span 
                          className="priority-tag"
                          style={{ color: getPriorityColor(item.priority) }}
                        >
                          {item.priority}
                        </span>
                      </div>
                      <p className="feedback-text">{item.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="modal-footer">
          <button className="btn-secondary" onClick={handleClose}>
            Cancel
          </button>
          {!parsedFeedback ? (
            <button 
              className="btn-primary"
              onClick={handleParse}
              disabled={!rawText.trim() || !selectedTask || isProcessing}
            >
              {isProcessing ? (
                <>
                  <Loader2 size={16} className="spinner" />
                  Processing...
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  Parse Feedback
                </>
              )}
            </button>
          ) : (
            <button className="btn-primary" onClick={handleApply}>
              <ArrowRight size={16} />
              Apply to Task
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIFeedbackImport;