import * as vscode from 'vscode';
import { NotionSync } from './NotionSync';

export class NotionStatusProvider implements vscode.TreeDataProvider<NotionItem> {
    private _onDidChangeTreeData: vscode.EventEmitter<NotionItem | undefined | null | void> = new vscode.EventEmitter<NotionItem | undefined | null | void>();
    readonly onDidChangeTreeData: vscode.Event<NotionItem | undefined | null | void> = this._onDidChangeTreeData.event;
    
    constructor(private notionSync: NotionSync) {}
    
    refresh(): void {
        this._onDidChangeTreeData.fire();
    }
    
    getTreeItem(element: NotionItem): vscode.TreeItem {
        return element;
    }
    
    async getChildren(element?: NotionItem): Promise<NotionItem[]> {
        if (!element) {
            // Root items
            return [
                new NotionItem('📊 مقاييس المشروع', vscode.TreeItemCollapsibleState.Expanded, 'metrics'),
                new NotionItem('📋 المهام النشطة', vscode.TreeItemCollapsibleState.Expanded, 'tasks'),
                new NotionItem('🚨 المشاكل الحرجة', vscode.TreeItemCollapsibleState.Expanded, 'issues')
            ];
        } else {
            // Child items based on parent
            if (element.contextValue === 'metrics') {
                return await this.getMetrics();
            } else if (element.contextValue === 'tasks') {
                return await this.getTasks();
            } else if (element.contextValue === 'issues') {
                return await this.getCriticalIssues();
            }
        }
        return [];
    }
    
    private async getMetrics(): Promise<NotionItem[]> {
        try {
            const stats = await this.getWorkspaceStats();
            const items: NotionItem[] = [];
            
            // Overall health score
            const healthScore = Math.max(0, 100 - (stats.todoCount || 0) - (stats.errorCount || 0) * 2);
            const healthIcon = healthScore > 80 ? '✅' : healthScore > 60 ? '⚠️' : '🚨';
            items.push(new NotionItem(`${healthIcon} صحة النظام: ${healthScore}%`, vscode.TreeItemCollapsibleState.None, 'metric'));
            
            // Individual metrics
            items.push(new NotionItem(`📁 ملفات TS: ${stats.tsFiles}`, vscode.TreeItemCollapsibleState.None, 'metric'));
            items.push(new NotionItem(`🐍 ملفات Python: ${stats.pyFiles}`, vscode.TreeItemCollapsibleState.None, 'metric'));
            items.push(new NotionItem(`📝 تعليقات TODO: ${stats.todoCount}`, vscode.TreeItemCollapsibleState.None, 'metric'));
            items.push(new NotionItem(`❌ أخطاء TS: ${stats.errorCount}`, vscode.TreeItemCollapsibleState.None, 'metric'));
            
            return items;
        } catch (error) {
            return [new NotionItem('❌ فشل في تحميل المقاييس', vscode.TreeItemCollapsibleState.None, 'error')];
        }
    }
    
    private async getTasks(): Promise<NotionItem[]> {
        try {
            const tasks = await this.notionSync.getActiveTasks();
            
            if (tasks.length === 0) {
                return [new NotionItem('✅ لا توجد مهام نشطة', vscode.TreeItemCollapsibleState.None, 'info')];
            }
            
            return tasks.slice(0, 10).map((task: any) => {
                const name = task.properties.Task?.title?.[0]?.text?.content || 'مهمة بدون اسم';
                const status = task.properties.Status?.select?.name || 'غير محدد';
                const team = task.properties.Team?.select?.name || 'فريق غير محدد';
                
                const statusIcon = this.getStatusIcon(status);
                const displayName = `${statusIcon} ${name.substring(0, 30)}${name.length > 30 ? '...' : ''}`;
                
                const item = new NotionItem(displayName, vscode.TreeItemCollapsibleState.None, 'task');
                item.tooltip = `${name}\nالفريق: ${team}\nالحالة: ${status}`;
                return item;
            });
        } catch (error) {
            return [new NotionItem('❌ فشل في تحميل المهام', vscode.TreeItemCollapsibleState.None, 'error')];
        }
    }
    
