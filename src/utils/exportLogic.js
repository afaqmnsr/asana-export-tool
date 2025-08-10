import { 
  configureAxios, 
  fetchUserInfo, 
  fetchWorkspaces, 
  fetchProjects, 
  fetchTasks, 
  fetchSubtasksBatch, 
  fetchStoriesBatch 
} from './asanaApi';

export const exportAsanaData = async (apiToken, onProgress, exportScope = 'user-only') => {
  try {
    // Configure axios with the API token
    configureAxios(apiToken);
    
    // Step 1: Get user info
    onProgress(1, 6, 'Fetching user information...');
    const user = await fetchUserInfo();
    
    // Step 2: Get all workspaces
    onProgress(2, 6, 'Fetching workspaces...');
    const workspaces = await fetchWorkspaces();
    
    // Step 3: Get projects for all workspaces in parallel
    onProgress(3, 6, 'Fetching projects from all workspaces...');
    const projectPromises = workspaces.map(workspace => 
      fetchProjects(workspace.gid).then(projects => 
        projects.map(project => ({ ...project, workspace: workspace.gid }))
      )
    );
    const allProjects = (await Promise.all(projectPromises)).flat();
    
    // Step 4: Get tasks for all projects in parallel
    onProgress(4, 6, 'Fetching tasks from all projects...');
    const taskPromises = allProjects.map(project => 
      fetchTasks(project.gid).then(tasks => 
        tasks.map(task => ({ ...task, project: project.gid, workspace: project.workspace }))
      )
    );
    const allTasks = (await Promise.all(taskPromises)).flat();
    
    // Filter tasks based on export scope
    let userTasks = allTasks;
    if (exportScope === 'user-only') {
      userTasks = allTasks.filter(task => {
        const isAssignee = task.assignee && task.assignee.gid === user.gid;
        const isCreator = task.created_by && task.created_by.gid === user.gid;
        return isAssignee || isCreator;
      });
      onProgress(4, 6, `Found ${userTasks.length} tasks assigned to or created by you out of ${allTasks.length} total tasks`);
    } else if (exportScope === 'assigned-only') {
      userTasks = allTasks.filter(task => {
        const isAssignee = task.assignee && task.assignee.gid === user.gid;
        return isAssignee;
      });
      onProgress(4, 6, `Found ${userTasks.length} tasks assigned to you out of ${allTasks.length} total tasks`);
    } else if (exportScope === 'completed-assigned') {
      userTasks = allTasks.filter(task => {
        const isAssignee = task.assignee && task.assignee.gid === user.gid;
        const isCompleted = task.completed_at !== null;
        return isAssignee && isCompleted;
      });
      onProgress(4, 6, `Found ${userTasks.length} completed tasks assigned to you out of ${allTasks.length} total tasks`);
    } else {
      onProgress(4, 6, `Exporting all ${allTasks.length} tasks from accessible projects`);
    }
    
    // Step 5: Process subtasks and stories in parallel batches
    onProgress(5, 6, 'Processing subtasks and comments...'); // Updated total steps
    
    const tasksWithSubtasks = userTasks.filter(task => task.num_subtasks > 0);
    const tasksWithStories = userTasks.filter(task => task.num_subtasks > 0 || (task.stories && task.stories.length > 0));
    
    const subtaskBatches = [];
    for (let i = 0; i < tasksWithSubtasks.length; i += 10) { // Chunking
      subtaskBatches.push(tasksWithSubtasks.slice(i, i + 10));
    }
    
    const allSubtasks = [];
    for (let i = 0; i < subtaskBatches.length; i++) {
      const batch = subtaskBatches[i];
      onProgress(5, 6, `Processing subtasks batch ${i + 1}/${subtaskBatches.length}...`);
      const taskIds = batch.map(task => task.gid);
      const subtasks = await fetchSubtasksBatch(taskIds);
      allSubtasks.push(...subtasks.flat());
      
      // Add small delay between batches to avoid rate limiting
      if (i < subtaskBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Filter subtasks based on export scope
    let filteredSubtasks = allSubtasks;
    if (exportScope === 'completed-assigned') {
      filteredSubtasks = allSubtasks.filter(subtask => {
        const isAssignee = subtask.assignee && subtask.assignee.gid === user.gid;
        const isCompleted = subtask.completed_at !== null;
        return isAssignee && isCompleted;
      });
      onProgress(5, 6, `Found ${filteredSubtasks.length} completed subtasks assigned to you out of ${allSubtasks.length} total subtasks`);
    }
    
    const storyBatches = [];
    for (let i = 0; i < tasksWithStories.length; i += 10) { // Chunking
      storyBatches.push(tasksWithStories.slice(i, i + 10));
    }
    
    const allStories = [];
    for (let i = 0; i < storyBatches.length; i++) {
      const batch = storyBatches[i];
      onProgress(5, 6, `Processing stories batch ${i + 1}/${storyBatches.length}...`);
      const taskIds = batch.map(task => task.gid);
      const stories = await fetchStoriesBatch(taskIds);
      allStories.push(...stories.flat());
      
      // Add small delay between batches to avoid rate limiting
      if (i < storyBatches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 200));
      }
    }
    
    // Step 6: Compile final export data
    onProgress(6, 6, 'Compiling export data...');
    const exportData = {
      user,
      workspaces,
      projects: allProjects,
      tasks: userTasks, // Use filtered tasks instead of all tasks
      subtasks: filteredSubtasks, // Use filtered subtasks
      stories: allStories,
      export_timestamp: new Date().toISOString(),
      total_items: userTasks.length + filteredSubtasks.length, // Use filtered task count
      api_calls_made: {
        user_info: 1,
        workspaces: 1,
        projects: workspaces.length,
        tasks: allProjects.length,
        subtasks_batches: subtaskBatches.length,
        stories_batches: storyBatches.length,
        total: 3 + workspaces.length + allProjects.length + subtaskBatches.length + storyBatches.length
      }
    };
    
    return exportData;
    
  } catch (error) {
    throw new Error(`Export failed: ${error.message}`);
  }
};
