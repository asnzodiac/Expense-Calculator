document.addEventListener('DOMContentLoaded', () => {
    const expenseForm = document.getElementById('expenseForm');
    const monthSelect = document.getElementById('month');
    const currentMonthSpan = document.getElementById('currentMonth');
    const expenseTableBody = document.querySelector('#expenseTable tbody');
    const totalSpendSpan = document.getElementById('totalSpend');
    const highlightsDiv = document.getElementById('highlights');
    const categorySelect = document.getElementById('category');
    const remarkLabel = document.getElementById('remarkLabel');
    const remarkInput = document.getElementById('remark');

    let currentMonth = getCurrentMonth();
    let expenses = loadExpenses();

    // Populate month selector with last 12 months
    populateMonths();

    // Load initial data
    loadMonthData(currentMonth);

    // Show/hide remark field based on category
    categorySelect.addEventListener('change', () => {
        if (categorySelect.value === 'other') {
            remarkLabel.style.display = 'block';
            remarkInput.style.display = 'block';
            remarkInput.required = true;
        } else {
            remarkLabel.style.display = 'none';
            remarkInput.style.display = 'none';
            remarkInput.required = false;
        }
    });

    // Change month event
    monthSelect.addEventListener('change', (e) => {
        currentMonth = e.target.value;
        loadMonthData(currentMonth);
    });

    // Add expense
    expenseForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const category = categorySelect.value;
        const amount = parseFloat(document.getElementById('amount').value);
        const remark = remarkInput.value;

        if (!expenses[currentMonth]) {
            expenses[currentMonth] = {};
        }

        if (category === 'other') {
            if (!expenses[currentMonth].other) {
                expenses[currentMonth].other = [];
            }
            expenses[currentMonth].other.push({ amount, remark });
        } else {
            if (!expenses[currentMonth][category]) {
                expenses[currentMonth][category] = 0;
            }
            expenses[currentMonth][category] += amount;
        }

        saveExpenses(expenses);
        loadMonthData(currentMonth);
        expenseForm.reset();
        // Reset remark visibility
        remarkLabel.style.display = 'none';
        remarkInput.style.display = 'none';
        remarkInput.required = false;
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
        const categoryAmounts = {};

        // Calculate amounts for non-other categories
        Object.keys(monthData).forEach(cat => {
            if (cat !== 'other') {
                const amt = monthData[cat];
                categoryAmounts[cat] = amt;
                total += amt;
            }
        });

        // Calculate other total
        let otherTotal = 0;
        if (monthData.other) {
            otherTotal = monthData.other.reduce((sum, entry) => sum + entry.amount, 0);
            categoryAmounts['other'] = otherTotal;
            total += otherTotal;
        }

        // Sort categories by amount descending
        const categories = Object.keys(categoryAmounts).sort((a, b) => categoryAmounts[b] - categoryAmounts[a]);

        // Display rows
        categories.forEach(cat => {
            const amt = categoryAmounts[cat];
            const row = document.createElement('tr');
            row.innerHTML = `<td>${cat.replace('_', ' ')}</td><td>${amt.toFixed(2)}</td>`;
            expenseTableBody.appendChild(row);

            // Add sub-rows for other
            if (cat === 'other' && monthData.other) {
                monthData.other.forEach(entry => {
                    const subRow = document.createElement('tr');
                    subRow.classList.add('sub');
                    subRow.innerHTML = `<td colspan="2"> - ${entry.remark}: ${entry.amount.toFixed(2)}</td>`;
                    expenseTableBody.appendChild(subRow);
                });
            }
        });

        totalSpendSpan.textContent = total.toFixed(2);

        // Highlight top 2 spends
        if (categories.length > 0) {
            highlightsDiv.innerHTML = '<h3>High Spending Areas:</h3>';
            for (let i = 0; i < Math.min(2, categories.length); i++) {
                const cat = categories[i];
                const amt = categoryAmounts[cat];
                const p = document.createElement('p');
                p.classList.add('highlight');
                p.textContent = `${cat.replace('_', ' ')}: ${amt.toFixed(2)} (High!)`;
                highlightsDiv.appendChild(p);
            }
        }
    }
});
