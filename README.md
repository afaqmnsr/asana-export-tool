# Asana Data Exporter

A modern React web application for exporting comprehensive Asana data including tasks, subtasks, and comments across all accessible workspaces. Built with React 19 and Vite for optimal performance and developer experience.

## Features

- **Complete Data Export**: Extract tasks, subtasks, comments, projects, and tags
- **Cross-Workspace Coverage**: Access all workspaces you have permissions for
- **Dual Export Formats**: JSON for full data structure, CSV for spreadsheet analysis
- **Real-Time Progress**: Visual feedback during export operations
- **Demo Mode**: Test functionality without requiring an API token
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Secure**: API tokens processed locally, never stored on servers
- **Export Scope Options**: 
  - **Assigned to Me Only** (Default): Export only tasks assigned to you
  - **My Tasks Only**: Export tasks assigned to OR created by you  
  - **All Tasks**: Export every task in projects you can access

## Quick Start

### Prerequisites
- Node.js 16+ 
- Asana Personal Access Token

### Installation
```bash
git clone <repository-url>
cd asana-export-app
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser.

### Getting Your Asana API Token
1. Go to [Asana Developer Console](https://app.asana.com/0/developer-console)
2. Create a new Personal Access Token
3. Copy the token for use in the application

## Usage

### Basic Export
1. Enter your Asana API token in the input field
2. Select your preferred export scope from the options
3. Click "Start Export" to begin data extraction
4. Monitor progress through the real-time progress bar
5. Download results in JSON or CSV format

### Export Scope Options

#### Assigned to Me Only (Default)
- **What it exports**: Only tasks and subtasks assigned to you
- **Best for**: Getting your current workload and responsibilities
- **Excludes**: Tasks you created but assigned to others

#### My Tasks Only
- **What it exports**: Tasks assigned to you OR created by you
- **Best for**: Complete overview of your involvement in projects
- **Includes**: All tasks you're responsible for or initiated

#### Completed Tasks Only
- **What it exports**: Only completed tasks and subtasks assigned to you
- **Best for**: Performance reviews, portfolio building, and completed work analysis
- **Includes**: Tasks and subtasks with completion dates that you were responsible for
- **Excludes**: Incomplete tasks and tasks assigned to others

#### All Tasks
- **What it exports**: Every task in projects you can access
- **Best for**: Team-wide analysis and project overviews
- **Includes**: All tasks regardless of assignment or creation

### Demo Mode
Click "Try Demo Mode" to experience the application with sample data without requiring an API token.

### Export Results
- **JSON Export**: Complete structured data with all relationships preserved
- **CSV Export**: Flat table format with one row per task/subtask
- **Statistics**: Overview of exported data counts and workspace information

## Data Structure

### Exported Fields
- **Task/Subtask**: ID, name, creation date, completion date, due date
- **Assignment**: Assignee information and project associations
- **Relationships**: Projects, tags, parent tasks, subtasks
- **Content**: Notes, comments, and activity history
- **Metadata**: Custom fields, approval status, and resource types

### JSON Export (`asana_export.json`)
```json
{
  "user": { /* user profile information */ },
  "workspaces": [ /* all accessible workspaces */ ],
  "projects": [ /* all projects across workspaces */ ],
  "tasks": [ /* detailed task information */ ],
  "subtasks": [ /* all subtasks */ ],
  "stories": [ /* comments and activity */ ],
  "export_timestamp": "2024-01-01T00:00:00.000Z"
}
```

### CSV Export (`asana_tasks.csv`)
- **Type**: Task or subtask
- **ID**: Unique Asana identifier
- **Name**: Task/subtask title
- **Created/Completed Dates**: Timestamps
- **Due Date**: Deadline information
- **Assignee**: Person responsible
- **Projects**: Associated project names
- **Tags**: Applied labels
- **Description**: Task/subtask description and notes
- **Comments**: All comments and activity history with timestamps and authors
- **Counts**: Subtask and comment counts

## API Optimization & Rate Limiting

The application implements several strategies to handle Asana's API efficiently:

- **Parallel Processing**: Fetches projects and tasks from multiple workspaces simultaneously
- **Batch Operations**: Groups API calls into chunks to minimize overhead
- **Smart Pagination**: Automatically handles Asana's 100-item limit per request
- **Rate Limit Management**: 
  - Automatic retry with exponential backoff
  - Request throttling (max 3 concurrent requests)
  - Respects Asana's `retry-after` headers
  - Visual indicators when handling rate limits
- **Field Optimization**: Retrieves all necessary data in minimal API calls

## Tech Stack

- **Frontend**: React 19 + Vite
- **Styling**: Modern CSS with professional design
- **HTTP Client**: Axios for API requests
- **Data Processing**: PapaParse for CSV generation
- **File Downloads**: FileSaver.js for browser downloads

## Project Structure

```
src/
├── components/           # Reusable UI components
│   ├── Header.jsx      # Application header
│   ├── ApiConfig.jsx   # API token input and export scope controls
│   ├── ProgressSection.jsx # Export progress display
│   ├── ErrorSection.jsx    # Error message display
│   ├── ExportResults.jsx   # Results and download options
│   ├── Footer.jsx      # Application footer
│   └── index.js        # Component exports
├── utils/               # Business logic and utilities
│   ├── asanaApi.js     # Asana API integration
│   ├── dataProcessing.js # Data export and demo data
│   ├── exportLogic.js  # Main export orchestration
│   └── index.js        # Utility exports
├── App.jsx             # Main application container
├── App.css             # Application styles
└── main.jsx            # Application entry point
```

## Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run start        # Alias for preview
npm run clean        # Remove build artifacts
npm run deploy       # Build and preview
```

## Performance & Scalability

- **Small datasets** (< 1000 tasks): Export completes in seconds
- **Medium datasets** (1000-10000 tasks): May take 1-5 minutes
- **Large datasets** (> 10000 tasks): Consider running during off-peak hours
- **Memory efficient**: Processes data in chunks to handle large exports
- **Progress tracking**: Real-time updates on export status

## Troubleshooting

### Common Issues

1. **"Failed to fetch user info"**
   - Verify your API token is correct
   - Check that the token hasn't expired
   - Ensure you have internet connectivity

2. **Export stops midway**
   - Asana may have rate-limited your requests
   - Wait a few minutes and try again
   - Check the browser console for specific error messages

3. **Large exports timeout**
   - The app processes data in chunks
   - For very large datasets, consider breaking into smaller exports

### Browser Compatibility
- **Chrome/Edge**: Full support
- **Firefox**: Full support
- **Safari**: Full support
- **Mobile browsers**: Responsive design supported

## Security Features

- **Local processing**: All data processing happens in your browser
- **No data storage**: API tokens and export data are never stored on servers
- **Secure transmission**: Uses HTTPS for all API communications
- **Token masking**: API tokens are visually masked in the interface

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is open source and available under the MIT License.

## Support

For issues and feature requests, please reach out to afaqmnsr0@gmail.com or use the GitHub issue tracker.

---

**Built with React 19 + Vite**
