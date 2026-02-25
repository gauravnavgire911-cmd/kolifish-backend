# KoliFish Backend Cleanup (Drop-in)

## What’s inside
- `server.js` – clean startup flow (connect DB first), structured routes, graceful shutdown.
- `middlewares/errorHandler.js` – proper 404 + JSON error responses.
- `config/db.example.js` – reference DB connector (ONLY if you want to compare).

## How to use in your project
1) Copy:
- `server.js` -> your backend root (replace your existing server.js)
- `middlewares/errorHandler.js` -> `backend/middlewares/errorHandler.js`

2) Make sure your existing db connector export matches:
```js
module.exports = async function connectDB(uri) { ... }
```
and is located at `backend/config/db.js`.

If your db file is elsewhere (example `backend/db.js`), update this line in server.js:
```js
const connectDB = require("./config/db");
```

3) Restart:
```powershell
npm start
```

## Quick tests
- GET http://localhost:5000/   -> "Backend is running ✅"
- GET http://localhost:5000/api/products
- POST http://localhost:5000/api/products/seed
