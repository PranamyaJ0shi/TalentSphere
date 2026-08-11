# TalentSphere AI - Full Stack MERN Interview Preparation SaaS

TalentSphere is a production-ready, high-fidelity SaaS web application built on the MERN stack. The platform helps developers prepare for technical interviews by practicing conceptual programming questions, receiving immediate mock AI performance grades, tracking progress with visual analytics, and saving bookmarks.

---

## 🌟 Key Features

### 👨‍🎓 Student Portal
- **Dashboard Metrics**: Solved questions tracker, daily practice streaks, average evaluation grades, and recent activities.
- **Visual Analytics**: Interactive Recharts tracking weekly practice volume, difficulty splits (Easy, Medium, Hard), and topic completion bars.
- **Bookmarks**: Flag questions for revisions with smooth layout-deletion animations.
- **Answer Workspace**:
  - Word & character counters.
  - LocalStorage draft auto-save (running every 30 seconds) to prevent work loss on refresh.
  - Live count-up timer with pause/reset hooks.
- **Practice History**: An interactive accordion logging previous answer drafts and detailed AI review feedbacks.

### 👩‍💼 Admin Portal
- **Admin Dashboard**: Aggregated analytics tracking user registration rates, question volume, response volume, and platform-wide accuracy.
- **Manage Questions**: CRUD database table with pop-up forms to create, edit, or delete questions.
- **Manage Categories**: Custom role creator to add new interview disciplines dynamically (e.g. MERN, React, Java).
- **Users Directory**: Browse student registration dates and total submission counts.

### 🔒 Enterprise-Grade Security
- **JWT Protection**: Reusable auth gates to guard endpoints.
- **Password Hashing**: Pre-save password hooks utilizing `bcryptjs`.
- **Mongo Sanitizer**: Prevents NoSQL script injections.
- **Rate-Limiting**: Limits login/register routes to 100 requests per 15 minutes to block brute-force attacks.
- **Helmet**: Inject secure HTTP headers.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React.js, Vite, Tailwind CSS, Framer Motion, Recharts, React Hook Form, Axios, React Icons, React Router |
| **Backend** | Node.js, Express.js |
| **Database** | MongoDB Atlas, Mongoose |
| **Security** | JSON Web Tokens, Bcryptjs, Helmet, Express-Rate-Limit, Express-Mongo-Sanitize |

---

## 📂 Project Structure

```text
/
├── server/                     # Backend Node/Express API
│   ├── config/                 # Mongoose Database configuration
│   ├── controllers/            # Request handlers (auth, questions, bookmarks, analytics)
│   ├── middleware/             # Route guards (auth, role checks)
│   ├── models/                 # Mongoose Database Schemas
│   ├── routes/                 # Express API Endpoint mappings
│   ├── utils/                  # Smart AI evaluator algorithm
│   ├── seed.js                 # Database seeder utility
│   ├── server.js               # Entry point
│   └── package.json            # Server dependencies
│
└── client/                     # Frontend React SPA
    ├── src/
    │   ├── assets/             # Assets, images, and styling sheets
    │   ├── components/         # Shared UI elements
    │   ├── context/            # Authentication providers & session handlers
    │   ├── layouts/            # Sidebar dashboard frame
    │   ├── pages/              # Auth, student workspace, history, and admin panels
    │   ├── services/           # Axios instance configuration
    │   ├── index.css           # Custom scrollbars, glass styles, and skeletons
    │   ├── App.jsx             # React Router config
    │   └── main.jsx            # React Hydration
    ├── tailwind.config.js      # Tailwind configurations
    ├── vite.config.js          # Vite config (Backend proxy mapping)
    └── package.json            # Client dependencies
```

---

## 🚀 Getting Started

### 📋 Prerequisites
- Ensure [Node.js](https://nodejs.org/) (v18+) is installed.
- Ensure a [MongoDB](https://www.mongodb.com/) server is running locally or you have access to a MongoDB Atlas cluster URI.

### 🔧 Installation & Setup

1. **Clone the repository**:
   ```bash
   cd TalentSphere
   ```

2. **Configure Backend Environment**:
   Navigate to the `server/` directory:
   ```bash
   cd server
   ```
   Create a `.env` file (you can copy `.env.example` as a template):
   ```env
   PORT=5000
   MONGODB_URI=mongodb://127.0.0.1:27017/talentsphere
   JWT_SECRET=your_production_secret_key_here
   JWT_EXPIRES_IN=7d
   NODE_ENV=development
   ```
   *(If you want to save data on the cloud, replace `MONGODB_URI` with your MongoDB Atlas Cluster URI).*

3. **Install Server Dependencies**:
   ```bash
   npm install
   ```

4. **Seed the Database**:
   Populate your database with the default categories and technical questions:
   ```bash
   node seed.js
   ```

5. **Install Client Dependencies**:
   Navigate to the `client/` directory and run:
   ```bash
   cd ../client
   npm install
   ```

---

## 💻 Running the Application

1. **Start the API Server**:
   ```bash
   cd server
   npm run dev
   ```
   *(Runs the backend server on `http://localhost:5000` with hot-reloading)*

2. **Start the Frontend client**:
   ```bash
   cd client
   npm run dev
   ```
   *(Runs the development server on Vite default `http://localhost:5173`)*

Open your browser and navigate to **`http://localhost:5173`** to access the platform.

---

## 💡 Demo Logins (Seeded Accounts)

| Role | Email Address | Password |
| :--- | :--- | :--- |
| **Admin** | `seedadmin@talentsphere.com` | `admin123` |
| **Student** | `student@talentsphere.com` | `student123` |

You can also use the registration form to create new student or admin accounts instantly.

---

## 🧪 Running Integration Tests
To verify all database triggers, analytical graphs, and grading modules:
1. Ensure the server is running on port 5000.
2. Run the integration test command:
   ```bash
   node server_integration_test.js
   ```
