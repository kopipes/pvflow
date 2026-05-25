import React, { useState } from 'react';
import { useTaskStore } from '../../stores/taskStore';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, addMonths, subMonths, startOfWeek, endOfWeek } from 'date-fns';
import {
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
} from 'lucide-react';
import './CalendarView.css';

function CalendarView() {
  const { tasks, statuses, priorities, setSelectedTask, getFilteredTasks } = useTaskStore();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const filteredTasks = getFilteredTasks();
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const calendarStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const calendarEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  
  const days = eachDayOfInterval({ start: calendarStart, end: calendarEnd });
  
  const getTasksForDay = (day) => {
    return filteredTasks.filter(task => {
      if (!task.due_date) return false;
      return isSameDay(new Date(task.due_date), day);
    });
  };
  
  const getPriorityColor = (priorityId) => {
    const priority = priorities.find(p => p.id === priorityId);
    return priority?.color || '#8b8fa3';
  };
  
  const getStatusColor = (statusId) => {
    const status = statuses.find(s => s.id === statusId);
    return status?.color || '#8b8fa3';
  };
  
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));
  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const goToday = () => setCurrentDate(new Date());
  
  const weekDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  
  return (
    <div className="calendar-view">
      <div className="calendar-header">
        <div className="calendar-title">
          <CalendarIcon size={24} />
          <h2>Calendar</h2>
        </div>
        <div className="calendar-nav">
          <button className="nav-btn" onClick={prevMonth}>
            <ChevronLeft size={20} />
          </button>
          <span className="current-month">{format(currentDate, 'MMMM yyyy')}</span>
          <button className="nav-btn" onClick={nextMonth}>
            <ChevronRight size={20} />
          </button>
          <button className="today-btn" onClick={goToday}>Today</button>
        </div>
      </div>
      
      <div className="calendar-grid">
        <div className="weekday-header">
          {weekDays.map(day => (
            <div key={day} className="weekday">{day}</div>
          ))}
        </div>
        
        <div className="days-grid">
          {days.map((day, idx) => {
            const dayTasks = getTasksForDay(day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            
            return (
              <div 
                key={idx} 
                className={`day-cell ${!isCurrentMonth ? 'other-month' : ''} ${isCurrentDay ? 'today' : ''}`}
              >
                <div className="day-number">{format(day, 'd')}</div>
                <div className="day-tasks">
                  {dayTasks.slice(0, 3).map(task => (
                    <button
                      key={task.id}
                      className="task-pill"
                      style={{ 
                        borderLeftColor: getPriorityColor(task.priority),
                        background: getStatusColor(task.status) + '20'
                      }}
                      onClick={() => setSelectedTask(task.id)}
                      title={task.title}
                    >
                      {task.title.substring(0, 15)}{task.title.length > 15 ? '...' : ''}
                    </button>
                  ))}
                  {dayTasks.length > 3 && (
                    <div className="more-tasks">+{dayTasks.length - 3} more</div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      
      <div className="calendar-legend">
        <h3>Priority Legend</h3>
        <div className="legend-items">
          {priorities.map(p => (
            <div key={p.id} className="legend-item">
              <div className="legend-dot" style={{ background: p.color }} />
              <span>{p.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default CalendarView;