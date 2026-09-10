let transactions=JSON.parse(localStorage.getItem("transactions")) || [];

const transactionForm=document.getElementById("transaction_form");
const transactionList=document.getElementById("transaction-list");
const totalIncome=document.getElementById("total_income");
const totalExpenses=document.getElementById("total_expenses");
const balance=document.getElementById("balance");
const emptyMessage=document.getElementById("empty-message");
const submitButton=document.getElementById("submit-btn");
const typeFilter=document.getElementById("type-filter");
const categoryFilter=document.getElementById("category-filter");
const errorMessage=document.getElementById("error-message");
const monthFilter=document.getElementById("month-filter");
const yearFilter=document.getElementById("year-filter");
const monthlyIncome=document.getElementById("monthly-income");
const monthlyExpenses=document.getElementById("monthly-expenses");
const monthlyBalance=document.getElementById("monthly-balance");
const deletePopup=document.getElementById("delete-popup");
const cancelDelete=document.getElementById("cancel-delete");
const confirmDelete = document.getElementById("confirm-delete");
const type=document.getElementById("type");
const category=document.getElementById("category");



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

categories.forEach(function(category){
    const option=document.createElement("option");

    option.value=category;
    option.textContent=category;

    categoryFilter.appendChild(option);
});

let deleteId=null;
let editingId=null;


function saveTransactions(){
    localStorage.setItem("transactions",JSON.stringify(transactions));
}


typeFilter.addEventListener("change",function(){
    displayTransactions();
});


categoryFilter.addEventListener("change",function(){
    displayTransactions();
});


monthFilter.addEventListener("change",function(){
    updateMonthlySummary();
});

yearFilter.addEventListener("change",function(){
    updateMonthlySummary();
});

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


function editTransaction(id){

    const transaction=transactions.find(function(item){
        return item.id===id;
    });


    if(!transaction){
        return;
    }


    document.getElementById("type").value=transaction.type;
    document.getElementById("amount").value=transaction.amount;
    document.getElementById("category").value=transaction.category;
    document.getElementById("date").value=transaction.date;
    document.getElementById("description").value=transaction.description;

    editingId=id;

    submitButton.textContent="Update Transaction";


    window.scrollTo({
        top:0,
        behavior:"smooth"
    });
}


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
const currentYear = new Date().getFullYear();

for(let year=currentYear-5; year<=currentYear+5; year++){
    const option=document.createElement("option");
    option.value=String(year);
    option.textContent=year;
    yearFilter.appendChild(option);
}

const currentMonth = String(new Date().getMonth()+1).padStart(2,"0");

monthFilter.value = currentMonth;
yearFilter.value = String(currentYear);

displayTransactions();
updateSummary();
updateMonthlySummary();
updateExpenseChart();