# Workout Buddy

Welcome to the Workout Buddy team. This application allows users to log workouts, join fitness challenges, and track their progress through a personalized dashboard.

## Getting Started

Follow these steps to get the project running on your local machine.

### 1. Prerequisites
* Node.js (v14 or higher)
* MySQL Server
* MySQL Workbench

### 2. Database Setup
To ensure your dashboard shows the same data as the rest of the team, import the database dump:

### 1. Open MySQL and create the database:
   ```sql
   CREATE DATABASE workout_app;
  ```
### 2. Import the provided SQL dump:

In Workbench: Go to Server > Data Import. Choose Import from Self-Contained File, select data/workout_app.sql, set the Target Schema to workout_app, and click Start Import.

### 3. Configuration (db.js)
Open the db.js file in the root directory and update the password field with your local MySQL password:

```js
const mysql = require("mysql2");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "YOUR_PASSWORD_HERE", // Change this to your local MySQL password
    database: "workout_app" 
});

db.connect(err => {
    if (err) throw err;
    console.log("MySQL Connected!");
});

module.exports = db;
```

### 4. Installation and Running
Install dependencies:

```Bash
npm install
```
Start the server:

```Bash
node server.js
```
View the app at: http://localhost:3000

## Features
Dashboard: Real-time stats for workouts, challenges, and completion rates.

Profile: Customizable user bio and name.

Activity Feed: Social tracking for recent workouts.

Challenges: Interactive community fitness programs.

## Project Structure
/Workout Buddy Challenge Hub: Frontend assets (HTML, CSS, JS).

/data: Contains workout_app.sql for database syncing.

server.js: Main Express server logic.

db.js: Database connection configuration.

### Team Reminder: 
If you make changes to the database schema (adding tables or columns), please export a new SQL dump to the /data folder named workout_app.sql before pushing your changes.
