#!/usr/bin/env pwsh
# NPM EPERM Error Fix Script
# Designed to resolve Windows permission issues with node_modules

Write-Host "=== NPM EPERM Error Fix Script ===" -ForegroundColor Cyan
Write-Host "This script will forcefully remove node_modules and reinstall dependencies" -ForegroundColor Yellow

# Step 1: Stop any running npm/node processes gracefully
Write-Host "`n[Step 1] Checking for running Node.js processes..." -ForegroundColor Green
$nodeProcesses = Get-Process -Name "node" -ErrorAction SilentlyContinue
if ($nodeProcesses) {
    Write-Host "Found running Node.js processes. Attempting to stop them gracefully..." -ForegroundColor Yellow
    foreach ($proc in $nodeProcesses) {
        try {
            $proc.CloseMainWindow()
            Start-Sleep -Seconds 2
            if (!$proc.HasExited) {
                $proc.Kill()
                Write-Host "Forcefully terminated process $($proc.Id)" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "Could not stop process $($proc.Id): $($_.Exception.Message)" -ForegroundColor Red
        }
    }
} else {
    Write-Host "No Node.js processes found" -ForegroundColor Green
}

# Step 2: Forcefully remove node_modules with multiple methods
Write-Host "`n[Step 2] Removing node_modules directory..." -ForegroundColor Green

$nodeModulesPath = "node_modules"
$maxAttempts = 3

for ($attempt = 1; $attempt -le $maxAttempts; $attempt++) {
    Write-Host "Attempt $attempt of $maxAttempts..." -ForegroundColor Yellow
    
    try {
        # Method 1: PowerShell Remove-Item with Force
        if (Test-Path $nodeModulesPath) {
            Remove-Item -Path $nodeModulesPath -Recurse -Force -ErrorAction Stop
            Write-Host "Successfully removed node_modules using PowerShell Remove-Item" -ForegroundColor Green
            break
        } else {
            Write-Host "node_modules directory not found" -ForegroundColor Green
            break
        }
    }
    catch {
        Write-Host "Method 1 failed: $($_.Exception.Message)" -ForegroundColor Red
        
        try {
            # Method 2: Use cmd rmdir with /s /q
            $cmdResult = cmd /c "rmdir /s /q `"$nodeModulesPath`" 2>&1"
            if ($LASTEXITCODE -eq 0) {
                Write-Host "Successfully removed node_modules using cmd rmdir" -ForegroundColor Green
                break
            } else {
                Write-Host "Method 2 failed: $cmdResult" -ForegroundColor Red
            }
        }
        catch {
            Write-Host "Method 2 failed: $($_.Exception.Message)" -ForegroundColor Red
        }
        
        if ($attempt -lt $maxAttempts) {
            Write-Host "Retrying in 3 seconds..." -ForegroundColor Yellow
            Start-Sleep -Seconds 3
        }
    }
}

# Step 3: Remove package-lock.json if it exists (optional but recommended for clean install)
if (Test-Path "package-lock.json") {
    Write-Host "`n[Step 3] Removing package-lock.json for clean install..." -ForegroundColor Green
    Remove-Item -Path "package-lock.json" -Force -ErrorAction SilentlyContinue
    Write-Host "package-lock.json removed" -ForegroundColor Green
}

# Step 4: Clean npm cache
Write-Host "`n[Step 4] Cleaning npm cache..." -ForegroundColor Green
try {
    npm cache clean --force
    Write-Host "npm cache cleaned successfully" -ForegroundColor Green
}
catch {
    Write-Host "npm cache clean failed: $($_.Exception.Message)" -ForegroundColor Yellow
}

# Step 5: Reinstall dependencies
Write-Host "`n[Step 5] Reinstalling dependencies..." -ForegroundColor Green
try {
    npm install
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
}
catch {
    Write-Host "npm install failed: $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "Trying with --force flag..." -ForegroundColor Yellow
    try {
        npm install --force
        Write-Host "Dependencies installed with --force flag!" -ForegroundColor Green
    }
    catch {
        Write-Host "npm install --force also failed: $($_.Exception.Message)" -ForegroundColor Red
        Write-Host "Please check the error messages above and try manually" -ForegroundColor Yellow
    }
}

Write-Host "`n=== Script Complete ===" -ForegroundColor Cyan
Write-Host "If issues persist, consider running as Administrator or using alternative package managers like pnpm" -ForegroundColor Yellow