import os
from git import Repo
from dotenv import dotenv_values
import requests

# Charger les variables d'environnement depuis le fichier .env
env = dotenv_values(".env")

# Chemin du dépôt Git local
REPO_PATH = os.getcwd()
repo = Repo(REPO_PATH)
origin = repo.remote(name='origin')

# Fonctions de push
def auto_push(commit_message):
    print("🚀 Initialisation du push automatique...")

    repo.git.add(A=True)
    print("📄 Fichiers ajoutés à l'index.")

    repo.index.commit(commit_message)
    print("📦 Commit créé.")

    origin.push(refspec="HEAD:main")
    print("✅ Push effectué avec succès sur GitHub.")

def trigger_vercel():
    vercel_token = env.get("VERCEL_TOKEN")
    project_id = env.get("VERCEL_PROJECT_ID")
    org_id = env.get("VERCEL_ORG_ID")

    headers = {
        "Authorization": f"Bearer {vercel_token}",
        "Content-Type": "application/json"
    }

    url = f"https://api.vercel.com/v1/integrations/deploy/prj_{project_id}"

    res = requests.post(
        url,
        headers=headers,
        json={"name": env.get("VERCEL_PROJECT_NAME")}
    )

    if res.status_code == 200:
        print("🚀 Déploiement Vercel déclenché avec succès.")
    else:
        print("❌ Erreur déploiement Vercel :", res.text)

def trigger_stackblitz():
    print("⚙️ Mise à jour StackBlitz déclenchée (si configurée via API / WebContainer).")

# Exécution
if __name__ == "__main__":
    auto_push("🚀 Auto-push Ultron : mise à jour complète avec config Vercel + Stackblitz")
    trigger_vercel()
    trigger_stackblitz()
