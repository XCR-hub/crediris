import os
from git import Repo
from dotenv import dotenv_values

# 1. Charger les variables d'environnement depuis le .env
env = dotenv_values(".env")
REPO_PATH = os.getcwd()
GITHUB_URL = f"https://{env['GITHUB_TOKEN']}@github.com/{env['GITHUB_USERNAME']}/{env['GITHUB_REPOSITORY']}.git"

def push_to_github():
    print("🚀 Initialisation du push automatique...")

    repo = Repo(REPO_PATH)
    origin = None

    # 2. Ajouter tous les fichiers suivis
    repo.git.add(A=True)
    print("📝 Fichiers ajoutés à l'index.")

    # 3. Commit
    repo.index.commit("🚀 Auto-push Ultron : mise à jour complète")
    print("📦 Commit créé.")

    # 4. Vérifier si l'origine existe
    if "origin" not in repo.remotes:
        origin = repo.create_remote("origin", GITHUB_URL)
        print("🌍 Remote origin configurée.")
    else:
        origin = repo.remotes.origin

    # 5. Push vers main
    origin.push(refspec="HEAD:main")
    print("✅ Push effectué avec succès sur GitHub.")

if __name__ == "__main__":
    push_to_github()
