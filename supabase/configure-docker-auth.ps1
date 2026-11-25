$ErrorActionPreference = 'Stop'
$stack = 'C:\Users\Sergie\Documents\Codex\2026-11-25\curl-fssl-https-supabase-link-setup\supabase-project'
$compose = Join-Path $stack 'docker-compose.yml'
$envPath = Join-Path $stack '.env'
if (-not (Test-Path -LiteralPath $compose -PathType Leaf) -or -not (Test-Path -LiteralPath $envPath -PathType Leaf)) {
  throw 'The expected Docker Supabase stack was not found.'
}

$original = [IO.File]::ReadAllText($envPath)
$settings = [ordered]@{
  SUPABASE_PUBLIC_URL = 'https://api.jaiyi.me'
  API_EXTERNAL_URL = 'https://api.jaiyi.me/auth/v1'
  SITE_URL = 'https://nerea-travel-adventure.vercel.app'
  ADDITIONAL_REDIRECT_URLS = 'https://nerea-travel-adventure.vercel.app/account,https://nerea-travel-adventure.vercel.app/checkout/*,https://nerea-travel-adventure.vercel.app/reset-password'
  SMTP_ADMIN_EMAIL = 'no-reply@notify.jaiyi.me'
  SMTP_HOST = 'smtp.resend.com'
  SMTP_PORT = '465'
  SMTP_USER = 'resend'
  SMTP_PASS = ''
  SMTP_SENDER_NAME = '"Nerea Travel Adventure"'
}
foreach ($name in $settings.Keys) {
  if ([regex]::Matches($original, '(?m)^' + [regex]::Escape($name) + '=[^\r\n]*').Count -ne 1) {
    throw "Expected one $name setting. No files were changed."
  }
}

$key = Read-Host 'Paste the Resend Sending access key for notify.jaiyi.me' -MaskInput
if ($key -notmatch '^re_[A-Za-z0-9_-]{15,}$') { throw 'The input is not a Resend key. No files were changed.' }
$settings['SMTP_PASS'] = $key
$key = $null
$updated = $original
foreach ($name in $settings.Keys) {
  $updated = [regex]::Replace($updated, '(?m)^' + [regex]::Escape($name) + '=[^\r\n]*', $name + '=' + $settings[$name])
}
$settings['SMTP_PASS'] = $null

$composeArgs = @('compose','--project-directory',$stack,'--file',$compose,'--project-name','supabase')
try {
  [IO.File]::WriteAllText($envPath,$updated)
  $updated = $null
  docker @composeArgs config --quiet
  if ($LASTEXITCODE -ne 0) { throw 'Docker Compose rejected the updated configuration.' }
  docker @composeArgs up --detach --no-deps --force-recreate --wait --wait-timeout 90 auth api-gw
  if ($LASTEXITCODE -ne 0) { throw 'The Auth or gateway service did not start with the new settings.' }
  $authEnvironment = (docker inspect supabase-auth | ConvertFrom-Json).Config.Env
  if ($LASTEXITCODE -ne 0 -or 'GOTRUE_SMTP_HOST=smtp.resend.com' -notin $authEnvironment -or 'API_EXTERNAL_URL=https://api.jaiyi.me/auth/v1' -notin $authEnvironment -or -not ($authEnvironment -match '^GOTRUE_SMTP_PASS=re_[A-Za-z0-9_-]{15,}$')) {
    throw 'The running Auth service did not load the new settings.'
  }
  $authEnvironment = $null
  Write-Output 'Docker Supabase Auth is configured. Return to Codex so the HTTPS endpoint and email delivery can be tested.'
} catch {
  [IO.File]::WriteAllText($envPath,$original)
  docker @composeArgs up --detach --no-deps --force-recreate --wait --wait-timeout 90 auth api-gw
  if ($LASTEXITCODE -ne 0) { throw 'The previous settings were restored on disk, but Docker did not restart them.' }
  throw $_
}
