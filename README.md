# 🩸 Sweety – Blood Glucose Tracker

A full-stack web application that helps users record, manage, and monitor their daily blood glucose readings. Users can securely register, log in, maintain their glucose records, and view daily and monthly reports.

Built as a full-stack development assignment using **React, Node.js, Express.js, and PostgreSQL**.

---

## 📌 Project Overview

Sweety is designed to make daily blood glucose tracking simple and organized.

Users can:
- Create an account and log in securely.
- Add daily blood glucose readings.
- View, edit, and delete their readings.
- Track readings across four daily time slots.
- Generate daily, month-to-date, and previous-month reports.
- View statistics such as highest, lowest, average, and total readings.

Each user's readings are protected so that users can access only their own records.

---

## ✨ Features

### 1. User Authentication
- User registration with name, email, and password.
- Secure password hashing using bcrypt.
- Login authentication using JSON Web Tokens (JWT).
- Protected API routes.
- User-specific data access.
- Logout functionality.

### 2. Blood Glucose Management

Users can perform CRUD operations:

- Add a new glucose reading.
- View all their readings.
- Edit an existing reading.
- Delete a reading.

Each reading contains:
- Reading date.
- Time slot.
- Blood glucose value in mg/dL.

**Supported time slots:**
1. Morning (fasting)
2. After breakfast
3. After lunch
4. After dinner

### 3. Input Validation

The application includes validation to maintain accurate records:

- Glucose value is required.
- Glucose value must be an integer.
- Allowed glucose range: 40–600 mg/dL.
- Only one reading is allowed per time slot per day.
- Maximum of four readings per day.
- Future dates are not allowed.
- Required fields are validated.
- Clear error messages are displayed for invalid inputs.

Database constraints provide additional protection against invalid and duplicate records.

### 4. Reports and Statistics

The application provides three types of reports.

**Daily Report**
- Displays readings for a selected date.
- Highest glucose value.
- Lowest glucose value.
- Average glucose value (rounded to one decimal place).
- Total number of readings.
- Individual reading details and time slots.

**Month-to-Date Report**
- Displays readings from the first day of the selected month up to the selected date.
- Shows highest, lowest, average, and total readings.

**Monthly Report**
- Displays statistics for the complete previous calendar month.
- Shows highest, lowest, average, and total readings.

The application also displays a friendly message when no readings are available.

---

## 🛠️ Technology Stack

### Frontend
- React.js
- JavaScript
- Vite
- React Router
- Axios
- CSS
- Lucide React

### Backend
- Node.js
- Express.js
- JavaScript
- bcrypt
- JSON Web Token (JWT)
- CORS
- dotenv

### Database
- PostgreSQL
- Neon (cloud PostgreSQL database)
- pg (Node.js PostgreSQL client)

### Testing
- Jest
- Supertest

### Development Tools
- Visual Studio Code
- Git
- GitHub
- npm

---

## 📁 Project Structure

```text
Sweety-Blood-Glucose-Tracker/
│
├── backend/
│   ├── config/
│   ├── middleware/
│   ├── routes/
│   ├── tests/
│   ├── .env.example
│   ├── package.json
│   ├── seed.js
│   └── server.js
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── api.js
│   │   └── ...
│   ├── package.json
│   └── index.html
│
├── .gitignore
└── README.md
```

---

## ⚙️ Prerequisites

Install the following before running the application:

- Node.js (LTS version recommended)
- npm
- PostgreSQL database
- Visual Studio Code (recommended)

A Neon PostgreSQL database can also be used instead of a locally installed PostgreSQL server.

---

## 🚀 Installation and Setup

### Step 1: Clone the Repository

```bash
git clone https://github.com/OmkarBadiger031/Sweety-Blood-Glucose-Tracker.git
```

Navigate into the project directory:

```bash
cd Sweety-Blood-Glucose-Tracker
```

### Step 2: Database Setup

Create a PostgreSQL database for the application.

For a new database, execute the following SQL commands using PostgreSQL or the Neon SQL Editor:

```sql
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE readings (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    reading_date DATE NOT NULL,
    time_slot VARCHAR(50) NOT NULL,
    value INTEGER NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_user_reading_slot
    UNIQUE (user_id, reading_date, time_slot),

    CONSTRAINT valid_time_slot
    CHECK (
        time_slot IN (
            'Morning (fasting)',
            'After breakfast',
            'After lunch',
            'After dinner'
        )
    ),

    CONSTRAINT valid_glucose_value
    CHECK (value BETWEEN 40 AND 600)
);
```

