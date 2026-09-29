param(
  [string]$InputDocx = "shangtang-api-test-report.docx",
  [string]$OutputDirectory = "qa-shangtang-docx"
)

$inputPath = (Resolve-Path -LiteralPath $InputDocx).Path
$outputPath = Join-Path (Get-Location) $OutputDirectory
New-Item -ItemType Directory -Force -Path $outputPath | Out-Null
$word = $null
$document = $null
try {
  $word = New-Object -ComObject Word.Application
  $word.Visible = $false
  $word.DisplayAlerts = 0
  $document = $word.Documents.Open($inputPath, $false, $true)
  $pageCount = $document.ComputeStatistics(2)
  for ($page = 1; $page -le $pageCount; $page++) {
    $name = 'page-{0:D3}' -f $page
    $pdfPath = Join-Path $outputPath ($name + '.pdf')
    $pngPath = Join-Path $outputPath $name
    $document.ExportAsFixedFormat($pdfPath, 17, $false, 0, 3, $page, $page)
    & 'D:\texlive\2024\bin\windows\pdftoppm.exe' -singlefile -png -r 120 $pdfPath $pngPath
    Remove-Item -LiteralPath $pdfPath -Force
  }
  Write-Output ("PAGES=" + $pageCount)
} finally {
  if ($document) { $document.Close($false) }
  if ($word) { $word.Quit() }
  if ($document) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($document) | Out-Null }
  if ($word) { [System.Runtime.InteropServices.Marshal]::ReleaseComObject($word) | Out-Null }
  [GC]::Collect()
  [GC]::WaitForPendingFinalizers()
}
