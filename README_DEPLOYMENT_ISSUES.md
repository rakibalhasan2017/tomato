# Deployment & Runner Troubleshooting Log

This document outlines the issues encountered during the setup of the local CI/CD pipeline and the auth service, logging the diagnostic steps and solutions applied.

## Issue 1: GitHub Actions Job Stuck "Waiting for a runner"

**Problem:**
The `deploy-local` job in the GitHub Actions workflow was perpetually stuck on the message "Waiting for a runner to pick up this job...", despite the self-hosted runner being active on the machine.

**Investigation Steps & Rationale:**
1. **Check if dependency jobs succeeded:** The `deploy-local` job had a `needs: [publish-images]` condition. We first verified if `publish-images` had completed successfully, as the runner wouldn't trigger otherwise. It had succeeded, meaning the issue was with the runner itself.
2. **Check local runner process & logs:** We looked at the active processes (`ps aux | grep Runner.Listener`) and the runner's diagnostic logs (`/home/rakib/actions-runner/_diag/`).
3. **Identify the error:** The logs revealed a critical error: `TaskAgentSessionConflictException: The actions runner rakib-HP-EliteBook-830-G5 already has an active session.`

**Root Cause:**
There was a session conflict. A previous instance of the runner had died or disconnected abruptly, leaving a "stale" active session on GitHub's servers. When the local runner service restarted, GitHub rejected its connection attempts because it thought the old session was still active.

**Solution:**
We had to completely clear the stale session by removing and re-registering the runner:
1. Stopped and uninstalled the existing runner service (`sudo ./svc.sh stop`, `sudo ./svc.sh uninstall`).
2. Removed the runner configuration locally (`./config.sh remove`).
3. Generated a fresh registration token from GitHub Settings.
4. Reconfigured the runner (`./config.sh --url ... --token ...`).
5. Reinstalled and started the service as a background daemon (`sudo ./svc.sh install`, `sudo ./svc.sh start`).
*(Note: After starting, the runner automatically performed a self-update to v2.332.0 and successfully picked up the pending jobs).*

---

## Issue 2: Auth Service "Connection Refused" (Crash-looping)

**Problem:**
After the pipeline successfully deployed the containers, the frontend loaded at `http://localhost:3000`. However, attempting to log in threw a "This site can't be reached / Connection refused" error on port `5000` (`/api/auth/google`).

**Investigation Steps & Rationale:**
1. **Check container status:** Running `docker ps` showed the `auth-service` container was up for only a few seconds, indicating it was crash-looping.
2. **Inspect container logs:** We ran `docker logs auth-service` to see why it was crashing.
3. **Identify the error:** The logs clearly stated: `Error: Missing Google OAuth credentials`.

**Root Cause:**
The Node.js auth service enforces the presence of Google OAuth credentials (`CLIENT_ID`, `CLIENT_SECRET`). While these environment variables were correctly defined in the project root's `.env` file (`/home/rakib/projects/tomato/.env`), they were missing in the environment where the runner was executing `docker compose`. Because `.env` is (correctly) listed in `.gitignore`, the GitHub Actions checkout step didn't pull it into the runner's workspace (`/home/rakib/actions-runner/tomato/tomato/tomato/`). Consequently, `docker compose` launched the auth service without the necessary environment variables, causing it to crash immediately on startup.

**Solution:**
1. **Immediate fix:** Manually copied the `.env` file from the host's project root directory into the runner's active workspace directory and restarted the containers.
2. **Permanent CI/CD fix:** Modified `.github/workflows/action.yml` to include a pre-deployment step that explicitly copies the `.env` file from the host machine to the runner's working directory before triggering the docker containers:
   ```yaml
   - name: Copy environment file
     run: cp /home/rakib/projects/tomato/.env .env
   ```
   This ensures that every future automated deployment has access to the required local credentials.