**Note:** These SQL commands are for creating a fresh database. Do not execute them again if the required tables already exist in your database.

### Step 3: Configure Environment Variables

Navigate to the `backend` folder.

Create a `.env` file using the provided `.env.example` file as a reference.

Add your own database connection string and JWT secret:

```env
PORT=5000
DATABASE_URL=your_postgresql_connection_string
JWT_SECRET=your_secure_random_secret
```

Replace the placeholder values with your actual configuration.

**Important:** Never upload your actual `.env` file, database credentials, or JWT secret to GitHub.

---

## ▶️ How to Run the Application

**One important point:** Backend and frontend must run in separate terminals. The README explains this.

### Terminal 1 – Start the Backend

Open the first terminal in VS Code and execute:

```bash
cd backend
npm install
npm run dev
```

The backend API will run at:

```text
http://localhost:5000
```

### Terminal 2 – Start the Frontend

Open a second terminal in VS Code and execute:

```bash
cd frontend
npm install
npm run dev
```

Vite will display the frontend URL in the terminal. Open that URL in your browser.

For example:

```text
http://localhost:5173
```

The exact port may differ if the default port is already occupied.

**Important:** Keep both terminals running while using the application. The frontend communicates with the backend through the API at `http://localhost:5000/api`.

---

## 🌱 Demo Data / Seed Script

The project includes a seed script to create a demo user and sample glucose readings.

After configuring the database and creating the required tables, open a terminal in the backend directory and run:

```bash
node seed.js
```

The script creates a demo account and inserts sample readings.

### Demo Login Credentials

| Field | Value |
|---|---|
| Email | demo@sweety.com |
| Password | Sweety@123 |

You can use these credentials to log in and explore the application.

---

## 🧪 Running Backend Tests

The backend includes automated tests using Jest and Supertest.

To run the tests, open a terminal:

```bash
cd backend
npm test
```

**Latest test result:**

- Test Suites: 5 passed
- Tests: 32 passed
- Failures: 0

---

## 🔗 API Endpoints

The backend exposes REST API endpoints for authentication, glucose readings, and reports.

Base URL:

```text
http://localhost:5000/api
```

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| POST | `/auth/register` | Register a new user |
| POST | `/auth/login` | Log in an existing user |

### Glucose Readings

| Method | Endpoint | Description |
|---|---|---|
| GET | `/readings` | Get the logged-in user's readings |
| POST | `/readings` | Add a new glucose reading |
| PUT | `/readings/:id` | Update a glucose reading |
| DELETE | `/readings/:id` | Delete a glucose reading |

### Reports

| Method | Endpoint | Description |
|---|---|---|
| GET | `/reports/daily` | Get daily report |
| GET | `/reports/month-to-date` | Get month-to-date report |
| GET | `/reports/monthly` | Get previous-month report |

Protected endpoints require a valid JWT in the Authorization header.

```text
Authorization: Bearer <your_token>
```

---

## 🔐 Security and Data Protection

- Passwords are hashed using bcrypt before being stored.
- JWT authentication protects private API endpoints.
- Users can access only their own glucose readings.
- Database constraints prevent duplicate time-slot readings.
- Database validation restricts invalid glucose values and time slots.
- Environment variables are used for sensitive configuration.
- `.gitignore` prevents environment files and dependency folders from being committed.

---

## 📝 Notes and Assumptions

- Glucose values are recorded in mg/dL.
- Each user can record a maximum of four readings per day.
- Each of the four supported time slots can have only one reading per day.
- Future reading dates are not permitted.
- Daily reports are based on the selected date.
- Month-to-date reports cover the first day of the selected month through the selected date.
- Monthly reports cover the complete previous calendar month.
- Average glucose values are rounded to one decimal place.
- Users must be authenticated to access their personal readings and reports.

---

## 🔮 Future Improvements

The application can be extended with additional features in the future:

- Graphical glucose trend visualization.
- Pagination for reading history.
- Automated daily reminders.
- Doctor and patient account roles.
- Docker-based deployment.
- Additional frontend automated tests.

---

## 👨‍💻 Author

**Omkar Badiger**

Computer Science Graduate | Python Full Stack Developer

GitHub: [OmkarBadiger031](https://github.com/OmkarBadiger031)

Project Repository: [Sweety – Blood Glucose Tracker](https://github.com/OmkarBadiger031/Sweety-Blood-Glucose-Tracker)

---

## 📄 License

This project was developed as part of a full-stack development assignment.
