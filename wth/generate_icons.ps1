Add-Type -AssemblyName System.Drawing

$sourcePath = "D:\Android-Development\wth\src\assets\logo.png"
$resPath = "D:\Android-Development\wth\android\app\src\main\res"

$configurations = @(
    @{ Name = "mipmap-mdpi"; Size = 48 }
    @{ Name = "mipmap-hdpi"; Size = 72 }
    @{ Name = "mipmap-xhdpi"; Size = 96 }
    @{ Name = "mipmap-xxhdpi"; Size = 144 }
    @{ Name = "mipmap-xxxhdpi"; Size = 192 }
)

Write-Host "Loading source image from $sourcePath..."
if (-not (Test-Path $sourcePath)) {
    Write-Error "Source image not found!"
    exit 1
}

$sourceImage = [System.Drawing.Image]::FromFile($sourcePath)

foreach ($config in $configurations) {
    $size = $config.Size
    $folder = $config.Name
    $destFolder = Join-Path $resPath $folder
    
    Write-Host "Processing $folder ($size x $size)..."

    # Create resized square image
    $resized = new-object System.Drawing.Bitmap($size, $size)
    $graph = [System.Drawing.Graphics]::FromImage($resized)
    $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    $rect = new-object System.Drawing.Rectangle(0, 0, $size, $size)
    $graph.DrawImage($sourceImage, $rect)
    
    # Save standard icon
    $destPath1 = Join-Path $destFolder "ic_launcher.png"
    $resized.Save($destPath1, [System.Drawing.Imaging.ImageFormat]::Png)
    
    # Create round image (simple circle crop)
    $round = new-object System.Drawing.Bitmap($size, $size)
    $graphRound = [System.Drawing.Graphics]::FromImage($round)
    $graphRound.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality
    $graphRound.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
    $graphRound.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
    
    $path = new-object System.Drawing.Drawing2D.GraphicsPath
    $path.AddEllipse($rect)
    $graphRound.SetClip($path)
    $graphRound.DrawImage($sourceImage, $rect)

    # Save round icon
    $destPath2 = Join-Path $destFolder "ic_launcher_round.png"
    $round.Save($destPath2, [System.Drawing.Imaging.ImageFormat]::Png)

    $graph.Dispose()
    $resized.Dispose()
    $graphRound.Dispose()
    $round.Dispose()
}

$sourceImage.Dispose()
Write-Host "Icon generation complete."
