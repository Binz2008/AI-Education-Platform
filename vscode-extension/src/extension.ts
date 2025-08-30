import * as vscode from 'vscode';
import { NotionSync } from './NotionSync';
import { NotionStatusProvider } from './NotionStatusProvider';

export function activate(context: vscode.ExtensionContext) {
    const notionSync = new NotionSync();
    const statusProvider = new NotionStatusProvider(notionSync);
    
    // Register tree data provider
    vscode.window.registerTreeDataProvider('notionStatus', statusProvider);
    
    // Command 1: Update task status
    const updateTaskCmd = vscode.commands.registerCommand(
        'aiEducation.updateTask',
        async () => {
            const taskName = await vscode.window.showInputBox({
                prompt: 'أدخل اسم المهمة للتحديث / Enter task name to update',
                placeHolder: 'مثال: إعداد قاعدة البيانات'
            });
            
            if (taskName) {
                const status = await vscode.window.showQuickPick([
                    '📋 To Do',
                    '⏳ In Progress', 
                    '👀 Review',
                    '✅ Done'
                ], {
                    placeHolder: 'اختر الحالة الجديدة / Select new status'
                });
                
                if (status) {
                    await notionSync.updateTaskStatus(taskName, status);
                    vscode.window.showInformationMessage(`✅ تم تحديث المهمة: ${taskName}`);
                    statusProvider.refresh();
                }
            }
        }
    );
    
    // Command 2: Create new task from TODO comment
    const createTaskFromTODO = vscode.commands.registerCommand(
        'aiEducation.createTaskFromTODO',
        async (uri?: vscode.Uri, line?: number, text?: string) => {
            const editor = vscode.window.activeTextEditor;
            if (!editor && !uri) {
                vscode.window.showErrorMessage('لا يوجد ملف مفتوح / No active file');
                return;
            }
            
            const document = uri ? await vscode.workspace.openTextDocument(uri) : editor!.document;
            const fileName = document.fileName.split(/[\\/]/).pop() || 'unknown';
            
            // If not provided, try to extract from current line
            if (!text && editor) {
                const currentLine = editor.selection.active.line;
                const lineText = document.lineAt(currentLine).text;
                
                if (lineText.includes('TODO') || lineText.includes('FIXME') || lineText.includes('BUG')) {
                    text = lineText;
                    line = currentLine;
                }
            }
            
            if (!text) {
                text = await vscode.window.showInputBox({
                    prompt: 'أدخل وصف المهمة / Enter task description',
                    placeHolder: 'مثال: إضافة validation للنموذج'
                });
                
                if (!text) return;
            }
            
            const taskData = {
                title: text.replace(/\/\/\s*TODO:?\s*/i, '').replace(/\/\*\s*TODO:?\s*/i, '').replace(/\*\//, '').trim(),
                file: fileName,
                line: (line || 0) + 1,
                priority: 'Medium',
                team: determineTeam(fileName)
            };
            
            await notionSync.createTask(taskData);
            vscode.window.showInformationMessage(`📝 تم إنشاء مهمة جديدة في Notion`);
            statusProvider.refresh();
        }
    );
    
    // Command 3: Generate daily standup
    const dailyStandupCmd = vscode.commands.registerCommand(
        'aiEducation.generateDailyStandup',
        async () => {
            vscode.window.showInformationMessage('🔄 جاري إنشاء التقرير اليومي...');
            
            const report = await notionSync.generateDailyStandup();
            const doc = await vscode.workspace.openTextDocument({
                content: report,
                language: 'markdown'
            });
            await vscode.window.showTextDocument(doc);
            
            vscode.window.showInformationMessage('📊 تم إنشاء التقرير اليومي بنجاح');
        }
    );
    
    // Command 4: Sync now
    const syncNowCmd = vscode.commands.registerCommand(
        'aiEducation.syncNow',
        async () => {
            vscode.window.showInformationMessage('🔄 جاري المزامنة مع Notion...');
            
            try {
                await notionSync.syncMetrics();
                statusProvider.refresh();
                vscode.window.showInformationMessage('✅ تمت المزامنة بنجاح');
            } catch (error) {
                vscode.window.showErrorMessage(`❌ فشل في المزامنة: ${error}`);
            }
        }
    );
    
    // Auto-sync on save
    const onSave = vscode.workspace.onDidSaveTextDocument(async (doc) => {
        const config = vscode.workspace.getConfiguration('aiEducation');
        if (!config.get('autoSync')) return;
        
        if (doc.languageId === 'typescript' || doc.languageId === 'python') {
            // Count errors
            const diagnostics = vscode.languages.getDiagnostics(doc.uri);
            const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
            
            if (errors.length > 0) {
                await notionSync.updateMetric('TypeScript Error Count', errors.length);
            }
            
            // Count TODO comments
            const text = doc.getText();
            const todoMatches = text.match(/TODO|FIXME|BUG/gi);
            const todoCount = todoMatches ? todoMatches.length : 0;
            
            if (todoCount > 0) {
                await notionSync.updateMetric('TODO Count', todoCount);
            }
            
            statusProvider.refresh();
        }
    });
    
    // Status bar item
    const statusBarItem = vscode.window.createStatusBarItem(
        vscode.StatusBarAlignment.Left, 
        100
    );
    statusBarItem.text = "$(sync) Notion";
    statusBarItem.tooltip = "انقر للمزامنة مع Notion / Click to sync with Notion";
    statusBarItem.command = 'aiEducation.syncNow';
    statusBarItem.show();
    
    // Auto-refresh status every 5 minutes
    const refreshInterval = setInterval(() => {
        statusProvider.refresh();
    }, 5 * 60 * 1000);
    
    // Set context for views
    vscode.commands.executeCommand('setContext', 'aiEducation.enabled', true);
    
    context.subscriptions.push(
        updateTaskCmd,
        createTaskFromTODO, 
        dailyStandupCmd,
        syncNowCmd,
        onSave,
        statusBarItem,
        { dispose: () => clearInterval(refreshInterval) }
    );
}

function determineTeam(fileName?: string): string {
    if (!fileName) return 'Backend';
    
    const lowerName = fileName.toLowerCase();
    
    if (lowerName.includes('.tsx') || lowerName.includes('.jsx') || lowerName.includes('frontend')) {
        return 'Frontend';
    }
    if (lowerName.includes('.py') || lowerName.includes('backend')) {
        return 'Backend';
    }
    if (lowerName.includes('docker') || lowerName.includes('.yml') || lowerName.includes('.yaml')) {
        return 'DevOps';
    }
    if (lowerName.includes('test') || lowerName.includes('spec')) {
        return 'QA';
    }
    
    return 'Backend';
}

export function deactivate() {
    // Cleanup if needed
}
