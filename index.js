const express = require('express');
const hbs = require('hbs');
const {createConnection} = require ('mysql2/promise');
const wax = require('wax-on');
require('dotenv').config();

let app = express();
app.set('view engine', 'hbs');
app.use(express.static('public'));
app.use(express.urlencoded({extended:false}));

wax.on(hbs.handlebars);
wax.setLayoutPath('./views/layouts');
// require in handlebars and their helpers
const helpers = require('handlebars-helpers');
// tell handlebars-helpers where to find handlebars
helpers({
    'handlebars': hbs.handlebars
})

let connection= null;

async function main() {
    connection = await createConnection({
        'host': process.env.DB_HOST,
        'user': process.env.DB_USER,
        'database': process.env.DB_NAME,
        'password': process.env.DB_PASSWORD
    })



app.get("/", function(req,res){
    res.render('home')
})

app.get('/employees', async function (req,res){
    const results = await connection.execute(`select * from Employees join Departments on Employees.department_id = Departments.department_id;`);
    const employees = results[0];
   // console.log(employees);
    res.render('employees/index',{
        "employees":employees,
    });
});

app.get('/employees/:employee_id/delete',async function(req,res){
    try{
        const employeeId = req.params.employee_id;
        const results = await connection.execute(
            `select * from Employees where employee_id = ?`,[employeeId]
        )
        const employees = results[0];
        const employeeToDelete = employees[0];

        res.render('employees/delete', {
            "employee":employeeToDelete
        })
    }catch (e) {
        res.send("Unable to process delete");
    }
});



}
main();

app.listen(3000, ()=>{
    console.log('Server is running')
});


