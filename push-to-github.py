from pathlib import Path
from dotenv import dotenv_values
import git

print("🚀 Initialisation du push automatique...")

# Charger les variables d’environnement
env_path = Path(".env")
env = dotenv_values(dotenv_path=env_path)

# Config depuis le .env
repo_name = env.get("GITHUB_REPOSITORY")
username = env.get("GITHUB_USERNAME")
token = env.get("GITHUB_TOKEN")

# URL distante GitHub avec token
repo_url = f"https://{username}:{token}@github.com/{username}/{repo_name}.git"

# Dossier du projet
project_path = Path(".")

# Ouvrir ou init repo
if not (project_path / ".git").exists():
    print("🧱 Dépôt Git non initialisé. Initialisation...")
    repo = git.Repo.init(project_path)
    repo.create_remote("origin", repo_url)
else:
    repo = git.Repo(project_path)
    if "origin" not in [r.name for r in repo.remotes]:
        repo.create_remote("origin", repo_url)

# Ajouter tous les fichiers
repo.git.add(A=True)

# Commit
repo.index.commit("💥 Déploiement automatique Crediris")

# Push vers main
repo.remotes.origin.push(refspec="HEAD:main")

print("✅ Push effectué avec succès sur GitHub.")
