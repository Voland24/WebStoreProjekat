const express = require('express');
const neo4jSession = require('../neo4jConnection');
const router = express.Router();
const authenticateJWTToken = require("../auth").authenticateJWTToken;

//Ovo je npr korisno da se izlista adminu da bi zaposlio nekog radnika 
//u konkretnu prodavnicu
router.get('/preuzmiProdavnice',(req, res) =>
    {
        neo4jSession
                .run('MATCH (p:Prodavnica) RETURN p', { })
                .then((result) =>
                {
                    var nizProdavnica = [];

                    result.records.forEach(element => 
                    {
                        nizProdavnica.push(element._fields[0].properties);
                    });

                    res.send(nizProdavnica);
                })
                .catch((err) =>
                {
                    res.status(500).send('Neo4j not working' + err);
                });        
    }
)

//Moze da se koristi takodje za admina kada hoce da zaposli radnika
router.get('/preuzmiProdavniceUGradu',(req, res) =>
    {
        var grad = req.query.grad;

        neo4jSession
                .run('MATCH (p:Prodavnica {grad : $grad}) RETURN p', {grad : grad})
                .then((result) =>
                {
                    var nizProdavnica = [];

                    result.records.forEach(element => 
                    {
                        nizProdavnica.push(element._fields[0].properties);
                    });

                    res.send(nizProdavnica);
                })
                .catch((err) =>
                {
                    res.status(500).send('Neo4j not working' + err);
                });        
    }
)

router.post('/dodajProdavnicu', authenticateJWTToken,(req, res) =>
    {
        var grad = req.body.grad;
        var adresa = req.body.adresa;
        var radnoVreme = req.body.radnoVreme;
        var telefon = req.body.telefon;
        var email = req.body.email;

        const query = 'MERGE (p:Prodavnica { grad : $grad, adresa : $adresa, radnoVreme : $radnoVreme, telefon : $telefon, email : $email}) RETURN p';

        neo4jSession
                .run(query, {grad : grad, adresa: adresa, radnoVreme: radnoVreme, telefon: telefon, email: email})
                .then((result) =>
                {
                    var nizProdavnica = [];

                    result.records.forEach(element => 
                    {
                        nizProdavnica.push(element._fields[0].properties);
                    });

                    res.send(nizProdavnica);
                })
                .catch((err) =>
                {
                    res.status(500).send('Neo4j not working' + err);
                });        
    }
)

//Moze sve da se menja osim grada i adrese. Nema poente da se grad/adresa menjaju
router.put('/izmeniProdavnicu', authenticateJWTToken,(req, res) =>
    {
        var grad = req.body.grad;
        var adresa = req.body.adresa;
        var radnoVreme = req.body.radnoVreme;
        var telefon = req.body.telefon;
        var email = req.body.email;

        const query = 'MATCH (p:Prodavnica { grad : $grad, adresa : $adresa}) SET p.radnoVreme = $radnoVreme, p.telefon = $telefon, p.email = $email RETURN p';
    
        neo4jSession
                    .run(query, {grad, adresa, radnoVreme, telefon, email})
                    .then((result) => 
                    {
                        res.send(result);
                    })
                    .catch((err) =>
                    {
                        res.status(500).send('Neo4j not working' + err);
                    });
    }
) 

router.delete('/obrisiProdavnicu', authenticateJWTToken,(req, res) =>
    {
        var grad = req.query.grad;
        var adresa = req.query.adresa;
        
        var query = 'MATCH ( p:Prodavnica {grad: $grad, adresa: $adresa} ) DELETE p';
        
        neo4jSession
                    .run(query, {grad, adresa})
                    .then((result) => 
                    {
                        res.send(result);
                    })
                    .catch((err) =>
                    {
                        res.status(500).send('Neo4j not working' + err);
                    });
    }
)

//Veza sa proizvodom - PRIVREMENO OVDE. TREBA DA BUDE KOD PROIZVODA:

//Vraca trenutni broj proizvoda konkretnog naziva u magacinu
router.get('/vratiStanjeMagacina', authenticateJWTToken,(req, res) => 
    {
        var naziv = req.query.naziv;

        var grad = req.query.grad;
        var adresa = req.query.adresa;

        neo4jSession.readTransaction((tx) =>
            {
                tx
                    .run(`MATCH (n: Proizvod {naziv: $naziv})-[rel:U_MAGACINU]->(p: Prodavnica {grad: $grad, adresa: $adresa})
                    RETURN rel`, {naziv, grad, adresa})
                    .then((result) => 
                        {
                            var info = [];

                            result.records.forEach(element => {
                                info.push(element._fields[0].properties);
                            });

                            res.send(info);
                        }
                    )
                    .catch((error) => 
                        {
                            res.status(500).send('Neuspesno' + error);
                        }
                    );
            }
        )
    }
)

