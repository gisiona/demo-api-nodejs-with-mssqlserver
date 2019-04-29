

const express = require('express');
const sql = require("mssql");
const bodyParser = require('body-parser');
const Connection = require('tedious').Connection;  
const app = express();

// string de conexao com o banco de dados
const str_conn = 'SUA STRING DE CONEXÃO COM O BANCO DE DADOS SQL'
const config = {
    server:  'SEU SERVIDOR', 
    authentication: {
        type: 'default',
        options: {
            userName: 'SEU USUARIO',
            password: 'SUA SENHA'
        }
    },
    options: {
      database: 'NOME DO SEU BANCO DE DADOS',
      encrypt:true
    }
}

//configurando o body parser para pegar POSTS mais tarde
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());


const server = app.listen(5000, function () {
    console.log('SERVIDOR RODANDO NA PORTA 5000');
});


sql.connect(str_conn)
   .then(conn => global.conn = conn)
   .catch(err => console.log(err));

app.get('/all', function (req, res) {       
    const connection = new Connection(config);
    connection.on('connect', function(err) {
        if (err) { console.log(err); res.status(500).send(err); } else { console.log('Connected'); }        
        const request = new sql.Request();                
        request.query('SELECT top 500 * FROM CHAMADO', function (err, recordset) {              
            if (err) { console.log(err);  res.status(500).send(err);  }
            res.status(200).send( { chamados: recordset, retorno:{codigo: 200, mensagem: 'Dados retornado com sucesso.'} } );              
        });    
    });
});


app.get('/chamado/:id?', (req, res) =>{
    let filter = '';
    const idPar = req.params.id;    
    if(req.params.id) 
    {
        filter = ' WHERE IdIncidente = ' + `'` +  idPar +  `'`;    
    }else{
        return res.status(500).send( { error: { codigo: 500, mensagem: 'O paramentro de entrada ID não foi informado.' }})
    }
    execSQLQuery('SELECT * FROM CHAMADO ' + filter, res);
});


app.delete('/chamado/:id', (req, res) =>{
    if(req.params.id){
        const request = new sql.Request();     
        request.query('DELETE CHAMADO WHERE IdIncidente=' + `'` + req.params.id +  `'`, function (err, recordset) {              
            if (err) { 
                console.log(err); 
                res.status(500).send({ error: {codigo: 500, mensagem: + err}});
            }
            res.status(200).send( { recordset, retorno:{codigo: 200, mensagem: 'Dado excluído com sucesso.'} } );              
        });    
    }else{
        return res.status(500).send( { error: { codigo: 500, mensagem: 'O paramentro de entrada ID não foi informado.' }})
    }  
    //console.log('PODE SER FEITO TAMBÉM DA FORMA ABAIXO QUE VAI FUNCIONAR TBM.')
    //execSQLQuery('DELETE CHAMADO WHERE IdIncidente=' + `'` + req.body.id +  `'`, res);
});

app.post('/chamado/', (req, res) =>{   
    if(!req.body.id || !req.body.titulo){
        return res.status(500).send( { error: { codigo: 500, mensagem: 'Os paramentros de entrada não foram informados.' }})
    }
    const request = new sql.Request();  

    request.query('UPDATE CHAMADO SET TITULO =' + `'` + req.body.titulo +  `'` + ' WHERE IDINCIDENTE = ' + `'` + req.body.id +  `'`, function (err, recordset) {              
        if (err) { 
            console.log(err); 
            res.status(500).send({ error: {codigo: 500, mensagem: + err}});
        }
        res.status(200).send( { recordset, retorno:{codigo: 200, mensagem: 'Dado atualizado com sucesso.'} } );              
    });    
    //console.log('PODE SER FEITO TAMBÉM DA FORMA ABAIXO QUE VAI FUNCIONAR TBM.')
    //execSQLQuery('UPDATE CHAMADO SET TITULO =' + `'` + req.body.titulo +  `'` + ' WHERE IDINCIDENTE = ' + `'` + req.body.id +  `'` , res);
});


function execSQLQuery(sqlQry, res){
    console.log('INICIO DA EXECUCAO DA QUERY NO BANCO DE DADOS - ' + new Date());
    global.conn.request()
               .query(sqlQry)
               .then(result => res.json(result.recordset))
               .catch(err => res.json(err));
}
