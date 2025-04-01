from git import Repo
import os

# === CONFIGURATION À PERSONNALISER ===
REPO_PATH = "C:/Users/TCERD/Documents/crediris"  # <-- Mets ici le chemin complet vers ton dossier cloné
COMMIT_MESSAGE = "🚀 Auto-push Ultron: mise à jour complète"
BRANCH = "main"

def push_to_github():
    print("🔍 Initialisation du dépôt local...")
    repo = Repo(REPO_PATH)

    if repo.is_dirty(untracked_files=True):
        print("📦 Ajout de tous les fichiers modifiés/non suivis...")
        repo.git.add(all=True)

        print(f"📝 Commit avec message : {COMMIT_MESSAGE}")
        repo.index.commit(COMMIT_MESSAGE)

        print(f"🚀 Push vers la branche {BRANCH}...")
        origin = repo.remote(name='origin')
        origin.push(refspec=f"{BRANCH}:{BRANCH}")

        print("✅ Push réussi sur GitHub !")
    else:
        print("🔁 Aucun changement à pusher.")

if __name__ == "__main__":
    push_to_github()
