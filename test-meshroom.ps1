# Define paths
$meshroomPath = "C:\Meshroom\Meshroom-2023.3.0-win64\Meshroom-2023.3.0\meshroom_batch.exe"
$inputDir = "C:\MeshroomTest"
$outputDir = "C:\MeshroomTest\output"
$cacheDir = "C:\MeshroomTest\cache"

Write-Host "Cleaning up previous processing..."

# Remove old output and cache
if (Test-Path $outputDir) {
    Remove-Item -Path $outputDir\* -Recurse -Force
}
if (Test-Path $cacheDir) {
    Remove-Item -Path $cacheDir\* -Recurse -Force
}

# Create directories if they don't exist
if (-not (Test-Path $outputDir)) {
    New-Item -ItemType Directory -Path $outputDir
}
if (-not (Test-Path $cacheDir)) {
    New-Item -ItemType Directory -Path $cacheDir
}

Write-Host "Starting Meshroom processing..."
Write-Host "Input directory: $inputDir"
Write-Host "Output directory: $outputDir"

# Run Meshroom with project file
try {
    & "$meshroomPath" --input "$inputDir" --output "$outputDir" --cache "$cacheDir" --save "$outputDir\project.mg" --forceStatus
} catch {
    Write-Host "Error running Meshroom: $_"
    exit 1
}

Write-Host "Processing completed. Check $outputDir for results."