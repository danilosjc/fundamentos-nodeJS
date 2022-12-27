const { request, response } = require("express");
const express = require("express")
const { v4: uuidv4 } = require("uuid")

const app = express()

app.use(express.json());

const customers = [];

function verifyIfAlreadyExistAccountCPF(request, response, next){
    const { cpf } = request.headers

    const customer = customers.find(customer => customer.cpf === cpf);

    if (!customer) {
        return response.status(400).json({ Error: "customer not found" })

    }
    request.customer = customer;

    return next()
}

function getBalance(statement){
    const balance = statement.reduce((acc, operation) => {
        if (operation.type === 'credit') {
            return acc + operation.amount;
        } else {
            acc - operation.amount;
        }
    }, 0)
    return balance
}

app.post("/account", (request, response) => {
    const { cpf, name, } = request.body;

    const customerAlreadyExists = customers.some(
        (customer) => customer.cpf === cpf
        );

        if(customerAlreadyExists) {
            return response.status(400).json({ Error: "Customer Already Exists" });
        }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: []
    });

    return response.status(201).send()
});

app.get("/statement", verifyIfAlreadyExistAccountCPF, (request, response) => {
        const { customer } = request
    
        return response.json(customer.statement)
});

app.post("/deposit", verifyIfAlreadyExistAccountCPF, (request, response) => {
    const { description, amount } = request.body;

    const { customer } = request;

    const statementOperation = {
        description,
        amount,
        created_at: new Date(),
        typé: "credit"
    }

    customer.statement.push(statementOperation);

    return response.status(201).send();
})

app.post("/withdraw", verifyIfAlreadyExistAccountCPF, (request, response) => {
    const { amount } = request.body;
    const { customer } = request;

    const balance = getBalance(customer.statement);

    if(balance < amount){
        return response.status(400).json({ Error: "Insufficient funds" })
    }
    const statementOperation = {
        amount,
        created_at: new Date(),
        typé: "debit"
    };

    customer.statement.push(statementOperation);

    return response.status(201).send();
})

app.get("/statement/date", verifyIfAlreadyExistAccountCPF, (request, response) => {
        const { customer } = request;
        const { date } = request.query;

        const dateFormat = new Date(date + " 00:00");

        const statement = customer.statement.filter(
            (statement) => 
            statement.created_at.toDateString() === 
            new Date(dateFormat).toDateString()
            )
    
        return response.json(customer.statement)
});

app.put("/account", verifyIfAlreadyExistAccountCPF, (request, response) => {
    const { name } = request.body;
    const { customer } = request;

    customer.name = name;

    return response.status(201).send()
})

app.get("/account", verifyIfAlreadyExistAccountCPF, (request, response) => {
    const { customer } = request;

    return response.json(customer);
})

app.delete("/account", verifyIfAlreadyExistAccountCPF, (request, response) => {
    const { customer } = request;

    customers.splice(customer, 1);

    return response.status(200).json(customers)
})

app.listen(3333);