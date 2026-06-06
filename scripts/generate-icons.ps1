param(
  [string]$Source = "assets/kitty-source.jpg",
  [string]$OutDir = "assets/icons"
)

Add-Type -AssemblyName System.Drawing

$sourcePath = Resolve-Path -LiteralPath $Source
$outputPath = Resolve-Path -LiteralPath $OutDir
$src = [System.Drawing.Image]::FromFile($sourcePath)
$sizes = @(32, 180, 192, 512)

function New-RoundedPath([int]$Size, [float]$Radius) {
  $path = [System.Drawing.Drawing2D.GraphicsPath]::new()
  $diameter = $Radius * 2
  $rect = [System.Drawing.RectangleF]::new(0, 0, $Size, $Size)
  $path.AddArc($rect.X, $rect.Y, $diameter, $diameter, 180, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Y, $diameter, $diameter, 270, 90)
  $path.AddArc($rect.Right - $diameter, $rect.Bottom - $diameter, $diameter, $diameter, 0, 90)
  $path.AddArc($rect.X, $rect.Bottom - $diameter, $diameter, $diameter, 90, 90)
  $path.CloseFigure()
  return $path
}

foreach ($size in $sizes) {
  $bitmap = [System.Drawing.Bitmap]::new($size, $size)
  $graphics = [System.Drawing.Graphics]::FromImage($bitmap)
  $graphics.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
  $graphics.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
  $graphics.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality

  $radius = [math]::Round($size * 0.225)
  $clip = New-RoundedPath $size $radius
  $graphics.SetClip($clip)

  $background = [System.Drawing.Drawing2D.LinearGradientBrush]::new(
    [System.Drawing.Point]::new(0, 0),
    [System.Drawing.Point]::new($size, $size),
    [System.Drawing.Color]::FromArgb(255, 255, 118, 132),
    [System.Drawing.Color]::FromArgb(255, 116, 205, 187)
  )
  $graphics.FillRectangle($background, 0, 0, $size, $size)

  $inner = [math]::Round($size * 0.075)
  $cardSize = $size - ($inner * 2)
  $cardPath = New-RoundedPath $cardSize ([math]::Round($cardSize * 0.18))
  $matrix = [System.Drawing.Drawing2D.Matrix]::new()
  $matrix.Translate($inner, $inner)
  $cardPath.Transform($matrix)
  $graphics.FillPath([System.Drawing.SolidBrush]::new([System.Drawing.Color]::FromArgb(248, 255, 255, 255)), $cardPath)

  $targetW = [math]::Round($size * 0.86)
  $targetH = [math]::Round($targetW * ($src.Height / $src.Width))
  if ($targetH -gt [math]::Round($size * 0.76)) {
    $targetH = [math]::Round($size * 0.76)
    $targetW = [math]::Round($targetH * ($src.Width / $src.Height))
  }
  $x = [math]::Round(($size - $targetW) / 2)
  $y = [math]::Round(($size - $targetH) / 2 + ($size * 0.025))
  $graphics.DrawImage($src, [System.Drawing.Rectangle]::new($x, $y, $targetW, $targetH))

  $graphics.ResetClip()
  $pen = [System.Drawing.Pen]::new([System.Drawing.Color]::FromArgb(65, 255, 255, 255), [math]::Max(1, [math]::Round($size * 0.018)))
  $graphics.DrawPath($pen, $clip)

  $file = Join-Path $outputPath "icon-$size.png"
  $bitmap.Save($file, [System.Drawing.Imaging.ImageFormat]::Png)
  if ($size -eq 180) {
    $bitmap.Save((Join-Path $outputPath "apple-touch-icon.png"), [System.Drawing.Imaging.ImageFormat]::Png)
  }

  $pen.Dispose()
  $background.Dispose()
  $graphics.Dispose()
  $bitmap.Dispose()
}

$src.Dispose()
