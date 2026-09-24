# URL Shortener

A full-stack URL shortener I built using React, Node.js, Express, and MongoDB.

The main idea is simple: take a long URL, generate a short link, and redirect users through the short link. I also added authentication, link management, expiration, and basic click analytics.

## What it can do

* Create an account and log in
* Create short URLs
* Automatically generate unique short codes
* Validate URLs before creating them
* Set an expiration time for a link
* Enable or disable a link
* Delete links
* Track clicks
* View basic analytics
* Copy short URLs from the dashboard
* Rate-limit URL creation requests

## Tech Used

**Frontend**

* React
* React Router
* Axios
* Vite
* CSS

**Backend**

* Node.js
* Express.js
* MongoDB
* Mongoose
* JWT
* bcryptjs
* express-rate-limit

## How it works

```text
React
  |
  | REST API
  v
Express + Node.js
  |
  v
MongoDB
```

There are three main types of data stored in MongoDB:

* Users
* URLs
* Click events

I kept click events in a separate collection instead of storing every click inside the URL document. This keeps the URL document smaller as the number of clicks grows.

## Project Structure

```text
url_shortener/
├── backend/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── authController.js
│   │   └── urlController.js
│   ├── middleware/
│   │   ├── authMiddleware.js
│   │   ├── errorMiddleware.js
│   │   └── rateLimiter.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Url.js
│   │   └── ClickEvent.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   └── urlRoutes.js
│   ├── utils/
│   │   └── generateCode.js
│   ├── .env
│   ├── package.json
│   └── server.js
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   └── ProtectedRoute.jsx
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Login.jsx
│   │   │   └── Register.jsx
│   │   ├── services/
│   │   │   └── api.js
│   │   ├── styles/
│   │   │   ├── app.css
│   │   │   ├── Login.css
│   │   │   ├── Register.css
│   │   │   └── Dashboard.css
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── .env
│   ├── index.html
│   └── package.json
│
└── README.md
```

## Running the project locally

### 1. Clone the repo

```bash
git clone https://github.com/dg2406/url_shortener.git
cd url_shortener
```

### 2. Start the backend

```bash
cd backend
npm install
```

Create a `.env` file inside `backend`:

```env
PORT=8080
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_secret
FRONTEND_URL=http://localhost:5173
```

Then run:

```bash
npm run dev
```

Backend:

```text
http://localhost:8080
```

### 3. Start the frontend

Open another terminal:

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:8080
```

Then:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

## Authentication

The app uses JWT for authentication.

When a user registers:

```text
Register
   ↓
Password hashed with bcrypt
   ↓
User saved in MongoDB
   ↓
JWT generated
   ↓
Dashboard
```

Protected requests include the JWT in the `Authorization` header.

## Creating a short URL

For example, the user can enter:

```text
https://github.com/
```

and get something like:

```text
http://localhost:8080/aB3xYz
```

Opening the short URL redirects to the original URL.

A link can also be given an expiration date. Once it expires, the short URL stops working.

## Analytics

Every time a short URL is opened, a click event is recorded.

The analytics page shows things like:

* Total clicks
* Clicks per day
* Top referrers

The click event also stores information such as the timestamp, user agent, IP address, and referrer.

## API

### Authentication

```text
POST /api/auth/register
POST /api/auth/login
```

### URL management

```text
POST   /api/urls
GET    /api/urls
DELETE /api/urls/:id
PATCH  /api/urls/:id/toggle
GET    /api/urls/:id/analytics
```

### Redirect

```text
GET /:code
```

For example:

```text
http://localhost:8080/aB3xYz
```

## A few things I focused on

While building it, I wanted it to be more than just a basic CRUD project, so I added:

* JWT authentication
* Password hashing
* URL validation
* Expiration support
* Link enable/disable
* Rate limiting
* Separate click-event storage
* Analytics
* Error handling
* Protected user-specific URLs

## Future ideas

Some things I may add later:

* Custom aliases
* QR codes
* Better analytics charts
* Search and filtering
* Pagination
* Automated tests
* Deployment
* Redis caching for high-traffic scenarios

## Author

**Dhruv Goyal**

GitHub: https://github.com/dg2406
