let transactions = JSON.parse(localStorage.getItem("transactions")) || [];
const transactionForm = document.getElementById("transaction_form");
const transactionList = document.getElementById("transaction-list");
const totalIncome = document.getElementById("total_income");
const totalExpenses = document.getElementById("total_expenses");
const balance = document.getElementById("balance");
const emptyMessage = document.getElementById("empty-message");
const submitButton = document.getElementById("submit-btn");
const typeFilter = document.getElementById("type-filter");
const categoryFilter = document.getElementById("category-filter");
const errorMessage = document.getElementById("error-message");
const monthFilter = document.getElementById("month-filter");
const monthlyIncome = document.getElementById("monthly-income");
const monthlyExpenses = document.getElementById("monthly-expenses");
const monthlyBalance = document.getElementById("monthly-balance");
const deletePopup = document.getElementById("delete-popup");
const cancelDelete = document.getElementById("cancel-delete");
const confirmDelete = document.getElementById("confirm-delete");

let deleteId = null;
let editingId = null;

function saveTransactions() {
    localStorage.setItem("transactions", JSON.stringify(transactions));
}

typeFilter.addEventListener("change", function () {
    displayTransactions();
});

categoryFilter.addEventListener("change", function () {
    displayTransactions();
});

monthFilter.addEventListener("change", function () {
    updateMonthlySummary();
});

transactionForm.addEventListener("submit", function (event) {

    event.preventDefault();

    const type = document.getElementById("type").value;
    const amount = Number(document.getElementById("amount").value);
    const category = document.getElementById("category").value;
    const date = document.getElementById("date").value;
    const description = document.getElementById("description").value.trim();

    errorMessage.textContent = "";

    if (type === "") {
        errorMessage.textContent = "Please select a transaction type.";
        return;
    }

    if (!amount || amount <= 0) {
        errorMessage.textContent = "Please enter an amount greater than 0.";
        return;
    }

    if (category === "") {
        errorMessage.textContent = "Please select a category.";
        return;
    }

    if (date === "") {
        errorMessage.textContent = "Please select a date.";
        return;
    }

    if (editingId !== null) {

        const transaction = transactions.find(function (item) {
            return item.id === editingId;
        });

        if (!transaction) {
            errorMessage.textContent = "Transaction could not be found.";
            return;
        }

        transaction.type = type;
        transaction.amount = amount;
        transaction.category = category;
        transaction.date = date;
        transaction.description = description;

        editingId = null;
        submitButton.textContent = "Add Transaction";

    } else {

        const transaction = {
            id: Date.now(),
            type: type,
            amount: amount,
            category: category,
            date: date,
            description: description
        };

        transactions.push(transaction);
    }

    saveTransactions();
    displayTransactions();
    updateSummary();
    updateMonthlySummary();
    updateExpenseChart();

    transactionForm.reset();
});


function displayTransactions() {

    transactionList.innerHTML = "";

    const selectedType = typeFilter.value;
    const selectedCategory = categoryFilter.value;

    const filteredTransactions = transactions.filter(function (transaction) {

    const typeMatches =
        selectedType === "all" ||
        transaction.type === selectedType;

    const categoryMatches =
        selectedCategory === "all" ||
         transaction.category === selectedCategory;

        return typeMatches && categoryMatches;
    });

    if (filteredTransactions.length === 0) {
        emptyMessage.style.display = "block";
        emptyMessage.textContent = "No transactions found.";
        return;
    }

    emptyMessage.style.display = "none";

    filteredTransactions.forEach(function (transaction) {

        const row = document.createElement("tr");

        const formattedDate = new Date(
            transaction.date + "T00:00:00"
        ).toLocaleDateString("en-IN");

        const formattedAmount = transaction.amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const amountDisplay =
            transaction.type === "income"
                ? `+ ₹${formattedAmount}`
                : `- ₹${formattedAmount}`;

        row.innerHTML = `
            <td>${formattedDate}</td>
            <td>${transaction.type}</td>
            <td>${transaction.category}</td>
            <td>${transaction.description}</td>
            <td>${amountDisplay}</td>
            <td>
                <button onclick="editTransaction(${transaction.id})">
                    Edit
                </button>

                <button onclick="deleteTransaction(${transaction.id})">
                    Delete
                </button>
            </td>
        `;

        transactionList.appendChild(row);
    });
}


