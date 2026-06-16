# 💸 Premium Expense Tracker

A sleek, modern, and fully responsive web-based expense tracking application. Built to help you manage your personal finances with ease, featuring a clean SaaS-like interface, interactive charts, and local data persistence.

## ✨ Features

* **Add Transactions:** Easily log income and expenses with descriptions, amounts, custom dates, and categories.
* **Smart Date Picker:** Defaults to today's date automatically but allows logging past or future transactions.
* **Dark / Light Mode:** A beautiful premium dark mode toggle that saves your preference for future visits.
* **Interactive Dashboard:** View total balance, total income, and total expenses at a glance.
* **Data Visualization:** An interactive doughnut chart (powered by Chart.js) that breaks down your expenses by category. Chart colors automatically adapt to dark/light mode.
* **Smart Filtering:** Filter your recent transactions by All, Income, Expense, This Week, or This Month.
* **Local Storage:** All your financial data is saved directly in your browser's local storage—no database or server required.
* **CSV Export:** Export your entire transaction history to a CSV file with a single click.
* **Toast Notifications:** Smooth, non-intrusive popups to confirm your actions (adding, deleting, exporting).

## 🛠️ Technologies Used

* **HTML5:** Semantic markup and structure.
* **CSS3:** Custom variables (`:root`), flexbox, CSS grid, and smooth animations.
* **Vanilla JavaScript (ES6+):** Complete logic handling without the need for heavy front-end frameworks.
* **Chart.js (v4.4.1):** For rendering the interactive category spending chart.
* **Google Fonts:** Uses *Plus Jakarta Sans* for the main UI and *Space Grotesk* for premium number rendering.

## 📂 Folder Structure

Make sure your project folder looks like this:

```text
/expense-tracker
├── index.html       # The main HTML structure
├── style.css        # All styling and dark/light mode logic
├── script.js        # The core JavaScript functionality
└── README.md        # Project documentation (this file)
