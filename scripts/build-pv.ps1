param([Parameter(Mandatory=$true)][string]$Source)
$ErrorActionPreference='Stop'
$repoRoot=Split-Path $PSScriptRoot -Parent
$sourceFile=(Resolve-Path -LiteralPath $Source).Path
$output=Join-Path $repoRoot 'public/media/pv-v2'
New-Item -ItemType Directory -Force -Path $output | Out-Null
$playlist=Join-Path $output 'index.m3u8'
$segments=Join-Path $output 'segment-%03d.m4s'
# Only web derivatives are overwritten. The original film stays untouched.
& ffmpeg -hide_banner -nostdin -y -i $sourceFile -map '0:v:0' -map '0:a:0?' -c:v libx264 -preset fast -crf 21 -maxrate 4500k -bufsize 9000k -threads 4 -pix_fmt yuv420p -g 180 -keyint_min 180 -sc_threshold 0 -c:a copy -sn -dn -f hls -hls_time 6 -hls_playlist_type vod -hls_segment_type fmp4 -hls_fmp4_init_filename init.mp4 -hls_flags independent_segments -hls_segment_filename $segments $playlist
if($LASTEXITCODE -ne 0){throw 'PV网页视频编码失败'}
& ffmpeg -hide_banner -loglevel error -nostdin -y -ss 32 -i $sourceFile -frames:v 1 -vf 'scale=960:-2' -c:v libwebp -quality 85 (Join-Path $output 'poster.webp')
if($LASTEXITCODE -ne 0){throw 'PV封面导出失败'}
$probe=(& ffprobe -v error -show_entries 'format=duration,size:stream=codec_name,width,height,r_frame_rate' -of json $sourceFile | ConvertFrom-Json)
$files=Get-ChildItem -LiteralPath $output -File
$report=[ordered]@{
  sourceName=[IO.Path]::GetFileName($sourceFile)
  sourceSha256=(Get-FileHash -LiteralPath $sourceFile -Algorithm SHA256).Hash.ToLowerInvariant()
  sourceBytes=(Get-Item -LiteralPath $sourceFile).Length
  durationSeconds=[double]$probe.format.duration
  resolution='1920x1080';video='H.264 / CRF21 / capped 4500 kbit/s';audio='Original AAC copied without re-encoding'
  segmentSeconds=6;segmentCount=@($files | Where-Object Extension -eq '.m4s').Count
  outputBytes=($files | Measure-Object Length -Sum).Sum
  largestSegmentBytes=($files | Where-Object Extension -eq '.m4s' | Measure-Object Length -Maximum).Maximum
}
$report | ConvertTo-Json -Depth 4 | Set-Content -LiteralPath (Join-Path $repoRoot 'docs/pv-v2-media.json') -Encoding utf8
if($report.largestSegmentBytes -gt 25MB){throw 'PV分段超过部署单文件限制'}
Write-Output $report
