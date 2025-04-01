from git import Repo
from datetime import datetime
import os

# Chemin vers le dossier du dépôt
REPO_PATH = os.getcwd()

# Initialisation du dépôt
repo = Repo(REPO_PATH)

# Ajout de toutes les modifications
print("📝 Ajout des fichiers modifiés...")
repo.git.add(A=True)

# Création du commit
message = f"🚀 Correction du fichier seo.ts pour déploiement Vercel - {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}"
print(f"🔒 Commit en cours : {message}")
repo.index.commit(message)

# Push vers main
print("📤 Push vers GitHub...")
origin = repo.remote(name="origin")
origin.push(refspec="HEAD:main")

print("✅ Push effectué avec succès ! Vérifie le déploiement sur Vercel.")
