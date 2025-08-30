# 🔗 AI Education Platform - VS Code Notion Sync Extension

## 📋 Overview

This VS Code extension provides seamless integration between your development workflow and Notion workspace for the AI Education Platform project. It automatically syncs development progress, tracks metrics, and manages tasks in real-time.

## ✨ Features

### 🤖 Automatic Sync
- **Real-time metrics tracking** - TODO count, TypeScript errors, file counts
- **Task status updates** - Sync commit messages with Notion tasks
- **Auto-creation from TODO comments** - Convert code TODOs to Notion tasks
- **Daily standup reports** - Generate comprehensive project status reports

### 📊 Dashboard Integration
- **Notion Status Panel** - View project metrics directly in VS Code
- **Active tasks display** - See current tasks and their status
- **Critical issues monitoring** - Track and resolve urgent problems
- **Health score calculation** - Overall project health at a glance

### ⌨️ Commands & Shortcuts
- `Ctrl+Shift+N` - Update task status
- `Ctrl+Shift+S` - Generate daily standup report
- Command palette integration for all features

## 🚀 Installation

### Prerequisites
- VS Code 1.60.0 or higher
- Node.js 16+ and npm
- Notion Integration Token
- Access to AI Education Platform Notion workspace

### Build and Install

1. **Navigate to extension directory:**
   ```powershell
   cd vscode-extension
   ```

2. **Install dependencies:**
   ```powershell
   npm install
   ```

3. **Build the extension:**
   ```powershell
   npm run compile
   npm run package
   ```

4. **Install in VS Code:**
   ```powershell
   code --install-extension ai-education-notion-sync-1.0.0.vsix
   ```

### Quick Setup Script
Run the automated setup script:
```powershell
.\scripts\install-and-build.ps1
```

## ⚙️ Configuration

### 1. Notion Integration Token
1. Go to [Notion Integrations](https://www.notion.so/my-integrations)
2. Create a new integration for "AI Education Platform"
3. Copy the Integration Token
4. Add to VS Code settings:
   ```json
   {
     "aiEducation.notionToken": "your_integration_token_here"
   }
   ```

### 2. Database IDs
Configure your Notion database IDs in VS Code settings:
```json
{
  "aiEducation.databases": {
    "tasks": "3237c31d-9462-4560-b53f-bcf5705464e9",
    "metrics": "bced96bd-f065-48e6-8d68-aea1e307e1ed",
    "sprints": "f5f6e55f-55c9-4b7c-9c2b-da71aabf4e4b"
  }
}
```

### 3. Auto-Sync Settings
```json
{
  "aiEducation.autoSync": true,
  "aiEducation.syncInterval": 300
}
```

## 🎯 Usage

### Creating Tasks from TODO Comments
1. Add a TODO comment in your code:
   ```typescript
   // TODO: Add input validation for user registration
   ```
2. Right-click and select "Create Task from TODO"
3. Task automatically appears in your Notion workspace

### Updating Task Status
1. Use `Ctrl+Shift+N` or Command Palette
2. Enter task name
3. Select new status (To Do, In Progress, Review, Done)
4. Status updates in Notion immediately

### Daily Standup Reports
1. Use `Ctrl+Shift+S` or Command Palette
2. Report opens in new document with:
   - Active tasks and their status
   - Critical metrics and issues
   - Project health score
   - File counts and statistics

### Viewing Project Status
1. Open Explorer panel in VS Code
2. Expand "Notion Status" section
3. View real-time metrics, tasks, and issues

## 🔧 Commands

| Command | Shortcut | Description |
|---------|----------|-------------|
| `aiEducation.updateTask` | `Ctrl+Shift+N` | Update task status in Notion |
| `aiEducation.createTaskFromTODO` | - | Create Notion task from TODO comment |
| `aiEducation.generateDailyStandup` | `Ctrl+Shift+S` | Generate daily standup report |
| `aiEducation.syncNow` | - | Manual sync with Notion |

## 📊 Metrics Tracked

### Code Quality
- **TODO Count** - Number of TODO/FIXME/BUG comments
- **TypeScript Error Count** - Active TypeScript compilation errors
- **File Counts** - TypeScript and Python file statistics

### Project Health
- **Overall Health Score** - Calculated from errors and TODOs
- **Critical Issues** - High-priority problems requiring attention
- **Active Tasks** - Current development tasks and their status

## 🔄 GitHub Actions Integration

The extension works with GitHub Actions for automated syncing:

### Workflow Features
- **Commit-based task updates** - Extract task IDs from commit messages
- **PR task creation** - Automatically create review tasks for pull requests
- **Metrics synchronization** - Update code quality metrics on push
- **Team assignment** - Auto-assign tasks based on file changes

### Commit Message Format
Include task IDs in square brackets:
```
[TASK-123] Add user authentication system

This commit implements JWT-based authentication
```

## 🛠️ Development

### Project Structure
```
vscode-extension/
├── src/
│   ├── extension.ts          # Main extension entry point
│   ├── NotionSync.ts         # Notion API integration
│   └── NotionStatusProvider.ts # VS Code tree view provider
├── package.json              # Extension manifest
├── tsconfig.json            # TypeScript configuration
└── scripts/
    └── install-and-build.ps1 # Build automation script
```

### Building from Source
```powershell
# Install dependencies
npm install

# Compile TypeScript
npm run compile

# Watch for changes during development
npm run watch

# Package for distribution
npm run package
```

## 🔒 Security

- **Token Storage** - Notion tokens stored securely in VS Code settings
- **API Rate Limiting** - Respects Notion API rate limits
- **Error Handling** - Graceful degradation when Notion is unavailable
- **Data Privacy** - Only syncs project-related metadata, not code content

## 🐛 Troubleshooting

### Common Issues

**Extension not loading:**
- Check VS Code version (1.60.0+ required)
- Verify extension is enabled in Extensions panel

**Notion sync failing:**
- Verify Integration Token is correct
- Check database IDs in settings
- Ensure integration has access to databases

**Commands not working:**
- Reload VS Code window (`Ctrl+Shift+P` → "Reload Window")
- Check for conflicting keyboard shortcuts

### Debug Mode
Enable debug logging:
```json
{
  "aiEducation.debug": true
}
```

## 📝 License

This extension is part of the AI Education Platform project and follows the same licensing terms.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For issues and questions:
- Create an issue in the main AI Education Platform repository
- Tag issues with `vscode-extension` label
- Include VS Code version and extension logs
