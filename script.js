let transactions=JSON.parse(localStorage.getItem("transactions")) || [];


/* DOM ELEMENTS*/

const transactionForm=document.getElementById("transaction_form");
const transactionList=document.getElementById("transaction-list");
const totalIncome=document.getElementById("total_income");
const totalExpenses=document.getElementById("total_expenses");
const balance=document.getElementById("balance");
const emptyMessage=document.getElementById("empty-message");
const submitButton=document.getElementById("submit-btn");
const typeFilter=document.getElementById("type-filter");
const categoryFilter=document.getElementById("category-filter");
const sortOrder=document.getElementById("sort-order");
const errorMessage=document.getElementById("error-message");
const monthFilter=document.getElementById("month-filter");
const yearFilter=document.getElementById("year-filter");
const monthlyIncome=document.getElementById("monthly-income");
const monthlyExpenses=document.getElementById("monthly-expenses");
const monthlyBalance=document.getElementById("monthly-balance");
const deletePopup=document.getElementById("delete-popup");
const cancelDelete=document.getElementById("cancel-delete");
const confirmDelete=document.getElementById("confirm-delete");
const type=document.getElementById("type");
const category=document.getElementById("category");
const cancelEdit=document.getElementById("cancel-edit");
const formTitle=document.getElementById("form-title");


/* DATE */

const dateInput = document.getElementById("date");

function getTodayString() {
    const today = new Date();

    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");

    return `${year}-${month}-${day}`;
}

const today = getTodayString();

dateInput.max = today;


/* CATEGORIES*/

const incomeCategories=[
    "Salary",
    "Freelance",
    "Business",
    "Other"
];

const expenseCategories=[
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other"
];

const categories=[
    "Salary",
    "Freelance",
    "Food",
    "Travel",
    "Shopping",
    "Bills",
    "Entertainment",
    "Health",
    "Education",
    "Other"
];


function loadCategoryFilter(selectedType){

    categoryFilter.innerHTML='<option value="all">All categories</option>';

    let categoryList=[];

    if(selectedType==="income"){

        categoryList=incomeCategories;

    }else if(selectedType==="expense"){

        categoryList=expenseCategories;

    }else{

        categoryList=categories;
    }

    categoryList.forEach(function(categoryName){

        const option=document.createElement("option");

        option.value=categoryName;
        option.textContent=categoryName;

        categoryFilter.appendChild(option);
    });
}


/* STATE*/

let deleteId=null;
let editingId=null;


/*SAVE TRANSACTIONS*/

function saveTransactions(){
    localStorage.setItem("transactions",JSON.stringify(transactions));
}


/*TYPE AND CATEGORY*/

type.addEventListener("change",function(){

    category.innerHTML='<option value="">Choose category</option>';

    let categories=[];

    if(type.value==="income"){

        categories=incomeCategories;

    }else if(type.value==="expense"){

        categories=expenseCategories;
    }

    categories.forEach(function(categoryName){

        const option=document.createElement("option");

        option.value=categoryName;
        option.textContent=categoryName;

        category.appendChild(option);
    });
});


/*FILTER EVENTS*/

typeFilter.addEventListener("change", function () {
    loadCategoryFilter(typeFilter.value);
    displayTransactions();
});


categoryFilter.addEventListener("change",function(){
    displayTransactions();
});


monthFilter.addEventListener("change",function(){
    updateMonthlySummary();
});

sortOrder.addEventListener("change",function(){
    displayTransactions();
});

yearFilter.addEventListener("change", function () {
    loadMonths(yearFilter.value);
    updateMonthlySummary();
});


/*ADD / UPDATE TRANSACTION*/

