param(
  [string]$Source = "assets/kitty-source.jpg",
  [string]$OutDir = "assets/icons"
)

Add-Type -AssemblyName System.Drawing

$sourcePath = Resolve-Path -LiteralPath $Source
$outputPath = Resolve-Path -LiteralPath $OutDir
$src = [System.Drawing.Image]::FromFile($sourcePath)
$sizes = @(32, 120, 152, 167, 180, 192, 512)

foreach ($size in $sizes) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $graphics.Clear([System.Drawing.Color]::White)

  $targetW = [math]::Round($size * 0.94)
  $targetH = [math]::Round($targetW * ($src.Height / $src.Width))
  if ($targetH -gt [math]::Round($size * 0.94)) {
    $targetH = [math]::Round($size * 0.94)
    $targetW = [math]::Round($targetH * ($src.Width / $src.Height))
  }
  $x = [math]::Round(($size - $targetW) / 2)
  $y = [math]::Round(($size - $targetH) / 2)
  $graphics.DrawImage($src, [System.Drawing.Rectangle]::new($x, $y, $targetW, $targetH))

  $file = Join-Path $outputPath "icon-$size.png"
  $bitmap.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  if ($size -eq 180) {
    $bitmap.Save((Join-Path $outputPath "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  }

  $graphics.Dispose()
  $bitmap.Dispose()
}

$src.Dispose()
