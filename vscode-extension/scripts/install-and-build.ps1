# AI Education Platform - VS Code Extension Build Script
# This script installs dependencies and builds the extension

Write-Host "🔧 Installing VS Code Extension Dependencies..." -ForegroundColor Cyan

# Navigate to extension directory
Set-Location "vscode-extension"

# Install dependencies
Write-Host "📦 Installing npm dependencies..." -ForegroundColor Yellow
npm install

# Compile TypeScript
Write-Host "🔨 Compiling TypeScript..." -ForegroundColor Yellow
npm run compile

# Package extension
Write-Host "📦 Packaging extension..." -ForegroundColor Yellow
npm run package

Write-Host "✅ Extension built successfully!" -ForegroundColor Green
Write-Host "📁 Extension file: ai-education-notion-sync-1.0.0.vsix" -ForegroundColor Green

Write-Host "`n🚀 To install the extension, run:" -ForegroundColor Cyan
Write-Host "code --install-extension ai-education-notion-sync-1.0.0.vsix" -ForegroundColor White

Write-Host "`n⚙️ Configure your Notion token in VS Code settings:" -ForegroundColor Cyan
Write-Host "File > Preferences > Settings > Search 'aiEducation'" -ForegroundColor White