//Vraca sve relacije - PROVERITI POSLE 
router.get('/vratiSveProizvodeProdavnice', authenticateJWTToken,(req, res) => 
    {
        var grad = req.query.grad;
        var adresa = req.query.adresa;

        neo4jSession.readTransaction((tx) =>
            {
                tx
                    .run(`MATCH (n: Proizvod)-[rel:U_MAGACINU]->(p: Prodavnica {grad: $grad, adresa: $adresa})
                    RETURN n, rel`, {grad, adresa})
                    .then((result) => 
                        {
                            var nizInfo = [];

                            result.records.forEach(element => 
                            {
                                var info =
                                {
                                    proizvod : element._fields[0].properties,
                                    brojProizvoda : element._fields[1].properties.brojProizvoda
                                }

                                nizInfo.push(info);
                            });

                            res.send(nizInfo);
                        }
                    )
                    .catch((error) => 
                        {
                            res.status(500).send('Neuspesno' + error);
                        }
                    );
            }
        )
    }
)



//RASKIDANJE VEZE IZMEDJU PROIZVODA I PRODAVNICE
router.delete('/obrisiMagacin', authenticateJWTToken,(req, res) => 
    {
        var kategorija = req.query.kategorija;
        var tip = req.query.tip;
        var naziv = req.query.naziv;

        var grad = req.query.grad;
        var adresa = req.query.adresa;

        neo4jSession.writeTransaction((tx) =>
            {
                tx
                    .run(`MATCH (n: Proizvod {kategorija: $kategorija, tip: $tip, naziv: $naziv})-[rel:U_MAGACINU]->(p: Prodavnica {grad: $grad, adresa: $adresa})
                        DELETE rel`, {kategorija, tip, naziv, grad, adresa})
                    .then((result) => 
                        {
                            res.status(200).send('Uspesno obrisan proizvod/magacin!')
                        }
                    )
                    .catch((error) => 
                        {
                            res.status(500).send('Neuspesno' + error);
                        }
                    );
            }
        )
    }
)

//PREDLOG-----------------------------------------------------------------------------------:
router.put('/dekrementirajBrojProizvodaMagacina', authenticateJWTToken,(req, res) => 
    {
        var nizNaziva = req.body.nizNaziva; 

        var grad = req.body.grad;
        var adresa = req.body.adresa;
        
        var nizBrojaProizvoda = req.body.nizBrojaProizvoda;

        var index = 0;
        var brojProizvoda = 0;
        neo4jSession.writeTransaction((tx) =>
            {
               nizNaziva.forEach((naziv)=>{
                brojProizvoda = nizBrojaProizvoda[index];
                tx
                .run(`MATCH (n: Proizvod {naziv: $naziv})-[rel:U_MAGACINU]->(p: Prodavnica {grad: $grad, adresa: $adresa})
                    SET rel.brojProizvoda = rel.brojProizvoda - ${brojProizvoda}
                    RETURN rel`, {naziv, grad, adresa})
                .then((result) => 
                    {
                        index++;
                        console.log(`Prosao dekrement po redu ${index}`);
                    }
                )
                .catch((error) => 
                    {
                        res.status(500).send('Neuspesno' + error);
                    }
                );
               })
            }
        )
        res.status(200).send('Uspesno dekrementiranje');
    }
)

function vratiUMagacinuRelaciju(req, res, next) 
{
    var naziv = req.body.naziv;

    var grad = req.body.grad;
    var adresa = req.body.adresa;

    neo4jSession
          .run(`
                RETURN EXISTS((:Proizvod{naziv : $naziv})-[:U_MAGACINU]->(:Prodavnica {grad: $grad, adresa: $adresa}))`, {naziv, grad, adresa})
          .then((result) =>
          {
              req.body.postoji = result;

              next();
          })
          .catch((err) =>
          {
              res.status(500).send('NEUSPENO' + err);
          });
}

