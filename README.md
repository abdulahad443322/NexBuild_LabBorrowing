# Lab Borrowing Management System

A web-based Lab Borrowing Management System built with **React**, **FastAPI**, and **MySQL**. It helps manage laboratory inventory, borrowing requests, loan transactions, returns, and user access.

## Features

- User authentication with JWT
- Role-based access control (Student, Staff, Admin)
- Inventory management
- Item category management
- Borrowing request submission and management
- Request approval and rejection
- Item issuing and returning
- Active loan tracking
- Loan history and reports
- User management

## Tech Stack

### Frontend
- React
- JavaScript
- Tailwind CSS
- Vite

### Backend
- Python
- FastAPI
- MySQL Connector
- JWT Authentication
- Argon2 Password Hashing

### Database
- MySQL

## Project Structure

```text
Lab-Borrowing-Management-System/
│
├── Backend/
│   ├── api/
│   ├── auth.py
│   ├── borrowing.py
│   ├── catagory.py
│   ├── config.py
│   ├── database.py
│   ├── inventory.py
│   ├── loans.py
│   ├── reports.py
│   ├── user.py
│   └── requirements.txt
│
├── Database/
│   └── lab_borrowing.sql
│
├── Frontend/
│   ├── src/
│   │   ├── components/
│   │   └── pages/
│   ├── package.json
│   └── package-lock.json
│
├── .gitignore
└── README.md
```

## Installation and Setup

### 1. Clone the repository

```bash
git clone YOUR_REPOSITORY_URL
cd Lab-Borrowing-Management-System
```

### 2. Database Setup

1. Install and start MySQL.
2. Create the database using the provided SQL file.
3. Import `Database/lab_borrowing.sql`.
4. Configure your database connection credentials.

### 3. Backend Setup

Navigate to the Backend directory:

```bash
cd Backend
```

Create a virtual environment:

```bash
python -m venv virtual_env
```

Activate it on Windows:

```bash
virtual_env\Scripts\activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Configure your environment variables and JWT secret key.

Start the FastAPI server:

```bash
uvicorn api.main:app --reload
```

Backend API documentation:

```text
http://127.0.0.1:8000/docs
```

### 4. Frontend Setup

Open another terminal and navigate to the Frontend directory:

```bash
cd Frontend
```

Install dependencies:

```bash
npm install
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## Authentication and Authorization

The system uses JWT-based authentication.

Different roles have different permissions:

- **Student:** Limited access to inventory and personal borrowing operations.
- **Staff:** Access to borrowing request management and loan operations.
- **Admin:** Administrative access to system management features.

Authorization is enforced on the backend.

## Security

- Passwords are hashed using Argon2.
- JWT is used for authentication.
- Secret keys and database credentials are stored outside source control.
- Environment files are excluded through `.gitignore`.

## License

This project is developed for educational purposes.