function editTransaction(id) {

    const transaction = transactions.find(function (item) {
        return item.id === id;
    });

    if (!transaction) {
        return;
    }

    document.getElementById("type").value = transaction.type;
    document.getElementById("amount").value = transaction.amount;
    document.getElementById("category").value = transaction.category;
    document.getElementById("date").value = transaction.date;
    document.getElementById("description").value = transaction.description;

    editingId = id;

    submitButton.textContent = "Update Transaction";

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}


function deleteTransaction(id) {
    deleteId = id;
    deletePopup.classList.add("show");
}

confirmDelete.addEventListener("click", function () {

    if (deleteId === null) {
        return;
    }

    transactions = transactions.filter(function (transaction) {
        return transaction.id !== deleteId;
    });

    saveTransactions();
    displayTransactions();
    updateSummary();
    updateMonthlySummary();
    updateExpenseChart();

    deletePopup.classList.remove("show");
    deleteId = null;
});

cancelDelete.addEventListener("click", function () {
    deletePopup.classList.remove("show");
    deleteId = null;
});

deletePopup.addEventListener("click", function (event) {

    if (event.target === deletePopup) {
        deletePopup.classList.remove("show");
        deleteId = null;
    }

});

function updateSummary() {

    let income = 0;
    let expenses = 0;

    transactions.forEach(function (transaction) {

        if (transaction.type === "income") {
            income += transaction.amount;
        } else {
            expenses += transaction.amount;
        }
    });

    const currentBalance = income - expenses;

    totalIncome.textContent = `₹${income.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    totalExpenses.textContent = `₹${expenses.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    balance.textContent = `₹${currentBalance.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function updateMonthlySummary() {

    const selectedMonth = monthFilter.value;

    if (selectedMonth === "") {
        monthlyIncome.textContent = "₹0.00";
        monthlyExpenses.textContent = "₹0.00";
        monthlyBalance.textContent = "₹0.00";
        return;
    }

    let income = 0;
    let expenses = 0;

    transactions.forEach(function (transaction) {

        if (transaction.date.startsWith(selectedMonth)) {

            if (transaction.type === "income") {
                income += transaction.amount;
            } else {
                expenses += transaction.amount;
            }
        }
    });

    const balance = income - expenses;

    monthlyIncome.textContent = `₹${income.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    monthlyExpenses.textContent = `₹${expenses.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;

    monthlyBalance.textContent = `₹${balance.toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    })}`;
}

function updateExpenseChart() {

    const expenseChart = document.getElementById("expense-chart");

    expenseChart.innerHTML = "";

    const expensesByCategory = {};

    transactions.forEach(function (transaction) {

        if (transaction.type === "expense") {

            if (!expensesByCategory[transaction.category]) {
                expensesByCategory[transaction.category] = 0;
            }

            expensesByCategory[transaction.category] += transaction.amount;
        }
    });

    const categories = Object.keys(expensesByCategory);

    if (categories.length === 0) {

        expenseChart.innerHTML = `
            <p class="chart-empty">
                No expenses to display yet.
            </p>
        `;

        return;
    }

    let totalExpenses = 0;

    categories.forEach(function (category) {
        totalExpenses += expensesByCategory[category];
    });

    categories.sort(function (a, b) {
        return expensesByCategory[b] - expensesByCategory[a];
    });

    categories.forEach(function (category) {

        const amount = expensesByCategory[category];

        const percentage = (amount / totalExpenses) * 100;

        const formattedAmount = amount.toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2
        });

        const chartItem = document.createElement("div");

        chartItem.className = "chart-item";

        chartItem.innerHTML = `
            <div class="chart-label">
                <span>${category}</span>
                <span>₹${formattedAmount}</span>
            </div>

            <div class="chart-bar-container">
                <div
                    class="chart-bar"
                    style="width: ${percentage}%"
                ></div>
            </div>
        `;

        expenseChart.appendChild(chartItem);
    });
}

displayTransactions();
updateSummary();
updateMonthlySummary();
updateExpenseChart();