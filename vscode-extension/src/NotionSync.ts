import { Client } from '@notionhq/client';
import * as vscode from 'vscode';

export interface TaskData {
    title: string;
    file: string;
    line: number;
    priority: string;
    team: string;
}

export interface MetricData {
    name: string;
    value: number;
    status?: string;
    lastUpdated?: string;
}

export class NotionSync {
    private notion: Client;
    private config: vscode.WorkspaceConfiguration;
    
    constructor() {
        this.config = vscode.workspace.getConfiguration('aiEducation');
        const token = this.config.get('notionToken') as string;
        
        if (!token) {
            vscode.window.showWarningMessage(
                'لم يتم تعيين Notion Token. يرجى إضافته في الإعدادات / Notion Token not set. Please add it in settings.'
            );
        }
        
        this.notion = new Client({
            auth: token
        });
    }
    
    async updateTaskStatus(taskName: string, status: string): Promise<void> {
        try {
            const databaseId = this.config.get('databases.tasks') as string;
            if (!databaseId) {
                throw new Error('Tasks database ID not configured');
            }
            
            // Find task by name
            const response = await this.notion.databases.query({
                database_id: databaseId,
                filter: {
                    property: 'Task',
                    title: {
                        contains: taskName
                    }
                }
            });
            
            if (response.results.length > 0) {
                const task = response.results[0];
                await this.notion.pages.update({
                    page_id: task.id,
                    properties: {
                        'Status': {
                            select: { name: status }
                        },
                        'Last Updated': {
                            date: { start: new Date().toISOString().split('T')[0] }
                        }
                    }
                });
            } else {
                vscode.window.showWarningMessage(`المهمة غير موجودة: ${taskName} / Task not found: ${taskName}`);
            }
        } catch (error) {
            console.error('Failed to update task:', error);
            vscode.window.showErrorMessage(`فشل في تحديث المهمة / Failed to update task: ${error}`);
        }
    }
    
    async createTask(taskData: TaskData): Promise<void> {
        try {
            const databaseId = this.config.get('databases.tasks') as string;
            if (!databaseId) {
                throw new Error('Tasks database ID not configured');
            }
            
            await this.notion.pages.create({
                parent: { database_id: databaseId },
                properties: {
                    'Task': {
                        title: [{ text: { content: taskData.title } }]
                    },
                    'Status': {
                        select: { name: '📋 To Do' }
                    },
                    'Priority': {
                        select: { name: `📊 ${taskData.priority}` }
                    },
                    'Team': {
                        select: { name: taskData.team }
                    },
                    'Notes': {
                        rich_text: [{
                            text: { 
                                content: `Auto-created from TODO in ${taskData.file}:${taskData.line}` 
                            }
                        }]
                    },
                    'Created Date': {
                        date: { start: new Date().toISOString().split('T')[0] }
                    }
                }
            });
        } catch (error) {
            console.error('Failed to create task:', error);
            vscode.window.showErrorMessage(`فشل في إنشاء المهمة / Failed to create task: ${error}`);
        }
    }
    
    async updateMetric(metricName: string, value: number): Promise<void> {
        try {
            const databaseId = this.config.get('databases.metrics') as string;
            if (!databaseId) {
                throw new Error('Metrics database ID not configured');
            }
            
            const response = await this.notion.databases.query({
                database_id: databaseId,
                filter: {
                    property: 'Metric',
                    title: { contains: metricName }
                }
            });
            
            if (response.results.length > 0) {
                const metric = response.results[0];
                await this.notion.pages.update({
                    page_id: metric.id,
                    properties: {
                        'Current Value': { number: value },
                        'Last Updated': {
                            date: { start: new Date().toISOString().split('T')[0] }
                        }
                    }
                });
            } else {
                // Create new metric if it doesn't exist
                await this.notion.pages.create({
                    parent: { database_id: databaseId },
                    properties: {
                        'Metric': {
                            title: [{ text: { content: metricName } }]
                        },
                        'Current Value': { number: value },
                        'Target Value': { number: 0 },
                        'Status': {
                            select: { name: value > 10 ? '🚨 Critical' : '✅ Good' }
                        },
                        'Last Updated': {
                            date: { start: new Date().toISOString().split('T')[0] }
                        }
                    }
                });
            }
        } catch (error) {
            console.error('Failed to update metric:', error);
        }
    }
    
    async syncMetrics(): Promise<void> {
        try {
            // Get workspace stats
            const workspaceStats = await this.getWorkspaceStats();
            
            // Update each metric
            for (const [metricName, value] of Object.entries(workspaceStats)) {
                await this.updateMetric(metricName, value as number);
            }
            
        } catch (error) {
            console.error('Failed to sync metrics:', error);
            throw error;
        }
    }
    
    private async getWorkspaceStats(): Promise<Record<string, number>> {
        const stats: Record<string, number> = {};
        
        try {
            // Count TypeScript files
            const tsFiles = await vscode.workspace.findFiles('**/*.{ts,tsx}', '**/node_modules/**');
            stats['TypeScript Files'] = tsFiles.length;
            
            // Count Python files
            const pyFiles = await vscode.workspace.findFiles('**/*.py', '**/node_modules/**');
            stats['Python Files'] = pyFiles.length;
            
            // Count TODO comments across all files
            let totalTodos = 0;
            const allFiles = await vscode.workspace.findFiles('**/*.{ts,tsx,py,js,jsx}', '**/node_modules/**');
            
            for (const file of allFiles.slice(0, 50)) { // Limit to first 50 files for performance
                try {
                    const document = await vscode.workspace.openTextDocument(file);
                    const text = document.getText();
                    const todoMatches = text.match(/TODO|FIXME|BUG/gi);
                    if (todoMatches) {
                        totalTodos += todoMatches.length;
                    }
                } catch (error) {
                    // Skip files that can't be read
                }
            }
            
            stats['TODO Count'] = totalTodos;
            
            // Get diagnostic errors
            let totalErrors = 0;
            for (const file of allFiles.slice(0, 20)) { // Limit for performance
                const diagnostics = vscode.languages.getDiagnostics(file);
                const errors = diagnostics.filter(d => d.severity === vscode.DiagnosticSeverity.Error);
                totalErrors += errors.length;
            }
            
            stats['TypeScript Error Count'] = totalErrors;
            
        } catch (error) {
            console.error('Error getting workspace stats:', error);
        }
        
        return stats;
    }
    
