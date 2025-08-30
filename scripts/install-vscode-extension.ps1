# VS Code Extension Installation Script
# This script finds VS Code installation and installs the Notion sync extension

Write-Host "🔍 Searching for VS Code installation..." -ForegroundColor Cyan

# Common VS Code installation paths
$vscodePathsToCheck = @(
    "$env:LOCALAPPDATA\Programs\Microsoft VS Code\bin\code.cmd",
    "$env:PROGRAMFILES\Microsoft VS Code\bin\code.cmd",
    "${env:PROGRAMFILES(X86)}\Microsoft VS Code\bin\code.cmd",
    "$env:USERPROFILE\AppData\Local\Programs\Microsoft VS Code\bin\code.cmd"
)

$vscodePath = $null

foreach ($path in $vscodePathsToCheck) {
    if (Test-Path $path) {
        $vscodePath = $path
        Write-Host "✅ Found VS Code at: $path" -ForegroundColor Green
        break
    }
}

if (-not $vscodePath) {
    Write-Host "❌ VS Code not found in common locations" -ForegroundColor Red
    Write-Host "Please install VS Code from: https://code.visualstudio.com/" -ForegroundColor Yellow
    exit 1
}

# Check if extension file exists
$extensionPath = "F:\jarv\supernova_main\ai-education-platform\vscode-extension\ai-education-notion-sync-1.0.0.vsix"

if (-not (Test-Path $extensionPath)) {
    Write-Host "❌ Extension file not found at: $extensionPath" -ForegroundColor Red
    Write-Host "Building extension first..." -ForegroundColor Yellow
    
    Set-Location "F:\jarv\supernova_main\ai-education-platform\vscode-extension"
    npm run package
    
    if (-not (Test-Path $extensionPath)) {
        Write-Host "❌ Failed to build extension" -ForegroundColor Red
        exit 1
    }
}

# Install the extension
Write-Host "📦 Installing AI Education Notion Sync extension..." -ForegroundColor Cyan

try {
    & $vscodePath --install-extension $extensionPath --force
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Extension installed successfully!" -ForegroundColor Green
        Write-Host ""
        Write-Host "🎉 Next steps:" -ForegroundColor Cyan
        Write-Host "1. Restart VS Code" -ForegroundColor White
        Write-Host "2. Open your AI Education Platform project" -ForegroundColor White
        Write-Host "3. Check the 'Notion Status' panel in Explorer" -ForegroundColor White
        Write-Host "4. Use Ctrl+Shift+N to update tasks" -ForegroundColor White
        Write-Host "5. Use Ctrl+Shift+S for daily standup" -ForegroundColor White
        Write-Host ""
        Write-Host "⚙️ Configuration is already set in .vscode/settings.json" -ForegroundColor Green
    } else {
        Write-Host "❌ Extension installation failed" -ForegroundColor Red
        exit 1
    }
} catch {
    Write-Host "❌ Error installing extension: $_" -ForegroundColor Red
    exit 1
}
