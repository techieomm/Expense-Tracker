const STORAGE_KEY = 'expense_tracker_v2';
const THEME_KEY = 'expense_tracker_theme';
let transactions = [];
let activeType = 'expense';
let activeFilter = 'all';
let catChart = null;
let isDark = false;

// Format current local date to YYYY-MM-DD for the input field default
function setLocalDateDefault() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  document.getElementById('txDate').value = `${year}-${month}-${day}`;
}

// Theme Management
function initTheme() {
  const savedTheme = localStorage.getItem(THEME_KEY);
  if (savedTheme === 'dark' || (!savedTheme && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
    isDark = true;
  }
  applyTheme();
}

function toggleTheme() {
  isDark = !isDark;
  localStorage.setItem(THEME_KEY, isDark ? 'dark' : 'light');
  applyTheme();
  if (catChart) renderChart();
}

function applyTheme() {
  document.documentElement.setAttribute('data-theme', isDark ? 'dark' : 'light');
  document.getElementById('themeToggle').textContent = isDark ? '☀️' : '🌙';
}

function load() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    transactions = raw ? JSON.parse(raw) : [];
  } catch { transactions = []; }
}

function save() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

function fmt(n) {
  return '₹' + Math.abs(n).toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function setType(t) {
  activeType = t;
  document.getElementById('btnIncome').classList.toggle('active', t === 'income');
  document.getElementById('btnExpense').classList.toggle('active', t === 'expense');
}

function setFilter(f, btn) {
  activeFilter = f;
  document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  render();
}

function addTransaction() {
  const label = document.getElementById('txLabel').value.trim();
  const amt = parseFloat(document.getElementById('txAmount').value);
  const dateVal = document.getElementById('txDate').value;
  const cat = document.getElementById('txCategory').value;
  
  if (!label) { toast('Please enter a description.'); return; }
  if (!amt || amt <= 0) { toast('Please enter a valid amount.'); return; }
  if (!dateVal) { toast('Please select a valid date.'); return; }

  transactions.unshift({
    id: Date.now(),
    label,
    amount: amt,
    type: activeType,
    category: cat,
    date: dateVal // Storing explicit date format
  });
  
  save();
  document.getElementById('txLabel').value = '';
  document.getElementById('txAmount').value = '';
  setLocalDateDefault(); 
  render();
  toast('Transaction added successfully! ✨');
}

function deleteTransaction(id) {
  transactions = transactions.filter(t => t.id !== id);
  save();
  render();
  toast('Transaction deleted.');
}

function filterTx() {
  const now = new Date();
  return transactions.filter(t => {
    if (activeFilter === 'income') return t.type === 'income';
    if (activeFilter === 'expense') return t.type === 'expense';
    
    const txDate = new Date(t.date);
    if (activeFilter === 'week') {
      const diff = (now - txDate) / 86400000;
      return diff <= 7 && diff >= 0; 
    }
    if (activeFilter === 'month') {
      return txDate.getMonth() === now.getMonth() && txDate.getFullYear() === now.getFullYear();
    }
    return true;
  });
}

function render() {
  const totalInc = transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
  const totalExp = transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const balance = totalInc - totalExp;

  const balEl = document.getElementById('balanceAmt');
  balEl.textContent = (balance < 0 ? '-' : '') + fmt(balance);

  document.getElementById('totalIncome').textContent = fmt(totalInc);
  document.getElementById('totalExpense').textContent = fmt(totalExp);

  const filtered = filterTx();
  const list = document.getElementById('txList');

  if (filtered.length === 0) {
    list.innerHTML = `<div class="empty-state">
      <p>📝</p>
      <p>${transactions.length === 0 ? 'No transactions yet. Start adding some!' : 'No transactions found for this filter.'}</p>
    </div>`;
  } else {
    list.innerHTML = filtered.map(t => {
      const d = new Date(t.date);
      const ds = d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      const icon = t.type === 'income' ? '↓' : '↑';
      
      return `<div class="tx-item">
        <div class="tx-icon-wrapper ${t.type}">${icon}</div>
        <div class="tx-info">
          <div class="tx-label" title="${t.label}">${t.label}</div>
          <div class="tx-meta">
            <span class="tx-cat">${t.category}</span>
            <span style="color: var(--text-dim)">•</span>
            <span class="tx-date">${ds}</span>
          </div>
        </div>
        <div class="tx-amount ${t.type}">${t.type === 'income' ? '+' : '-'}${fmt(t.amount)}</div>
        <button class="delete-btn" onclick="deleteTransaction(${t.id})" title="Delete">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>`;
    }).join('');
  }

  renderChart();
}

function renderChart() {
  const expenses = transactions.filter(t => t.type === 'expense');
  const section = document.getElementById('chartSection');
  if (expenses.length === 0) { section.style.display = 'none'; return; }
  section.style.display = 'block';

  const cats = {};
  expenses.forEach(t => { cats[t.category] = (cats[t.category] || 0) + t.amount; });
  const labels = Object.keys(cats);
  const data = Object.values(cats);

  const colors = ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899', '#06B6D4', '#64748B', '#F97316'];

  if (catChart) catChart.destroy();
  const ctx = document.getElementById('catChart').getContext('2d');
  
  Chart.defaults.color = isDark ? '#94A3B8' : '#64748B';
  Chart.defaults.font.family = "'Plus Jakarta Sans', sans-serif";

  catChart = new Chart(ctx, {
    type: 'doughnut',
    data: {
      labels,
      datasets: [{
        data,
        backgroundColor: colors.slice(0, labels.length),
        borderWidth: 0,
        hoverOffset: 8,
        borderRadius: 4
      }]
    },
    options: {
      responsive: true,
      cutout: '70%',
      plugins: {
        legend: {
          position: 'right',
          labels: { usePointStyle: true, padding: 20, font: { size: 13, weight: 500 } }
        },
        tooltip: {
          backgroundColor: isDark ? '#334155' : '#0F172A',
          padding: 12, cornerRadius: 8,
          titleFont: { size: 14, family: "'Plus Jakarta Sans', sans-serif" },
          bodyFont: { size: 14, family: "'Space Grotesk', sans-serif" },
          callbacks: { label: ctx => ' ' + fmt(ctx.parsed) }
        }
      }
    }
  });
}

function exportCSV() {
  if (transactions.length === 0) { toast('No transactions to export.'); return; }
  const header = 'Date,Description,Type,Category,Amount';
  const rows = transactions.map(t => {
    const d = new Date(t.date).toLocaleDateString('en-IN');
    return `"${d}","${t.label}","${t.type}","${t.category}","${t.amount.toFixed(2)}"`;
  });
  const csv = [header, ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url; a.download = 'expenses_export.csv';
  a.click();
  URL.revokeObjectURL(url);
  toast('CSV exported successfully! 📁');
}

function toast(msg) {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.classList.add('show');
  setTimeout(() => el.classList.remove('show'), 3000);
}

// Initialization
initTheme();
setLocalDateDefault();
load();
render();