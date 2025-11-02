# Running Dashboard

This is a simple React app "Running Dashboard" to record running events (date, distance, duration in minutes+seconds, km/h).  
Data is stored locally in the browser (localStorage). The app includes a dark theme and the user's logo.

## How to run locally

1. Install Node.js (16+ recommended).
2. In the project folder:

```bash 
npm install
npm start
```

Open http://localhost:3000

## Deploy to GitHub Pages

1. Set repository remote and push to GitHub.
2. Ensure `homepage` in package.json is set to `https://<username>.github.io/<repo>`.
3. Run:

```bash
npm run deploy
```