    private async getCriticalIssues(): Promise<NotionItem[]> {
        try {
            const criticalMetrics = await this.notionSync.getCriticalMetrics();
            
            if (criticalMetrics.length === 0) {
                return [new NotionItem('✅ لا توجد مشاكل حرجة', vscode.TreeItemCollapsibleState.None, 'info')];
            }
            
            return criticalMetrics.map((metric: any) => {
                const name = metric.properties.Metric?.title?.[0]?.text?.content || 'مقياس غير معروف';
                const value = metric.properties['Current Value']?.number || 0;
                
                const item = new NotionItem(`🚨 ${name}: ${value}`, vscode.TreeItemCollapsibleState.None, 'critical');
                item.tooltip = `مقياس حرج: ${name}\nالقيمة الحالية: ${value}`;
                return item;
            });
        } catch (error) {
            return [new NotionItem('❌ فشل في تحميل المشاكل الحرجة', vscode.TreeItemCollapsibleState.None, 'error')];
        }
    }
    
    private getStatusIcon(status: string): string {
        switch (status) {
            case '📋 To Do': return '📋';
            case '⏳ In Progress': return '⏳';
            case '👀 Review': return '👀';
            case '✅ Done': return '✅';
            default: return '📋';
        }
    }
    
    private async getWorkspaceStats(): Promise<{
        tsFiles: number;
        pyFiles: number;
        todoCount: number;
        errorCount: number;
    }> {
        try {
            // Count TypeScript files
            const tsFiles = await vscode.workspace.findFiles('**/*.{ts,tsx}', '**/node_modules/**');
            
            // Count Python files
            const pyFiles = await vscode.workspace.findFiles('**/*.py', '**/node_modules/**');
            
            // Count TODO comments
            let todoCount = 0;
            const allFiles = await vscode.workspace.findFiles('**/*.{ts,tsx,py,js,jsx}', '**/node_modules/**');
            
            for (const file of allFiles.slice(0, 50)) { // Limit for performance
                try {
                    const document = await vscode.workspace.openTextDocument(file);
                    const text = document.getText();
                    const todoMatches = text.match(/TODO|FIXME|BUG/gi);
                    if (todoMatches) {
                        todoCount += todoMatches.length;
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }
            
            // Count diagnostic errors
            let errorCount = 0;
            for (const file of allFiles.slice(0, 20)) { // Limit for performance
                const diagnostics = vscode.languages.getDiagnostics(file);
                const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
                errorCount += errors.length;
            }
            
            return {
                tsFiles: tsFiles.length,
                pyFiles: pyFiles.length,
                todoCount,
                errorCount
            };
        } catch (error) {
            console.error('Error getting workspace stats:', error);
            return { tsFiles: 0, pyFiles: 0, todoCount: 0, errorCount: 0 };
        }
    }
}

class NotionItem extends vscode.TreeItem {
    constructor(
        public readonly label: string,
        public readonly collapsibleState: vscode.TreeItemCollapsibleState,
        public readonly contextValue?: string
    ) {
        super(label, collapsibleState);
        this.tooltip = this.label;
        
        // Set icons based on context
        if (contextValue === 'metrics') {
            this.iconPath = new vscode.ThemeIcon('graph');
        } else if (contextValue === 'tasks') {
            this.iconPath = new vscode.ThemeIcon('checklist');
        } else if (contextValue === 'issues') {
            this.iconPath = new vscode.ThemeIcon('warning');
        } else if (contextValue === 'task') {
            this.iconPath = new vscode.ThemeIcon('circle-outline');
        } else if (contextValue === 'critical') {
            this.iconPath = new vscode.ThemeIcon('error');
        } else if (contextValue === 'metric') {
            this.iconPath = new vscode.ThemeIcon('pulse');
        }
    }
}
