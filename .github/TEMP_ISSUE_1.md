Currently, FlipTrack has an open issue for importing CSV data, but we also need a way for users to **export** their data. Resellers often need to download their raw Inventory and Sales data at the end of the year for their accountants or for personal backups.

**Expected Behavior:**
1. Add an 'Export to CSV' button to both the Inventory Management page and the Sales Log page.
2. When clicked, generate a CSV file containing the user's data (respecting the Prisma schema: SKU, Name, Brand, Size, Purchase Price, etc.).
3. The file should automatically download to the user's browser.
You can use a library like `papaparse` or `react-csv` to handle the generation on the client, or write a dedicated Remix Resource Route to stream the CSV from the server.

**Difficulty:** 
Beginner
