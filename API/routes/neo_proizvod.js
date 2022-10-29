const express = require('express');
const neo4jSession = require('../neo4jConnection');
const router = express.Router();
const authenticateJWTToken = require("../auth").authenticateJWTToken;

router.get('/', (req,res)=>{
    var nazivProizvoda = req.query.naziv;
    neo4jSession
            .run('MATCH (p:Proizvod{naziv:$nazivParam}) RETURN p', {nazivParam : nazivProizvoda})
            .then((result)=>{
                var nizProizvoda = [];
                result.records.forEach(element => {
                    nizProizvoda.push(element._fields[0].properties);
                });
                res.send(nizProizvoda);
            })
            .catch((err)=>{
                res.status(500).send('Neo4j not working' + err);
            });        
})


router.get('/startsWithPretraga',(req,res)=>{
    
    var naziv = req.query.naziv;
    neo4jSession
                .run(`MATCH (p:Proizvod) WHERE p.naziv STARTS WITH ${naziv} RETURN p`)
                .then((result)=>{
                    var arrayParam = [];
                    result.records.forEach(record => {
                        arrayParam.push(record._fields[0].properties);
                    });
                    res.status(200).send(arrayParam);
                })
                .catch((err)=>{
                    res.status(500).send('NECE STARTS WITH ' + err );
                });

})


router.post('/dodajProizvod', authenticateJWTToken,(req,res)=>{
    
    var {brojKupovina,brojOcena,cena,kategorija,naziv,opis,popust,proizvodjac, slika, tip,zbirOcena} = req.body;

    
    if(!naziv || popust < 0 || cena < 0 || brojKupovina < 0)
        res.status(400).send('Bad request params');
    
    const addQuery = 'MERGE (p:Proizvod{brojKupovina : $brojKupovina,brojOcena : $brojOcena,cena : $cena, kategorija:$kategorija , naziv:$naziv , opis:$opis, popust:$popust, proizvodjac:$proizvodjac, slika:$slika, tip:$tip, zbirOcena:$zbirOcena}) RETURN p';
    neo4jSession
                .run(addQuery,{brojKupovina,brojOcena,cena,kategorija,naziv,opis,popust,proizvodjac,slika, tip,zbirOcena})
                .then((result)=>{
                    res.send(result);
                })
                .catch((err)=>{
                    res.status(500).send('Neo4j not working' + err);
                });
})


router.delete('/obrisiProizvod', authenticateJWTToken,(req,res)=>{
    var naziv = req.query.naziv;
    var deleteQuery = 'MATCH (p:Proizvod{naziv:$naziv}) DELETE p';
    neo4jSession
                .run(deleteQuery, {naziv})
                .then((result)=>{
                    res.send(result);
                })
                .catch((err)=>{
                    res.status(500).send('Neo4j not working' + err);
                });
})

//IZLISTANE PRODAVNICE U KOJIMA SE NALAZI PROIZVOD:
router.get('/vratiProdavnice', (req, res) => 
    {
        var kategorija = req.query.kategorija;
        var tip = req.query.tip;
        var naziv = req.query.naziv;

        neo4jSession.readTransaction((tx) =>
            {
                tx
                    .run(`MATCH (n: Proizvod {kategorija: $kategorija, tip: $tip, naziv: $naziv})-[rel:U_MAGACINU]->(p: Prodavnica)
                    RETURN p`, {kategorija, tip, naziv})
                    .then((result) => 
                        {
                            var nizProdavnica = [];

                            result.records.forEach(element => 
                            {
                                nizProdavnica.push(element._fields[0].properties);
                            });
                            
                            res.send(nizProdavnica);
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

//Vracanje komentara i ocena za jedan proizvod
//valjda je ok, vidite da li hocete da ovako vracamo rezultat
router.get('/vratiOceneIKomentare', (req, res) => 
    {
        var naziv = req.query.naziv;

        neo4jSession.readTransaction((tx) =>
            {
                tx
                    .run(`MATCH (p: Proizvod {naziv: $naziv})<-[rel:OCENIO]-(k: Korisnik), (k)-[r:KOMENTARISAO]->(p)
                    RETURN k.username, rel.ocena, r.komentar`, {naziv})
                    .then((result) => 
                        {
                            var nizKomentara = [];

                            result.records.forEach(element => 
                            {
                                var stavka = 
                                {
                                    "username": element._fields[0],
                                    "ocena": parseInt(element._fields[1]),
                                    "komentar": element._fields[2]
                                }
                                nizKomentara.push(stavka);
                            });
                            
                            res.send(nizKomentara);
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

module.exports = router;