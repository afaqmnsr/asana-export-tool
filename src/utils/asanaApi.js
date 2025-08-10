import axios from 'axios';

// Rate limiting configuration
const RATE_LIMIT_DELAY = 2000; // 2 seconds base delay (more conservative)
const MAX_RETRIES = 5; // Increased retries
const MAX_CONCURRENT_REQUESTS = 3; // Reduced concurrent requests
const BATCH_DELAY = 500; // Delay between batches

// Request queue for throttling
let requestQueue = [];
let activeRequests = 0;

// Helper function to delay execution
const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));

// Helper function to extract rate limit info from response headers
const getRateLimitInfo = (response) => {
  const headers = response.headers;
  return {
    remaining: parseInt(headers['x-ratelimit-remaining'] || '100'),
    limit: parseInt(headers['x-ratelimit-limit'] || '100'),
    reset: parseInt(headers['x-ratelimit-reset'] || '0'),
    retryAfter: parseInt(headers['retry-after'] || '0')
  };
};

// Helper function to handle rate limiting with exponential backoff
const handleRateLimit = async (error, retryCount = 0) => {
  if (error.response?.status === 429 && retryCount < MAX_RETRIES) {
    let backoffDelay = RATE_LIMIT_DELAY * Math.pow(2, retryCount);
    
    // Use retry-after header if available
    if (error.response.headers['retry-after']) {
      backoffDelay = Math.max(backoffDelay, parseInt(error.response.headers['retry-after']) * 1000);
    }
    
    console.log(`Rate limited. Retrying in ${backoffDelay}ms... (attempt ${retryCount + 1}/${MAX_RETRIES})`);
    await delay(backoffDelay);
    return true; // Indicates retry should happen
  }
  return false; // No retry needed
};

// Helper function to throttle requests
const throttleRequest = async (requestFn) => {
  return new Promise((resolve, reject) => {
    const executeRequest = async () => {
      try {
        activeRequests++;
        const result = await requestFn();
        resolve(result);
      } catch (error) {
        reject(error);
      } finally {
        activeRequests--;
        // Process next request in queue
        if (requestQueue.length > 0 && activeRequests < MAX_CONCURRENT_REQUESTS) {
          const nextRequest = requestQueue.shift();
          nextRequest();
        }
      }
    };

    if (activeRequests < MAX_CONCURRENT_REQUESTS) {
      executeRequest();
    } else {
      requestQueue.push(executeRequest);
    }
  });
};

// Helper function to make API calls with retry logic
const makeApiCall = async (requestFn, retryCount = 0) => {
  try {
    return await requestFn();
  } catch (error) {
    if (error.response?.status === 429) {
      const shouldRetry = await handleRateLimit(error, retryCount);
      if (shouldRetry) {
        return makeApiCall(requestFn, retryCount + 1);
      }
    }
    throw error;
  }
};

// Configure axios defaults
const configureAxios = (apiToken) => {
  axios.defaults.headers.common['Authorization'] = `Bearer ${apiToken}`;
  axios.defaults.baseURL = 'https://app.asana.com/api/1.0';
};

// Fetch user information
export const fetchUserInfo = async () => {
  try {
    return await throttleRequest(async () => {
      return await makeApiCall(async () => {
        const response = await axios.get('/users/me');
        return response.data.data;
      });
    });
  } catch (error) {
    throw new Error(`Failed to fetch user info: ${error.message}`);
  }
};

// Fetch all workspaces
export const fetchWorkspaces = async () => {
  try {
    return await throttleRequest(async () => {
      return await makeApiCall(async () => {
        const response = await axios.get('/workspaces');
        return response.data.data;
      });
    });
  } catch (error) {
    throw new Error(`Failed to fetch workspaces: ${error.message}`);
  }
};

// Fetch projects for a workspace with optimized fields
export const fetchProjects = async (workspaceId) => {
  try {
    return await throttleRequest(async () => {
      return await makeApiCall(async () => {
        const response = await axios.get(`/workspaces/${workspaceId}/projects`, {
          params: { 
            opt_fields: 'name,owner,team,color,notes,archived,created_at,modified_at',
            limit: 100
          }
        });
        return response.data.data;
      });
    });
  } catch (error) {
    throw new Error(`Failed to fetch projects for workspace ${workspaceId}: ${error.message}`);
  }
};

