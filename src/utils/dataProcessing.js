import Papa from 'papaparse';
import { saveAs } from 'file-saver';

// Demo data for testing without API token
export const demoData = {
  user: {
    gid: "123456789",
    name: "Demo User",
    email: "demo@example.com"
  },
  workspaces: [
    { gid: "w1", name: "Acme Corporation" },
    { gid: "w2", name: "Side Projects" }
  ],
  projects: [
    { gid: "p1", name: "Website Redesign", workspace: "w1" },
    { gid: "p2", name: "Mobile App Development", workspace: "w1" },
    { gid: "p3", name: "Blog Platform", workspace: "w2" }
  ],
  tasks: [
    {
      gid: "t1",
      name: "Design Homepage Layout",
      created_at: "2024-01-01T00:00:00.000Z",
      completed_at: "2024-01-15T00:00:00.000Z",
      due_date: "2024-01-20T00:00:00.000Z",
      assignee: { name: "Demo User" },
      projects: [{ name: "Website Redesign" }],
      tags: [{ name: "design" }, { name: "frontend" }],
      notes: "Create modern, responsive homepage design with improved UX"
    },
    {
      gid: "t2",
      name: "Implement User Authentication",
      created_at: "2024-01-02T00:00:00.000Z",
      completed_at: null,
      due_date: "2024-02-01T00:00:00.000Z",
      assignee: { name: "Demo User" },
      projects: [{ name: "Mobile App Development" }],
      tags: [{ name: "backend" }, { name: "security" }],
      notes: "Implement JWT-based authentication system with refresh tokens"
    },
    {
      gid: "t3",
      name: "Database Schema Design",
      created_at: "2024-01-03T00:00:00.000Z",
      completed_at: "2024-01-25T00:00:00.000Z",
      due_date: "2024-01-30T00:00:00.000Z",
      assignee: { name: "Demo User" },
      projects: [{ name: "Blog Platform" }],
      tags: [{ name: "database" }, { name: "architecture" }],
      notes: "Design normalized database schema for blog posts, users, and comments"
    },
    {
      gid: "t4",
      name: "API Documentation",
      created_at: "2024-01-05T00:00:00.000Z",
      completed_at: "2024-01-28T00:00:00.000Z",
      due_date: "2024-02-05T00:00:00.000Z",
      assignee: { name: "Demo User" },
      projects: [{ name: "Blog Platform" }],
      tags: [{ name: "documentation" }, { name: "api" }],
      notes: "Create comprehensive API documentation with examples"
    }
  ],
  subtasks: [
    {
      gid: "st1",
      name: "Create Wireframes",
      created_at: "2024-01-01T00:00:00.000Z",
      completed_at: "2024-01-05T00:00:00.000Z",
      parent: { gid: "t1" },
      assignee: { name: "Demo User" },
      notes: "Sketch out homepage layout and user flow"
    },
    {
      gid: "st2",
      name: "Design Color Palette",
      created_at: "2024-01-06T00:00:00.000Z",
      completed_at: "2024-01-10T00:00:00.000Z",
      parent: { gid: "t1" },
      assignee: { name: "Demo User" },
      notes: "Select brand colors and create style guide"
    },
    {
      gid: "st3",
      name: "Database Tables Setup",
      created_at: "2024-01-03T00:00:00.000Z",
      completed_at: "2024-01-20T00:00:00.000Z",
      parent: { gid: "t3" },
      assignee: { name: "Demo User" },
      notes: "Create database tables and initial schema"
    },
    {
      gid: "st4",
      name: "API Endpoints Design",
      created_at: "2024-01-05T00:00:00.000Z",
      completed_at: "2024-01-22T00:00:00.000Z",
      parent: { gid: "t4" },
      assignee: { name: "Demo User" },
      notes: "Design RESTful API endpoints structure"
    }
  ],
  stories: [
    {
      gid: "s1",
      resource: { gid: "t1" },
      text: "Homepage design completed and approved by stakeholders",
      created_at: "2024-01-15T00:00:00.000Z",
      created_by: { name: "Demo User" }
    },
    {
      gid: "s2",
      resource: { gid: "t2" },
      text: "Starting implementation of JWT authentication",
      created_at: "2024-01-20T00:00:00.000Z",
      created_by: { name: "Demo User" }
    }
  ]
};

// Download JSON data
export const downloadJSON = (exportData) => {
  const jsonString = JSON.stringify(exportData, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json;charset=utf-8' });
  saveAs(blob, 'asana_export.json');
};

// Download CSV data
export const downloadCSV = (exportData) => {
  const csvData = [];
  
  // Helper function to get comments for a task/subtask
  const getComments = (itemId) => {
    const stories = exportData.stories.filter(s => s.resource?.gid === itemId);
    return stories.map(story => {
      const timestamp = new Date(story.created_at).toLocaleDateString();
      const author = story.created_by?.name || 'Unknown';
      return `[${timestamp} - ${author}] ${story.text}`;
    }).join(' | ');
  };
  
  // Add tasks
  exportData.tasks.forEach(task => {
    csvData.push({
      type: 'Task',
      id: task.gid,
      name: task.name,
      created_at: task.created_at,
      completed_at: task.completed_at,
      due_date: task.due_date,
      assignee: task.assignee ? task.assignee.name : '',
      projects: task.projects ? task.projects.map(p => p.name).join('; ') : '',
      tags: task.tags ? task.tags.map(t => t.name).join('; ') : '',
      description: task.notes || '',
      comments: getComments(task.gid),
      subtask_count: exportData.subtasks.filter(st => st.parent?.gid === task.gid).length,
      story_count: exportData.stories.filter(s => s.resource?.gid === task.gid).length
    });
  });
  
  // Add subtasks
  exportData.subtasks.forEach(subtask => {
    csvData.push({
      type: 'Subtask',
      id: subtask.gid,
      name: subtask.name,
      created_at: subtask.created_at,
      completed_at: subtask.completed_at,
      due_date: subtask.due_date,
      assignee: subtask.assignee ? subtask.assignee.name : '',
      projects: '',
      tags: subtask.tags ? subtask.tags.map(t => t.name).join('; ') : '',
      description: subtask.notes || '',
      comments: getComments(subtask.gid),
      subtask_count: 0,
      story_count: exportData.stories.filter(s => s.resource?.gid === subtask.gid).length
    });
  });
  
  const csv = Papa.unparse(csvData);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' });
  saveAs(blob, 'asana_tasks.csv');
};
