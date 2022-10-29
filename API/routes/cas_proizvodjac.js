const express = require('express');
const { copyFileSync } = require('fs');
const { authenticateJWTToken } = require('../auth');
const cassandraClient = require('../cassandraConnect');
const router = express.Router();

//Ovo se koristi da bi se dobili svi proizvodjaci neke kategorije i tipa proizvoda,
//tj da bi se izlistalo levo korisniku da bira
router.get('/preuzmiProizvodjace', (req, res) =>
    {
        var query = 'SELECT * FROM buyhub.proizvodjac WHERE kategorija = ? and tip = ?';
        
        cassandraClient.execute(query, [req.query.kategorija, req.query.tip], (err, result) =>
        {
            if(err)
            {
                console.log('Unable to get data' + err);
            }
            else 
            {
                console.log(req.query);
                res.status(200).send(result.rows)
            }
        });
    }
)

//Ovo nam treba da bismo videli da li proizvodjac postoji za odredjenu kategoriju i tip
//Npr kada se dodaje novi proizvod u bazu
router.get('/preuzmiProizvodjaca', (req, res) =>
    {
        var query = 'SELECT * FROM buyhub.proizvodjac WHERE kategorija = ? and tip = ? and naziv = ?';
        
        cassandraClient.execute(query, [req.query.kategorija, req.query.tip, req.query.naziv], (err, result) =>
        {
            if(err)
            {
                console.log('Unable to get data' + err);
            }
            else 
            {
                //console.log(req.body);
                res.status(200).send(result.rows)
            }
        });
    }
)

//OVO BI TREBALO DA SE IZVRSI AKO /preuzmiProizvodjaca vrati prazan niz, tj ako NE POSTOJI VEC taj proizvodjac
//za konkretnu kategoriju i tip
router.post('/dodajProizvodjaca', authenticateJWTToken,(req, res) =>
    {
        var allArgs = [req.body.kategorija, req.body.tip, req.body.naziv];
        var query = 'INSERT INTO buyhub.proizvodjac (kategorija, tip, naziv) VALUES (?, ?, ?);';

        cassandraClient.execute(query, allArgs, (err, result) => 
        {
            if(err)
            {
                console.log(req.body);
                console.log('Unable to put data' + err);
            }
            else 
            {
                console.log(req.body);
                res.status(200).send(result);
            }
        });
    }
)

//Mozda nece biti potrebno, ali moze npr da se pozove ako se svi proizvodi
//konkretne kategorije, tipa i konkretnog proizvodjaca obrisu. Ali ne mora. Samo kazem.
router.delete('/obrisiProizvodjaca', authenticateJWTToken,(req, res) =>
    {
        var allArgs =  [req.query.kategorija, req.query.tip, req.query.naziv];

        var query = 'DELETE FROM buyhub.proizvodjac WHERE kategorija = ? and tip = ? and naziv = ?;';
       
        cassandraClient.execute(query, allArgs, (err,result) =>
        {
            if(err)
            {
                console.log(req.query);
                console.log('Unable to delete data' + err);
            }
            else 
            {
                console.log(req.query);
                res.status(200).send(result);
            }
        })
    }
)

module.exports = router;