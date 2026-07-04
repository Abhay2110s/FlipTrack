We recently fixed a visual hierarchy bug in the light theme, but users currently have no way to toggle between Light Mode and Dark Mode globally! 
The `settings.tsx` file has a dropdown for Theme, but it isn't fully wired up to persist the user's choice and apply it everywhere.

**Expected Behavior:**
1. Wire up the Theme dropdown in the Settings page to save the user's preference to the database (or a secure cookie).
2. Ensure the `app-layout.tsx` reads this preference on load and applies the `dark` class (or similar CSS variables) to the root element.
3. Add a quick-toggle sun/moon icon button to the top navigation bar so users don't have to go all the way to Settings to switch themes.

**Difficulty:** 
Beginner
