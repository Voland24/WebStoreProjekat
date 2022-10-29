const express = require('express');
const { copyFileSync } = require('fs');
const { authenticateJWTToken } = require('../auth');
const cassandraClient = require('../cassandraConnect');
const neo4jSession = require('../neo4jConnection');
const router = express.Router();

//Ovo je npr za admina da moze da povuce transakcije konkretne godine/kvartala/meseca
router.get('/preuzmiOnlineTransakcije', authenticateJWTToken,(req, res) =>
    {
        var query = 'SELECT * FROM buyhub.transakcija WHERE godina = ? and kvartal = ? and mesec = ? and online = true';
        
        cassandraClient.execute(query, [req.query.godina, req.query.kvartal, req.query.mesec], {prepare: true}, (err,result) =>
        {
            if(err)
            {
                console.log('Unable to get data' + err);
            }
            else 
            {
                res.status(200).send(result.rows)
            }
        })

    }
)

//Transakcije za konkretnu prodavnicu. Ovo sluzi za admina/radnika (da bi pogledao sve transakcije iz svoje prodavnice)
router.get('/preuzmiTransakcijeIzProdavnice', authenticateJWTToken,(req, res) =>
    {
        var query = 'SELECT * FROM buyhub.transakcija WHERE godina = ? and kvartal = ? and mesec = ? and online = false and grad = ? and adresa = ?';

        cassandraClient.execute(query, [req.query.godina, req.query.kvartal, req.query.mesec, req.query.grad, req.query.adresa], {prepare: true}, (err,result) =>
        {
            if(err)
            {
                console.log('Unable to get data' + err);
            }
            else 
            {
                res.status(200).send(result.rows)
            }
        })

    }
)

//1. Okida se kada se nesto kupi online. Deo se salje neu, a deo cassandri koristeci ovu funkciju.
//2. Takodje, okida se ako radnik (za OFFLINE kupovinu) hoce da rucno unese neku kupovinu
//      Note: ne mora da unese username korisnika, zato sto je username korisnika poslednji
//      deo clustering key-a (ovo kazem zato sto je moguce da neko irl kupi nesto a da nema profil)
router.post('/dodajTransakciju', authenticateJWTToken,(req,res) => 
    {
        var options = {year: "numeric", month: "short", day: "numeric", 
                        hour: "2-digit", minute: "2-digit", hour12: false,
                        timeZoneName: "short", timeZone: "CET"};
        var datum = new Intl.DateTimeFormat(["rs-RS"], options).format;
        //console.log(datum().toString().split(' ')[0].toUpperCase());
        
        var meseci = ["JAN", "FEB", "MAR", "APR", "MAJ", "JUN", "JUL", "AVG", "SEP", "OKT", "NOV", "DEC"];

        var today = new Date();
        var godina = today.getFullYear();
        var mesec = meseci[today.getMonth()];
        //var mesec = datum().toString().split(' ')[0].toUpperCase();
        var kvartal = ~~((mesec + 1) / 4) + 1;
        var minutes = today.getMinutes();
        var vreme = today.getDate() + " - " + today.getHours() + ":" + today.getMinutes();
        
        //console.log(mesec)
        //console.log(godina);
        //console.log(mesec);
        //console.log(kvartal);

        //Online je boolean:
        var online = req.body.online;
        var grad = req.body.grad;
        var adresa = req.body.adresa;
        
        if(online == true)
        {
            grad = "";
            adresa = "";
        }

        var allArgs = [godina, kvartal, mesec, online, grad, adresa, req.body.kupljeniProizvodi, req.body.ukupnaCena, req.body.usernameKorisnika, vreme];
        var query = 'INSERT INTO buyhub.transakcija (godina, kvartal, mesec, online, grad, adresa, "kupljeniProizvodi", "ukupnaCena", "usernameKorisnika", "vremeKupovine") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?);';

        cassandraClient.execute(query, allArgs, {prepare: true}, (err, result) => 
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

//Ima li smisla da uopste brisemo transakciju/e? Kada bismo to radili?
//Svakako, ako bismo brisali transakcije, morali bismo celu particiju ili deo nje.
//Jedini scenario koji vidim je da brisemo ako se prodavnica zatvori?

//Okej, odradila sam samo da se brisu sve transakcije jedne prodavnice. 
//Neka postoji i neka se okine npr ako se brise prodavnica 
//=>hardkodirala sam online = false u upitu 
//=>Ovo se okida kada se obrise konkretna prodavnica, tj zapamti se njen grad i adresa i onda se ovo okida
router.delete('/obrisiTransakcijeProdavnice', authenticateJWTToken,(req,res) =>
    {
        //var online = req.body.online;
        //var grad = req.body.grad;
        //var adresa = req.body.adresa;

        /*if(online == true)
        {
            grad = "";
            adresa = "";
        }*/
        
        var allArgs =  [req.query.godina, req.query.kvartal, req.query.mesec, req.query.grad, req.query.adresa];

        var query = 'DELETE FROM buyhub.transakcija WHERE godina = ? and kvartal = ? and mesec = ? and online = false and grad = ? and adresa = ?;';
       
        cassandraClient.execute(query, allArgs, {prepare: true}, (err,result) =>
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