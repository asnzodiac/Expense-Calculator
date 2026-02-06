document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expenseForm');
    const monthSelect = document.getElementById('month');
    const currentMonthSpan = document.getElementById('currentMonth');
    const expenseTableBody = document.querySelector('#expenseTable tbody');
    const totalSpendSpan = document.getElementById('totalSpend');
    const highlightsDiv = document.getElementById('highlights');

    let currentMonth = getCurrentMonth();
    let expenses = loadExpenses();

    // Populate month selector with last 12 months
    populateMonths();

    // Load initial data
    loadMonthData(currentMonth);

    // Change month event
    monthSelect.addEventListener('change', (e) => {
        currentMonth = e.target.value;
        loadMonthData(currentMonth);
    });

    // Add expense
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = document.getElementById('category').value;
        const amount = parseFloat(document.getElementById('amount').value);

        if (!expenses[currentMonth]) {
            expenses[currentMonth] = {};
        }
        if (!expenses[currentMonth][category]) {
            expenses[currentMonth][category] = 0;
        }
        expenses[currentMonth][category] += amount;

        saveExpenses(expenses);
        loadMonthData(currentMonth);
        expenseForm.reset();
    });

    function getCurrentMonth() {
        const now = new Date();
        return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    }

    function populateMonths() {
        const now = new Date();
        for (let i = 0; i < 12; i++) {
            const month = new Date(now.getFullYear(), now.getMonth() - i, 1);
            const monthStr = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, '0')}`;
            const option = document.createElement('option');
            option.value = monthStr;
            option.textContent = month.toLocaleString('default', { month: 'long', year: 'numeric' });
            if (monthStr === currentMonth) option.selected = true;
            monthSelect.appendChild(option);
        }
    }

    function loadExpenses() {
        return JSON.parse(localStorage.getItem('expenses')) || {};
    }

    function saveExpenses(exp) {
        localStorage.setItem('expenses', JSON.stringify(exp));
    }

    function loadMonthData(month) {
        currentMonthSpan.textContent = new Date(month + '-01').toLocaleString('default', { month: 'long', year: 'numeric' });
        expenseTableBody.innerHTML = '';
        highlightsDiv.innerHTML = '';
        let total = 0;
        const monthData = expenses[month] || {};
        const categories = Object.keys(monthData);

        // Sort categories by amount descending for highlighting
        categories.sort((a, b) => monthData[b] - monthData[a]);

        categories.forEach(category => {
            const amount = monthData[category];
            total += amount;

            const row = document.createElement('tr');
            row.innerHTML = `<td>${category.replace('_', ' ')}</td><td>${amount.toFixed(2)}</td>`;
            expenseTableBody.appendChild(row);
        });

        totalSpendSpan.textContent = total.toFixed(2);

        // Highlight top 2 spends (or adjust threshold)
        if (categories.length > 0) {
            highlightsDiv.innerHTML = '<h3>High Spending Areas:</h3>';
            for (let i = 0; i < Math.min(2, categories.length); i++) {
                const category = categories[i];
                const amount = monthData[category];
                const p = document.createElement('p');
                p.classList.add('highlight');
                p.textContent = `${category.replace('_', ' ')}: ${amount.toFixed(2)} (High!)`;
                highlightsDiv.appendChild(p);
            }
        }
    }
});
