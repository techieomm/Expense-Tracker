const STORAGE_KEY = 'expense_tracker_v2';
const THEME_KEY = 'expense_tracker_theme';

const incomeCategories = [
  "Salary",
  "Freelancing",
  "Business",
  "Investment",
  "Interest",
  "Bonus",
  "Gift",
  "Refund",
  "Other Income"
];

const expenseCategories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Health",
  "Entertainment",
  "Education",
  "Travel",
  "Rent",
  "Recharge",
  "Fuel",
  "Other Expense"
];

let transactions = [];
let activeType = "expense";
let activeFilter = "all";
let catChart = null;
let isDark = false;

// ===============================
// Date
// ===============================

function setLocalDateDefault() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, "0");
  const day = String(today.getDate()).padStart(2, "0");

  document.getElementById("txDate").value =
    `${year}-${month}-${day}`;
}

// ===============================
// Category
// ===============================

function updateCategories() {

  const select = document.getElementById("txCategory");

  const categories =
    activeType === "income"
      ? incomeCategories
      : expenseCategories;

  select.innerHTML = "";

  categories.forEach(cat => {

    const option = document.createElement("option");

    option.value = cat;

    option.textContent = cat;

    select.appendChild(option);

  });

}

// ===============================
// Theme
// ===============================

function initTheme() {

  const savedTheme = localStorage.getItem(THEME_KEY);

  if (
    savedTheme === "dark" ||
    (!savedTheme &&
      window.matchMedia("(prefers-color-scheme: dark)").matches)
  ) {

    isDark = true;

  }

  applyTheme();

}

function toggleTheme() {

  isDark = !isDark;

  localStorage.setItem(
    THEME_KEY,
    isDark ? "dark" : "light"
  );

  applyTheme();

  if (catChart) renderChart();

}

function applyTheme() {

  document.documentElement.setAttribute(
    "data-theme",
    isDark ? "dark" : "light"
  );

  document.getElementById("themeToggle").textContent =
    isDark ? "☀️" : "🌙";

}

// ===============================
// Storage
// ===============================

function load() {

  try {

    const raw = localStorage.getItem(STORAGE_KEY);

    transactions = raw
      ? JSON.parse(raw)
      : [];

  } catch {

    transactions = [];

  }

}

function save() {

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(transactions)
  );

}

function fmt(n) {

  return (
    "₹" +
    Math.abs(n).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
  );

}

// ===============================
// Type
// ===============================

function setType(t) {

  activeType = t;

  document
    .getElementById("btnIncome")
    .classList.toggle(
      "active",
      t === "income"
    );

  document
    .getElementById("btnExpense")
    .classList.toggle(
      "active",
      t === "expense"
    );

  updateCategories();

}

// ===============================
// Filter
// ===============================

function setFilter(f, btn) {

  activeFilter = f;

  document
    .querySelectorAll(".filter-btn")
    .forEach(btn =>
      btn.classList.remove("active")
    );

  btn.classList.add("active");

  render();

}

// ===============================
// Add Transaction
// ===============================

function addTransaction() {

  const label =
    document
      .getElementById("txLabel")
      .value.trim();

  const amt = parseFloat(
    document
      .getElementById("txAmount")
      .value
  );

  const dateVal =
    document.getElementById("txDate").value;

  const cat =
    document.getElementById("txCategory").value;

  if (!label) {
    toast("Please enter description.");
    return;
  }

  if (!amt || amt <= 0) {
    toast("Enter valid amount.");
    return;
  }

  if (!dateVal) {
    toast("Select Date.");
    return;
  }

  transactions.unshift({

    id: Date.now(),

    label,

    amount: amt,

    type: activeType,

    category: cat,

    date: dateVal

  });

  save();

  document.getElementById("txLabel").value = "";

  document.getElementById("txAmount").value = "";

  setLocalDateDefault();

  render();

  toast("Transaction Added ✅");

}

// ===============================
// Delete
// ===============================

function deleteTransaction(id) {

  transactions =
    transactions.filter(
      t => t.id !== id
    );

  save();

  render();

  toast("Deleted");

}

// ===============================
// Filter Transactions
// ===============================

function filterTx() {

  const now = new Date();

  return transactions.filter(t => {

    if (activeFilter === "income")
      return t.type === "income";

    if (activeFilter === "expense")
      return t.type === "expense";

    const txDate = new Date(t.date);

    if (activeFilter === "week") {

      const diff =
        (now - txDate) /
        86400000;

      return diff <= 7 && diff >= 0;

    }

    if (activeFilter === "month") {

      return (
        txDate.getMonth() ===
          now.getMonth() &&
        txDate.getFullYear() ===
          now.getFullYear()
      );

    }

    return true;

  });

}
// ===============================
// Render
// ===============================

