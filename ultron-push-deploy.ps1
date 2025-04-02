# === CONFIGURATION ULTRON ===
$repoPath = "C:\Users\TCERD\Documents\crediris" # Remplace par ton chemin exact
$branch = "main"
$vercelDeployHookUrl = "https://api.vercel.com/v1/integrations/deploy/prj_ooilWismDDE6pric3dSiAnmTkFVa/XYZ_DEPLOY_HOOK"

# === GO GIT PUSH ===
Write-Host "📦 Déploiement GitHub en cours..."
Set-Location $repoPath
git add .
git commit -m "🔥 Ultron auto push $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git push origin $branch
Write-Host "✅ Push GitHub effectué"

# === TRIGGER VERCEL DEPLOY ===
Write-Host "🚀 Déclenchement déploiement Vercel..."
Invoke-WebRequest -Uri $vercelDeployHookUrl -Method POST | Out-Null
Write-Host "✅ Déploiement Vercel déclenché"

# === ULTRON NOTIF PAR EMAIL ===
$to = "ton-email@domaine.com"
$from = "ultron-bot@xcr.fr"
$smtp = "smtp.gmail.com"
$subject = "✅ ULTRON - Push & Deploy à $(Get-Date -Format 'HH:mm:ss')"
$body = @"
Salut,

Ultron vient de :
✅ Pusher le projet sur GitHub ($branch)
✅ Déclencher le déploiement Vercel

🕒 Heure : $(Get-Date -Format "dd/MM/yyyy HH:mm:ss")

- Repo : https://github.com/XCR-hub/crediris
- Vercel : https://crediris.vercel.app

Ultron, mode EXTERMINATEUR ☠️
"@

Send-MailMessage -To $to -From $from -Subject $subject -Body $body -SmtpServer $smtp -Port 587 -UseSsl -Credential (Get-Credential)

Write-Host "📬 Email envoyé. Fin du déploiement automatique Ultron ✅"
