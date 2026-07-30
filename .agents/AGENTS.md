# Project Rules for Agentic AI

## Change Tracking Protocol (`CHANGE_TRACKER.txt`)

For every feature request, bug fix, or code modification task:

1. **Before making any code changes**:
   - Update `CHANGE_TRACKER.txt` at the root of the repository with:
     - Date & Time
     - Feature / Task Name
     - Files planned to be created/modified
     - Brief reason for each planned file change

2. **While implementing the feature**:
   - Continuously append every file created, modified, renamed, or deleted to the audit trail section in `CHANGE_TRACKER.txt`.

3. **After completing the feature**:
   - Append:
     - Final list of changed files
     - Short summary of work completed
     - Recommended Git commit message

4. **Post-Commit Reset**:
   - `CHANGE_TRACKER.txt` tracks only changes made since the last Git commit.
   - After a successful commit, reset `CHANGE_TRACKER.txt` back to its default clean template so it is ready for the next session.

5. **Constraints**:
   - Keep formatting clean, chronological, structured, and human-readable.
   - Do not track unrelated files or create extra tracking files/folders. Use only `CHANGE_TRACKER.txt`.