transactionForm.addEventListener("submit",function(event){

    event.preventDefault();

    const type=document.getElementById("type").value;
    const amount=Number(document.getElementById("amount").value);
    const category=document.getElementById("category").value;
    const date=document.getElementById("date").value;
    const description=document.getElementById("description").value.trim();

    errorMessage.textContent="";


    if(type===""){
        errorMessage.textContent="Please select a transaction type.";
        return;
    }


    if(!amount || amount<=0){
        errorMessage.textContent="Please enter an amount greater than 0.";
        return;
    }


    if(category===""){
        errorMessage.textContent="Please select a category.";
        return;
    }


    if(date===""){
        errorMessage.textContent="Please select a date.";
        return;
    }


    if(date>today){
        errorMessage.textContent="Date cannot be in the future.";
        return;
    }


    if(editingId!==null){

        const transaction=transactions.find(function(item){
            return item.id===editingId;
        });


        if(!transaction){
            errorMessage.textContent="Transaction could not be found.";
            return;
        }


        transaction.type=type;
        transaction.amount=amount;
        transaction.category=category;
        transaction.date=date;
        transaction.description=description;

        editingId=null;
        submitButton.textContent="Add Transaction";

    }else{

        const transaction={
            id:Date.now(),
            type:type,
            amount:amount,
            category:category,
            date:date,
            description:description
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


/*DISPLAY TRANSACTIONS*/

function displayTransactions(){

    transactionList.innerHTML="";

    const selectedType=typeFilter.value;
    const selectedCategory=categoryFilter.value;


    const filteredTransactions=transactions.filter(function(transaction){

        const typeMatches=
            selectedType==="all" ||
            transaction.type===selectedType;

        const categoryMatches=
            selectedCategory==="all" ||
            transaction.category===selectedCategory;

        return typeMatches && categoryMatches;
    });

    if(sortOrder.value==="ascending"){

        filteredTransactions.sort(function(a,b){
            return new Date(a.date)-new Date(b.date);
        });

    }else if(sortOrder.value==="descending"){

        filteredTransactions.sort(function(a,b){
            return new Date(b.date)-new Date(a.date);
        });
    }

    if(filteredTransactions.length===0){

        emptyMessage.style.display="block";
        emptyMessage.textContent="No transactions found.";

        return;
    }


    emptyMessage.style.display="none";


    filteredTransactions.forEach(function(transaction){

        const row=document.createElement("tr");


        const formattedDate=new Date(
            transaction.date+"T00:00:00"
        ).toLocaleDateString("en-IN");


        const formattedAmount=transaction.amount.toLocaleString("en-IN",{
            minimumFractionDigits:2,
            maximumFractionDigits:2
        });


        const amountDisplay=
            transaction.type==="income"
                ? `+ ₹${formattedAmount}`
                : `- ₹${formattedAmount}`;


        const dateCell=document.createElement("td");
        dateCell.textContent=formattedDate;


        const typeCell=document.createElement("td");

        const typeSpan=document.createElement("span");
        typeSpan.className=`transaction-type ${transaction.type}`;
        typeSpan.textContent=transaction.type;

        typeCell.appendChild(typeSpan);


        const categoryCell=document.createElement("td");
        categoryCell.textContent=transaction.category;


        const descriptionCell=document.createElement("td");
        descriptionCell.textContent=transaction.description || "-";


        const amountCell=document.createElement("td");

        amountCell.className=
            transaction.type==="income"
                ? "amount-income"
                : "amount-expense";

        amountCell.textContent=amountDisplay;


        const actionsCell=document.createElement("td");


        const editButton=document.createElement("button");
        editButton.textContent="Edit";

        editButton.addEventListener("click",function(){
            editTransaction(transaction.id);
        });


        const deleteButton=document.createElement("button");
        deleteButton.textContent="Delete";

        deleteButton.addEventListener("click",function(){
            deleteTransaction(transaction.id);
        });


        actionsCell.appendChild(editButton);
        actionsCell.appendChild(deleteButton);

        row.appendChild(dateCell);
        row.appendChild(typeCell);
        row.appendChild(categoryCell);
        row.appendChild(descriptionCell);
        row.appendChild(amountCell);
        row.appendChild(actionsCell);

        transactionList.appendChild(row);
    });
}


/*EDIT TRANSACTION*/

function editTransaction(id){

    const transaction=transactions.find(function(item){
        return item.id===id;
    });


    if(!transaction){
        return;
    }


    document.getElementById("type").value=transaction.type;

    type.dispatchEvent(new Event("change"));


    document.getElementById("category").value=transaction.category;

    document.getElementById("amount").value=transaction.amount;
    document.getElementById("date").value=transaction.date;
    document.getElementById("description").value=transaction.description;


    editingId=id;

    submitButton.textContent="Update Transaction";
    cancelEdit.style.display="block";
    formTitle.textContent="Edit Transaction";


    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}


/*CANCEL EDIT*/

cancelEdit.addEventListener("click",function(){

    editingId=null;

    transactionForm.reset();

    submitButton.textContent="Add Transaction";
    cancelEdit.style.display="none";
    formTitle.textContent="Add a Transaction";
    errorMessage.textContent="";
});


/*DELETE TRANSACTION*/

function deleteTransaction(id){

    deleteId=id;

    deletePopup.classList.add("show");
}


confirmDelete.addEventListener("click",function(){

    if(deleteId===null){
        return;
    }


    transactions=transactions.filter(function(transaction){
        return transaction.id!==deleteId;
    });


    saveTransactions();
    displayTransactions();
    updateSummary();
    updateMonthlySummary();
    updateExpenseChart();


    deletePopup.classList.remove("show");

    deleteId=null;
});


cancelDelete.addEventListener("click",function(){

    deletePopup.classList.remove("show");

    deleteId=null;
});


deletePopup.addEventListener("click",function(event){

    if(event.target===deletePopup){

        deletePopup.classList.remove("show");

        deleteId=null;
    }

});


/*OVERALL SUMMARY*/

function updateSummary(){

    let income=0;
    let expenses=0;


    transactions.forEach(function(transaction){

        if(transaction.type==="income"){
            income+=transaction.amount;
        }else{
            expenses+=transaction.amount;
        }

    });


    const currentBalance=income-expenses;


    totalIncome.textContent=`₹${income.toLocaleString("en-IN",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    })}`;


    totalExpenses.textContent=`₹${expenses.toLocaleString("en-IN",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    })}`;


    balance.textContent=`₹${currentBalance.toLocaleString("en-IN",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    })}`;
}


/*MONTHLY SUMMARY*/

function updateMonthlySummary(){

    const selectedMonth=monthFilter.value;
    const selectedYear=yearFilter.value;


    if(selectedMonth===""||selectedYear===""){

        monthlyIncome.textContent="₹0.00";
        monthlyExpenses.textContent="₹0.00";
        monthlyBalance.textContent="₹0.00";

        return;
    }


    let income=0;
    let expenses=0;


    transactions.forEach(function(transaction){

        const transactionYear=transaction.date.substring(0,4);
        const transactionMonth=transaction.date.substring(5,7);


        if(transactionYear===selectedYear&&transactionMonth===selectedMonth){

            if(transaction.type==="income"){
                income+=transaction.amount;
            }else{
                expenses+=transaction.amount;
            }
        }
    });


    const balance=income-expenses;


    monthlyIncome.textContent=`₹${income.toLocaleString("en-IN",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    })}`;


    monthlyExpenses.textContent=`₹${expenses.toLocaleString("en-IN",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    })}`;


    monthlyBalance.textContent=`₹${balance.toLocaleString("en-IN",{
        minimumFractionDigits:2,
        maximumFractionDigits:2
    })}`;
}


/*=EXPENSE CHART*/

function updateExpenseChart(){

    const expenseChart=document.getElementById("expense-chart");

    expenseChart.innerHTML="";


    const expensesByCategory={};


    transactions.forEach(function(transaction){

        if(transaction.type==="expense"){

            if(!expensesByCategory[transaction.category]){
                expensesByCategory[transaction.category]=0;
            }

            expensesByCategory[transaction.category]+=transaction.amount;
        }

    });


    const categories=Object.keys(expensesByCategory);


    if(categories.length===0){

        expenseChart.innerHTML=`
            <p class="chart-empty">
                No expenses to display yet.
            </p>
        `;

        return;
    }


    let totalExpenses=0;


    categories.forEach(function(category){
        totalExpenses+=expensesByCategory[category];
    });


    categories.sort(function(a,b){
        return expensesByCategory[b]-expensesByCategory[a];
    });


    categories.forEach(function(category){

        const amount=expensesByCategory[category];

        const percentage=(amount/totalExpenses)*100;


        const formattedAmount=amount.toLocaleString("en-IN",{
            minimumFractionDigits:2,
            maximumFractionDigits:2
        });


        const chartItem=document.createElement("div");

        chartItem.className="chart-item";


        chartItem.innerHTML=`
            <div class="chart-label">
                <span>${category}</span>
                <span>₹${formattedAmount}</span>
            </div>

            <div class="chart-bar-container">
                <div
                    class="chart-bar"
                    style="width:${percentage}%"
                ></div>
            </div>
        `;


        expenseChart.appendChild(chartItem);
    });
}


/* 
   YEAR / MONTH FILTER SETUP
*/

const currentYear=new Date().getFullYear();

for(let year=currentYear-5; year<=currentYear; year++){

    const option=document.createElement("option");

    option.value=String(year);
    option.textContent=year;

    yearFilter.appendChild(option);
}


const currentMonthNumber=new Date().getMonth()+1;


// for(let month=currentMonthNumber+1; month<=12; month++){

//     const option=monthFilter.querySelector(
//         `option[value="${String(month).padStart(2,"0")}"]`
//     );

//     if(option){
//         option.remove();
//     }
// }

function loadMonths(selectedYear){

    monthFilter.innerHTML="";

    let lastMonth=12;

    if(Number(selectedYear)===currentYear){
        lastMonth=currentMonthNumber;
    }

    for(let month=1; month<=lastMonth; month++){

        const option=document.createElement("option");

        const monthValue=String(month).padStart(2,"0");

        option.value=monthValue;

        option.textContent=new Date(2000,month-1).toLocaleString("en-IN",{
            month:"long"
        });

        monthFilter.appendChild(option);
    }
}

yearFilter.value=String(currentYear);

loadMonths(String(currentYear));

const currentMonth=String(currentMonthNumber).padStart(2,"0");

monthFilter.value=currentMonth;
yearFilter.value=String(currentYear);


/*INITIAL DISPLAY*/

displayTransactions();
updateSummary();
updateMonthlySummary();
updateExpenseChart();