// Fetch tasks for a project with ALL needed fields in one call
export const fetchTasks = async (projectId) => {
  try {
    let allTasks = [];
    let offset = null;
    const limit = 100;
    
    do {
      const params = { 
        opt_fields: 'name,created_at,completed_at,due_date,assignee,projects,tags,notes,subtasks,stories,parent,memberships,html_notes,permalink_url,start_on,resource_type,resource_subtype,approval_status,custom_fields,external,hearts,likes,num_hearts,num_likes,num_subtasks,completed_subtasks',
        limit: limit
      };
      
      if (offset) {
        params.offset = offset;
      }
      
      const response = await throttleRequest(async () => {
        return await makeApiCall(async () => {
          return await axios.get(`/projects/${projectId}/tasks`, { params });
        });
      });
      
      const tasks = response.data.data;
      allTasks.push(...tasks);
      
      // Check if there are more pages
      if (response.data.next_page) {
        offset = response.data.next_page.offset;
      } else {
        offset = null;
      }
    } while (offset);
    
    return allTasks;
  } catch (error) {
    throw new Error(`Failed to fetch tasks for project ${projectId}: ${error.message}`);
  }
};

// Fetch subtasks for a task with optimized fields and pagination
export const fetchSubtasks = async (taskId) => {
  try {
    let allSubtasks = [];
    let offset = null;
    const limit = 100;
    
    do {
      const params = { 
        opt_fields: 'name,created_at,completed_at,due_date,assignee,tags,notes,parent,projects,html_notes,permalink_url,start_on,resource_type,resource_subtype,approval_status,custom_fields,external,hearts,likes,num_hearts,num_likes,num_subtasks,completed_subtasks',
        limit: limit
      };
      
      if (offset) {
        params.offset = offset;
      }
      
      const response = await throttleRequest(async () => {
        return await makeApiCall(async () => {
          return await axios.get(`/tasks/${taskId}/subtasks`, { params });
        });
      });
      const subtasks = response.data.data;
      allSubtasks.push(...subtasks);
      
      // Check if there are more pages
      if (response.data.next_page) {
        offset = response.data.next_page.offset;
      } else {
        offset = null;
      }
    } while (offset);
    
    return allSubtasks;
  } catch (error) {
    throw new Error(`Failed to fetch subtasks for task ${taskId}: ${error.message}`);
  }
};

// Fetch stories (comments) for a task with optimized fields and pagination
export const fetchStories = async (taskId) => {
  try {
    let allStories = [];
    let offset = null;
    const limit = 100;
    
    do {
      const params = { 
        opt_fields: 'text,created_at,created_by,resource,resource_type,html_text,type,action_taken,action_taken_at,action_taken_by,old_value,new_value,resource_subtype',
        limit: limit
      };
      
      if (offset) {
        params.offset = offset;
      }
      
      const response = await throttleRequest(async () => {
        return await makeApiCall(async () => {
          return await axios.get(`/tasks/${taskId}/stories`, { params });
        });
      });
      const stories = response.data.data;
      allStories.push(...stories);
      
      // Check if there are more pages
      if (response.data.next_page) {
        offset = response.data.next_page.offset;
      } else {
        offset = null;
      }
    } while (offset);
    
    return allStories;
  } catch (error) {
    throw new Error(`Failed to fetch stories for task ${taskId}: ${error.message}`);
  }
};

// NEW: Batch fetch multiple tasks in parallel
export const fetchTasksBatch = async (taskIds) => {
  try {
    // Asana doesn't support batch task fetching, but we can optimize with Promise.all
    const promises = taskIds.map(taskId => 
      throttleRequest(async () => {
        return await makeApiCall(async () => {
          return await axios.get(`/tasks/${taskId}`, {
            params: { 
              opt_fields: 'name,created_at,completed_at,due_date,assignee,projects,tags,notes,subtasks,stories,parent,memberships,html_notes,permalink_url,start_on,resource_type,resource_subtype,approval_status,custom_fields,external,hearts,likes,num_hearts,num_likes,num_subtasks,completed_subtasks'
            }
          });
        });
      })
    );
    
    const responses = await Promise.all(promises);
    return responses.map(response => response.data.data);
  } catch (error) {
    throw new Error(`Failed to fetch batch tasks: ${error.message}`);
  }
};

// NEW: Batch fetch subtasks for multiple tasks in parallel with pagination
export const fetchSubtasksBatch = async (taskIds) => {
  try {
    const promises = taskIds.map(taskId => 
      fetchSubtasks(taskId) // This now handles pagination automatically
    );
    
    const responses = await Promise.all(promises);
    return responses; // Each response is already the complete list of subtasks
  } catch (error) {
    throw new Error(`Failed to fetch batch subtasks: ${error.message}`);
  }
};

// NEW: Batch fetch stories for multiple tasks in parallel with pagination
export const fetchStoriesBatch = async (taskIds) => {
  try {
    const promises = taskIds.map(taskId => 
      fetchStories(taskId) // This now handles pagination automatically
    );
    
    const responses = await Promise.all(promises);
    return responses; // Each response is already the complete list of stories
  } catch (error) {
    throw new Error(`Failed to fetch batch stories: ${error.message}`);
  }
};

export { configureAxios };