function render() {

  const totalInc = transactions
    .filter(t => t.type === "income")
    .reduce((sum, t) => sum + t.amount, 0);

  const totalExp = transactions
    .filter(t => t.type === "expense")
    .reduce((sum, t) => sum + t.amount, 0);

  const balance = totalInc - totalExp;

  document.getElementById("balanceAmt").textContent =
    (balance < 0 ? "-" : "") + fmt(balance);

  document.getElementById("totalIncome").textContent =
    fmt(totalInc);

  document.getElementById("totalExpense").textContent =
    fmt(totalExp);

  const filtered = filterTx();

  const list = document.getElementById("txList");

  if (filtered.length === 0) {

    list.innerHTML = `
      <div class="empty-state">
        <p>📝</p>
        <p>
          ${
            transactions.length === 0
              ? "No transactions yet."
              : "No transactions found."
          }
        </p>
      </div>
    `;

  } else {

    list.innerHTML = filtered
      .map(t => {

        const d = new Date(t.date);

        const ds = d.toLocaleDateString(
          "en-IN",
          {
            day: "numeric",
            month: "short",
            year: "numeric"
          }
        );

        const icon =
          t.type === "income"
            ? "↓"
            : "↑";

        return `
        <div class="tx-item">

          <div class="tx-icon-wrapper ${t.type}">
            ${icon}
          </div>

          <div class="tx-info">

            <div class="tx-label">
              ${t.label}
            </div>

            <div class="tx-meta">

              <span class="tx-cat">
                ${t.category}
              </span>

              <span>•</span>

              <span class="tx-date">
                ${ds}
              </span>

            </div>

          </div>

          <div class="tx-amount ${t.type}">
            ${
              t.type === "income"
                ? "+"
                : "-"
            }${fmt(t.amount)}
          </div>

          <button
            class="delete-btn"
            onclick="deleteTransaction(${t.id})">

            ❌

          </button>

        </div>
        `;

      })
      .join("");

  }

  renderChart();

}

// ===============================
// Chart
// ===============================

function renderChart() {

  const expenses =
    transactions.filter(
      t => t.type === "expense"
    );

  const section =
    document.getElementById(
      "chartSection"
    );

  if (expenses.length === 0) {

    section.style.display = "none";

    return;

  }

  section.style.display = "block";

  const cats = {};

  expenses.forEach(t => {

    cats[t.category] =
      (cats[t.category] || 0)
      + t.amount;

  });

  const labels =
    Object.keys(cats);

  const data =
    Object.values(cats);

  const colors = [

    "#4F46E5",

    "#10B981",

    "#F59E0B",

    "#EF4444",

    "#8B5CF6",

    "#EC4899",

    "#06B6D4",

    "#64748B",

    "#F97316",

    "#14B8A6",

    "#6366F1",

    "#A855F7"

  ];

  if (catChart)
    catChart.destroy();

  const ctx =
    document
      .getElementById("catChart")
      .getContext("2d");

  Chart.defaults.color =
    isDark
      ? "#94A3B8"
      : "#64748B";

  catChart = new Chart(ctx, {

    type: "doughnut",

    data: {

      labels,

      datasets: [

        {

          data,

          backgroundColor:
            colors.slice(
              0,
              labels.length
            ),

          borderWidth: 0,

          hoverOffset: 8

        }

      ]

    },

    options: {

      responsive: true,

      cutout: "70%",

      plugins: {

        legend: {

          position: "right",

          labels: {

            usePointStyle: true

          }

        },

        tooltip: {

          callbacks: {

            label: ctx =>
              " " +
              fmt(ctx.parsed)

          }

        }

      }

    }

  });

}

// ===============================
// Export CSV
// ===============================

function exportCSV() {

  if (
    transactions.length === 0
  ) {

    toast(
      "No transactions."
    );

    return;

  }

  const header =
    "Date,Description,Type,Category,Amount";

  const rows =
    transactions.map(t => {

      return `"${t.date}","${t.label}","${t.type}","${t.category}","${t.amount}"`;

    });

  const csv =
    [header, ...rows].join("\n");

  const blob =
    new Blob(
      [csv],
      {
        type: "text/csv"
      }
    );

  const url =
    URL.createObjectURL(blob);

  const a =
    document.createElement("a");

  a.href = url;

  a.download =
    "expenses.csv";

  a.click();

  URL.revokeObjectURL(url);

  toast("CSV Exported");

}

// ===============================
// Toast
// ===============================

function toast(msg) {

  const el =
    document.getElementById(
      "toast"
    );

  el.textContent = msg;
  el.classList.add("show");

  setTimeout(() => {

    el.classList.remove("show");

  }, 3000);

}

// ===============================
// Initialization
// ===============================

initTheme();

setLocalDateDefault();

load();

updateCategories();

render();