    async generateDailyStandup(): Promise<string> {
        try {
            const tasksDb = this.config.get('databases.tasks') as string;
            const metricsDb = this.config.get('databases.metrics') as string;
            
            if (!tasksDb || !metricsDb) {
                return '❌ Database IDs not configured properly';
            }
            
            // Get in-progress tasks
            const tasksResponse = await this.notion.databases.query({
                database_id: tasksDb,
                filter: {
                    property: 'Status',
                    select: { equals: '⏳ In Progress' }
                }
            });
            
            // Get critical metrics
            const metricsResponse = await this.notion.databases.query({
                database_id: metricsDb,
                filter: {
                    property: 'Status',
                    select: { equals: '🚨 Critical' }
                }
            });
            
            const today = new Date().toLocaleDateString('ar-EG', {
                year: 'numeric',
                month: 'long',
                day: 'numeric',
                weekday: 'long'
            });
            
            let report = `# 📊 التقرير اليومي - Daily Standup\n## ${today}\n\n`;
            
            if (tasksResponse.results.length > 0) {
                report += `## 🔄 المهام قيد التنفيذ - Tasks In Progress\n\n`;
                tasksResponse.results.forEach((task: any) => {
                    const name = task.properties.Task?.title?.[0]?.text?.content || 'Unnamed';
                    const team = task.properties.Team?.select?.name || 'Unknown';
                    const priority = task.properties.Priority?.select?.name || 'Medium';
                    report += `- **${name}** (${team}) - ${priority}\n`;
                });
                report += '\n';
            } else {
                report += `## ✅ لا توجد مهام قيد التنفيذ - No Tasks In Progress\n\n`;
            }
            
            if (metricsResponse.results.length > 0) {
                report += `## 🚨 المشاكل الحرجة - Critical Issues\n\n`;
                metricsResponse.results.forEach((metric: any) => {
                    const name = metric.properties.Metric?.title?.[0]?.text?.content || 'Unknown';
                    const value = metric.properties['Current Value']?.number || 0;
                    report += `- **${name}**: ${value}\n`;
                });
                report += '\n';
            } else {
                report += `## ✅ لا توجد مشاكل حرجة - No Critical Issues\n\n`;
            }
            
            // Add workspace stats
            const stats = await this.getWorkspaceStats();
            report += `## 📈 إحصائيات المشروع - Project Statistics\n\n`;
            report += `- **ملفات TypeScript**: ${stats['TypeScript Files'] || 0}\n`;
            report += `- **ملفات Python**: ${stats['Python Files'] || 0}\n`;
            report += `- **تعليقات TODO**: ${stats['TODO Count'] || 0}\n`;
            report += `- **أخطاء TypeScript**: ${stats['TypeScript Error Count'] || 0}\n\n`;
            
            report += `## 🎯 الحالة العامة - Overall Status\n\n`;
            const healthScore = Math.max(0, 100 - (stats['TODO Count'] || 0) - (stats['TypeScript Error Count'] || 0) * 2);
            report += `- **صحة النظام**: ${healthScore}/100 ${healthScore > 80 ? '✅' : healthScore > 60 ? '⚠️' : '🚨'}\n`;
            report += `- **المشاكل الحرجة**: ${metricsResponse.results.length}\n`;
            report += `- **المهام النشطة**: ${tasksResponse.results.length}\n`;
            report += `- **المعلم التالي**: Beta Launch (Sep 15)\n\n`;
            
            report += `---\n*تم إنشاؤه تلقائياً بواسطة VS Code Extension - Generated automatically by VS Code Extension*`;
            
            return report;
            
        } catch (error) {
            console.error('Failed to generate standup:', error);
            return `❌ فشل في إنشاء التقرير اليومي / Failed to generate daily standup report\n\nError: ${error}`;
        }
    }
    
    async getActiveTasks(): Promise<any[]> {
        try {
            const databaseId = this.config.get('databases.tasks') as string;
            if (!databaseId) return [];
            
            const response = await this.notion.databases.query({
                database_id: databaseId,
                filter: {
                    or: [
                        { property: 'Status', select: { equals: '⏳ In Progress' } },
                        { property: 'Status', select: { equals: '👀 Review' } }
                    ]
                },
                sorts: [
                    { property: 'Priority', direction: 'descending' }
                ]
            });
            
            return response.results;
        } catch (error) {
            console.error('Failed to get active tasks:', error);
            return [];
        }
    }
    
    async getCriticalMetrics(): Promise<any[]> {
        try {
            const databaseId = this.config.get('databases.metrics') as string;
            if (!databaseId) return [];
            
            const response = await this.notion.databases.query({
                database_id: databaseId,
                filter: {
                    property: 'Status',
                    select: { equals: '🚨 Critical' }
                }
            });
            
            return response.results;
        } catch (error) {
            console.error('Failed to get critical metrics:', error);
            return [];
        }
    }
}
