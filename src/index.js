const express = require("express")
const { v4: uuidv4 } = require("uuid")

const app = express()

app.use(express.json());

const customers = [];

app.post("/account", (request, response) => {
    const { cpf, name } = request.body;

    const customerAlreadyExist = customers.some((customers) => customers.cpf === cpf);

    if (customerAlreadyExist) {
        return response.status(400).json({ Erro: "usuário já cadastrado" });
    }

    customers.push({
        cpf,
        name,
        id: uuidv4(),
        statement: [],
    })
    return response.status(201).send();
});

app.get("/statement", (request, response) => {
    const { cpf } = request.headers;

    const customer = customers.find((customer) => customer.cpf === cpf);

    if (!customer) {
        return response.status(400).json({Error:"cpf not found"})
    }

    return response.json(customer.statement);
});

app.listen(3333);