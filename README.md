# SMV Operation Master - Windows app (built by GitHub)

You do not need to install anything on your PC. GitHub builds the .exe for you.

## Steps
1. On github.com click **New repository**. Name it (for example `smv-app`) and click **Create repository**.
2. Click **uploading an existing file**. Drag in EVERYTHING from this folder, including the `.github` and `build` folders. Click **Commit changes**.
3. Open the **Actions** tab. The job **Build Windows exe** starts by itself (about 3-5 minutes). Wait for the green tick.
4. Click that finished run. At the bottom, under **Artifacts**, download **SMV-Operation-Master-Windows**. Unzip it.
5. You get two files:
   - `SMV-Operation-Master.exe`: single file, just double-click (no install).
   - `SMV-Operation-Master-Setup.exe`: installs with a Start menu / desktop shortcut.

If Windows says "Windows protected your PC": click **More info**, then **Run anyway**. This appears because the app is not code-signed.

## Where your data is
`Documents\SMV Operation Master\smv_master_db.json` - saved automatically after every change.
A copy of each day is kept in `Documents\SMV Operation Master\daily-copies` (last 30 days).
Use the **Data folder** button in the app to open it.

## In the app
- **Backup**: opens the normal Windows "Save as" window. Choose any folder.
- **Auto-backup**: choose a folder once. The app then writes the daily backup file there by itself.
- **Restore backup...**: load a backup file (also the old smv_master_db.json) to replace the current data.
- First start: the app asks you to load a backup file or start empty.

## Update the app later
Upload the new index.html to the same repository (Add file > Upload files). GitHub builds a new exe automatically.