router.post('/naruciProizvod', [authenticateJWTToken,vratiUMagacinuRelaciju], (req,res) =>
{    
    var naziv = req.body.naziv;

    var grad = req.body.grad;
    var adresa = req.body.adresa;

    var brojProizvoda = req.body.brojProizvoda;

    if(req.body.postoji.records[0]._fields[0] == false)
    {
        neo4jSession.writeTransaction((tx) =>
        {
            tx
            .run(`MATCH (p:Proizvod{naziv : $naziv}), (prod:Prodavnica {grad: $grad, adresa: $adresa})
                CREATE (prod)<-[rel:U_MAGACINU {brojProizvoda : ${brojProizvoda}}]-(p)
                RETURN rel`, {naziv, grad, adresa})
            .then((result) =>
            {
                res.status(200).send('Uspesno narucivanje proizvoda')
            })
            .catch((err) =>
            {
                res.status(500).send('NEUSPENO' + err);
            });
        })
    }
    else
    {
        neo4jSession.writeTransaction((tx) =>
        {
            tx
            .run(`MATCH (p:Proizvod{naziv : $naziv})-[rel:U_MAGACINU]->(prod:Prodavnica {grad: $grad, adresa: $adresa})
                SET rel.brojProizvoda = rel.brojProizvoda + ${brojProizvoda}
                RETURN rel`, {naziv, grad, adresa})
            .then((result) =>
            {
                res.status(200).send('Uspesno narucivanje proizvoda')
            })
            .catch((err) =>
            {
                res.status(500).send('NEUSPENO' + err);
            });
        })
    }
})

//UMESTO OVOG:
/*
//KREIRA vezu izmedju proizvoda i prodavnice ALI se postavlja i inicijalni
//broj proizvoda te kategorije, tog tipa i tog naziva u magacinu
router.post('/dodajUProdavnicu', (req, res) => 
    {
        var kategorija = req.body.kategorija;
        var tip = req.body.tip;
        var naziv = req.body.naziv;

        var grad = req.body.grad;
        var adresa = req.body.adresa;
        
        var brojProizvoda = req.body.brojProizvoda;

        neo4jSession.writeTransaction((tx) =>
            {
                tx
                    .run(`MATCH (n: Proizvod {kategorija: $kategorija, tip: $tip, naziv: $naziv})
                        MATCH (m: Prodavnica {grad: $grad, adresa: $adresa})
                        CREATE (n)-[rel:U_MAGACINU { brojProizvoda: ${brojProizvoda}}]->(m)`, {kategorija, tip, naziv, grad, adresa})
                    .then((result) => 
                        {
                            res.status(200).send('Uspesno dodat proizvod u magacin!')
                        }
                    )
                    .catch((error) => 
                        {
                            res.status(500).send('Neuspesno' + error);
                        }
                    );
            }
        )
    }
)

//NE MENJA BROJ PROIZVODA ZADATIM BROJEM, NEGO DODAJE TOLIKO NA TRENUTNO STANJE
//NOTE: ovo se koristi i za dekrementiranje prilikom offline kupovine! Samo se salje -1 kao brojProizvoda

//Primer:
//Ako je trenutan broj proizvoda 100, a preko ove funkcije se prosledi 50,
//rezultat ce biti 150
//=> Ovo se koristi za narucivanje jos proizvoda (potrebno za OFFLINE kupovinu, ovo radi RADNIK)
router.put('/izmeniBrojProizvodaMagacina', (req, res) => 
    {
        var kategorija = req.body.kategorija;
        var tip = req.body.tip;
        var naziv = req.body.naziv;

        var grad = req.body.grad;
        var adresa = req.body.adresa;
        
        var brojProizvoda = req.body.brojProizvoda;

        neo4jSession.writeTransaction((tx) =>
            {
                tx
                    .run(`MATCH (n: Proizvod {kategorija: $kategorija, tip: $tip, naziv: $naziv})-[rel:U_MAGACINU]->(p: Prodavnica {grad: $grad, adresa: $adresa})
                        SET rel.brojProizvoda = rel.brojProizvoda + ${brojProizvoda}
                        RETURN rel`, {kategorija, tip, naziv, grad, adresa})
                    .then((result) => 
                        {
                            res.status(200).send('Uspesno dodato jos proizvoda u magacin!')
                        }
                    )
                    .catch((error) => 
                        {
                            res.status(500).send('Neuspesno' + error);
                        }
                    );
            }
        )
    }
)
*/
//-------------------------------------------------------------------------------------------------

module.exports = router;