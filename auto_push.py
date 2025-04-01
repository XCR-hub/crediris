import os
import subprocess
import requests
from dotenv import load_dotenv

# Load environment variables from .env file
load_dotenv()

# --- GitHub Configuration ---
GH_USER   = os.getenv("GITHUB_USERNAME")
GH_REPO   = os.getenv("GITHUB_REPO")
GH_TOKEN  = os.getenv("GITHUB_TOKEN")
GIT_BRANCH = "main"  # Branch to push to; change if using a different branch.

# --- Vercel Configuration ---
VERCEL_TOKEN       = os.getenv("VERCEL_TOKEN")
VERCEL_PROJECT_NAME = os.getenv("VERCEL_PROJECT_NAME")
VERCEL_ORG_ID      = os.getenv("VERCEL_ORG_ID")      # Team/Org ID (if applicable)
VERCEL_PROJECT_ID  = os.getenv("VERCEL_PROJECT_ID")  # Project ID (not used directly in API call here)

# --- StackBlitz Configuration ---
STACKBLITZ_CLIENT_ID = os.getenv("STACKBLITZ_CLIENT_ID")

# --- Other Config (Supabase, AFI ESCA, etc.) ---
# These are loaded for completeness; they might be used by your application elsewhere.
SUPABASE_URL     = os.getenv("VITE_SUPABASE_URL")
SUPABASE_ANON_KEY = os.getenv("VITE_SUPABASE_ANON_KEY")
SUPABASE_SERVICE_ROLE_KEY = os.getenv("VITE_SUPABASE_SERVICE_ROLE_KEY")
AFI_ESCA_WSDL_URL = os.getenv("VITE_AFI_ESCA_WSDL_URL")
AFI_ESCA_LOGIN    = os.getenv("VITE_AFI_ESCA_LOGIN")
AFI_ESCA_PASSWORD = os.getenv("VITE_AFI_ESCA_PASSWORD")
AFI_ESCA_PARTNER_ID = os.getenv("VITE_AFI_ESCA_PARTNER_ID")
GA_TRACKING_ID    = os.getenv("VITE_GA_TRACKING_ID")
APP_URL           = os.getenv("VITE_APP_URL")

# 1. GitHub: Add, Commit, and Push changes
try:
    # Configure git to use the token for authentication (avoid manual prompt)
    subprocess.run(
        ["git", "remote", "set-url", "origin", 
         f"https://{GH_USER}:{GH_TOKEN}@github.com/{GH_USER}/{GH_REPO}.git"],
        check=True
    )
    # Check for any pending changes
    status_result = subprocess.run(
        ["git", "status", "--porcelain"], capture_output=True, text=True
    )
    if status_result.returncode != 0:
        print("Error checking git status.")
        status_result.check_returncode()
    changes = status_result.stdout.strip()
    if changes:
        # Stage all changes and commit
        subprocess.run(["git", "add", "--all"], check=True)
        commit_msg = "Automated commit by auto_push.py"
        subprocess.run(["git", "commit", "-m", commit_msg], check=True)
        # Push to the specified branch
        subprocess.run(["git", "push", "origin", GIT_BRANCH], check=True)
        print(f"Changes pushed to GitHub repository {GH_USER}/{GH_REPO} on branch {GIT_BRANCH}.")
    else:
        print("No changes to commit; GitHub push step skipped.")
except subprocess.CalledProcessError as e:
    print(f"GitHub push failed: {e}")
    # You might want to exit or handle the error here
    # exit(1)

# 2. Vercel: Trigger a deployment via Vercel API
if VERCEL_TOKEN and VERCEL_PROJECT_NAME:
    headers = {"Authorization": f"Bearer {VERCEL_TOKEN}"}
    deploy_url = "https://api.vercel.com/v13/deployments"
    # If an organization/team ID is provided, include it as a query parameter
    if VERCEL_ORG_ID:
        deploy_url += f"?teamId={VERCEL_ORG_ID}"
    # Prepare deployment payload to trigger a new build from the GitHub repo
    payload = {
        "name": VERCEL_PROJECT_NAME,
        "gitSource": {
            "type": "github",
            "org": GH_USER,
            "repo": GH_REPO,
            "ref": GIT_BRANCH
        },
        "target": "production"
    }
    try:
        response = requests.post(deploy_url, headers=headers, json=payload)
        if response.status_code in (200, 201):
            deploy_data = response.json()
            deploy_id = deploy_data.get("id", "<unknown>")
            deploy_status = deploy_data.get("status", "<unknown>")
            print(f"Vercel deployment triggered (ID: {deploy_id}, initial status: {deploy_status}).")
        else:
            print(f"Vercel deployment trigger failed (HTTP {response.status_code}).")
            print(f"Response: {response.text}")
    except Exception as e:
        print(f"Error during Vercel API call: {e}")
else:
    print("Vercel deployment skipped (missing token or project name).")

# 3. StackBlitz: Trigger update (if applicable)
if STACKBLITZ_CLIENT_ID:
    # If your StackBlitz project is connected to the GitHub repo, it will update automatically on push.
    # Optionally, you can open a StackBlitz embed URL to force a refresh in the browser.
    try:
        import webbrowser
        sb_url = f"https://stackblitz.com/github/{GH_USER}/{GH_REPO}"
        webbrowser.open(sb_url)
        print("StackBlitz project opened in browser for update (ensure auto-sync is enabled on StackBlitz).")
    except Exception as e:
        print(f"StackBlitz update step failed: {e}")
else:
    print("StackBlitz update skipped (no client ID provided).")
