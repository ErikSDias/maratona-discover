// Trabalhando o modal
const modal = {
    toggle() {
        document
            .querySelector('.modal-overlay')
            .classList
            .toggle('active')
    }
}

const Storage = {
    get() {
        return JSON.parse(localStorage.getItem("dev.finances:transactions")) || []
    },

    set(transactions) {
        localStorage.setItem("dev.finances:transactions", JSON.stringify(transactions))
    }
}

// Trabalhando as transações


const Transaction = {
    all: Storage.get(),

    add(transaction) {
        Transaction.all.push(transaction)
        App.reload()
    },

    remove(index) {
        Transaction.all.splice(index, 1)
        
        App.reload()
    },

    incomes() {
        let income = 0

        Transaction.all.forEach(transaction => {
            if (transaction.amount > 0) {
                income += transaction.amount
            }

        })

        return income
    },

    expenses() {
        let expense = 0

        Transaction.all.forEach(transaction => {
            if (transaction.amount < 0) {
                expense += transaction.amount
            }
        })

        return expense
    },
    total() {
        return Transaction.incomes() + Transaction.expenses()
    }
}

// substituir os dados do HTML com os dados do JS
const DOM = {
    transactionsContainer: document.querySelector('#data-table tbody'),

    addTransaction(transaction, index) {
        const tr = document.createElement('tr')
        tr.innerHTML = DOM.innerHTMLTransaction(transaction, index)
        tr.dataset.index = index


        DOM.transactionsContainer.appendChild(tr)
    },
    innerHTMLTransaction(transaction, index) {

        const CSSClass = transaction.amount > 0 ? "income" : "expense"

        // formatação da moeda
        const amount = utils.formatCurrency(transaction.amount)

        const html = `
        <td class="description">${transaction.description}</td>
        <td class="${CSSClass}">${amount}</td>
        <td class="date">${transaction.date}</td>
        <td>
            <img onclick="Transaction.remove(${index})" src="assets/minus.svg" alt="Remover transação">
        </td>   
        `
        return html
    },
    updateBalance() {
        document
            .getElementById('incomeDisplay')
            .innerHTML = utils.formatCurrency(Transaction.incomes())

        document
            .getElementById('expenseDisplay')
            .innerHTML = utils.formatCurrency(Transaction.expenses())

        document
            .getElementById('totalDisplay')
            .innerHTML = utils.formatCurrency(Transaction.total())
    },
    clearTransactions() {
        DOM.transactionsContainer.innerHTML = ""
    }
}

const utils = {
    formatAmount(value){
        value = Number(value) * 100
        
        return value
    },
    
    formatDate(date) {
        const splitedDate = date.split("-")

        return `${splitedDate[2]}/${splitedDate[1]}/${splitedDate[0]} `
    },

    formatCurrency(value) {
        // Sinais
        
        const signal = Number(value) < 0 ? "-" : " "

        value = String(value).replace(/\D/g, "")
        value = Number(value) / 100

        value = value.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        })

        return signal + value
    }
    
}

const Form = {
    description: document.querySelector('input#description'),
    amount: document.querySelector('input#amount'),
    date: document.querySelector('input#date'),
    
    getValues(){
        return {
            description: Form.description.value,
            amount: Form.amount.value,
            date: Form.date.value,
        }
    },
    
    validateField() {
        const { description, amount, date } = Form.getValues()

        if(description.trim() === "" || 
        amount.trim() === "" || 
        date.trim() === "") {
            throw new Error("Por favor, preencha todos os campos")
        }
    },

    formatValues() {
        let { description, amount, date } = Form.getValues()
        amount = utils.formatAmount(amount)

        date = utils.formatDate(date)
        return {
            description,
            amount,
            date
        }
    },

    clearFields() {
        Form.description.value = ""
        Form.amount.value = ""
        Form.date.value = ""
    },

    submit(event) {
        event.preventDefault()
        // Verificar se todas as informações foram preenchidas

        try {
            Form.validateField()
            // Formatar os dados para salvar
            const transaction = Form.formatValues()

            // salvar
            Transaction.add(transaction)

            // Apagar formulario
            Form.clearFields()

            // modal feche
            modal.toggle()

            // Atualizar a aplicação
        } catch (error) {
            alert(error.message)
        }

    },

}



const App = {
    init() {
        Transaction.all.forEach(DOM.addTransaction)
        DOM.updateBalance()
        
        Storage.set(Transaction.all)
    },
    reload() {
        DOM.clearTransactions()
        App.init()
        
    }
}

App.init()

