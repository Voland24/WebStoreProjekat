const express = require("express");
const neo4jSession = require("../neo4jConnection");
const cassandraClient = require("../cassandraConnect");
const router = express.Router();
const bcrypt = require("bcryptjs");

const generateJWTToken = require("../auth").generateJWTToken;
const authenticateJWTToken = require("../auth").authenticateJWTToken;

const dotenv = require("dotenv");
dotenv.config();

router.post("/loginKorisnik", (req, res) => {
  var username = req.body.username;

  var pass = req.body.password;

  var prefix = username.split(".")[0];

  var tip = "";

  var queryString = "";

  if (prefix === "radnik") {
    tip = "R";
    queryString = "MATCH (r:Radnik{username:$username}) RETURN r";
  } else {
    if (prefix === "admin") tip = "A";
    else {
      tip = "K";
      queryString = "MATCH (k:Korisnik{username:$username}) RETURN k";
    }
  }

  if (tip != "A") {
    neo4jSession
      .run(queryString, { username })
      .then((result) => {
        bcrypt.compare(
          pass,
          result.records[0]._fields[0].properties.password,
          (err, result) => {
            if (result) {
              var token = generateJWTToken(username);
              res.status(200).send({ token, tip });
            } else {
              res
                .status(400)
                .send("Username ili password nisu dobri, probajte ponovo");
            }
          }
        );
      })
      .catch((err) => {
        res.status(500).send("ERROR KOD LOGIN " + err);
      });
  } else {
    var token = generateJWTToken("admin");
    res.status(200).send({ token, tip });
  }
});

router.get("/", (req, res) => {
  var username = req.query.username;
  neo4jSession.readTransaction((tx) => {
    tx.run(`MATCH (k:Korisnik{username: $username}) RETURN k`, { username })
      .then((result) => {
        res.status(200).send(result.records[0]._fields[0].properties);
      })
      .catch((err) => {
        res.status(500).send("NEO4J ne GET Korisnika" + err);
      });
  });
});

router.post("/dodajKorisnika", async (req, res) => {
  var { email, ime, password, prezime, telefon, username } = req.body;
  var hashPass = bcrypt.hashSync(password, 10);

  neo4jSession
    .run(
      "MERGE (k:Korisnik{email : $email, ime : $ime , password : $hashPass,prezime:$prezime,telefon:$telefon,username:$username}) RETURN k",
      { email, ime, hashPass, prezime, telefon, username }
    )
    .then((result) => {
      var token = generateJWTToken(username);
      res.status(200).send(token);
    })
    .catch((err) => {
      res.status(500).send("NECE NEO4J DODAVANJE KORISNIKA" + err);
    });
});

router.put("/azurirajKorisnika", authenticateJWTToken, async (req, res) => {
  var zaAzurirati = req.body.zaAzurirati;
  var username = req.body.username;

  switch (zaAzurirati) {
    case "BrojTelefona":
      var telefon = req.body.telefon;
      neo4jSession.writeTransaction((tx) => {
        tx.run(
          `MATCH (k:Korisnik {username: $username}) SET k.telefon = ${telefon} RETURN k`,
          { username }
        )
          .then((result) => {
            res.status(200).send(result);
          })
          .catch((err) => {
            res.status(500).send("Greska u dodavanju telefona " + err);
          });
      });
      break;
    case "Password":
      var noviPass = bcrypt.hashSync(req.body.noviPass, 10);
      neo4jSession.writeTransaction((tx) => {
        tx.run(
          `MATCH (k:Korisnik {username: $username}) SET k.password = '${noviPass}' RETURN k`,
          { username }
        )
          .then((result) => {
            res.status(200).send(result);
          })
          .catch((err) => {
            res.status(500).send("Greska u dodavanju sifre " + err);
          });
      });
      break;
  }
});

router.delete("/obrisiKorisnika", authenticateJWTToken, (req, res) => {
  var username = req.query.username;
  neo4jSession
    .run("MATCH (k:Korisnik{username:$username}) DELETE k", { username })
    .then((result) => {
      res.status(200).send(result);
    })
    .catch((err) => {
      res.status(500).send(err);
    });
});

router.post("/kupiProizvode", authenticateJWTToken, (req, res) => {
  //username Korisnika kaže ko je kupio
  //niz naziva Proizvoda je sve ono što je kupio
  //neka se sabere i posalje ukupna cena sa fronta

  //zaProizvod se azurira brojKupovina

  //za cassandru ide niz naziva proizvoda, username korisnika, ukupna cena i vreme kupovine

  var username = req.body.username;
  var nizProizvoda = req.body.nizProizvoda;

  let currentDate = new Date();
  let datum = `${currentDate.getDate()} / ${
    currentDate.getMonth() + 1
  } / ${currentDate.getFullYear()} `;

  neo4jSession.writeTransaction((tx) => {
    nizProizvoda.forEach((naziv) => {
      tx.run(
        `MATCH (p:Proizvod{naziv : $naziv}) 
                      MATCH (k:Korisnik{username : $username })
                      SET p.brojKupovina = p.brojKupovina + 1
                      CREATE (k)-[rel:KUPIO{DatumKupovine:'${datum}'}]->(p)`,
        { naziv, username }
      )
        .then((result) => {
          console.log("Uspesna relacija");
          console.log(datum);
        })
        .catch((err) => {
          res.status(500).send("GRESKA KOD RELACIJA" + err);
        });
    });
  });

  res.status(200).send(req.body.nizProizvoda);
});

function vratiKomentarisaoRelaciju(req, res, next) {
  var username = req.body.username;
  var naziv = req.body.naziv;

  neo4jSession
    .run(
      `
                RETURN EXISTS((:Proizvod{naziv : $naziv})<-[:KOMENTARISAO]-(:Korisnik{username : $username }))`,
      { naziv, username }
    )
    .then((result) => {
      req.body.postojiKomentar = result;

      next();
    })
    .catch((err) => {
      res.status(500).send("NEUSPENO" + err);
    });
}

//router.post('/komentarisiProizvod', authenticateJWTToken, (req,res)=>{
router.post(
  "/komentarisiProizvod",
  [vratiOcenioRelaciju, vratiKomentarisaoRelaciju, authenticateJWTToken],
  (req, res) => {
    var username = req.body.username;
    var komentar = req.body.komentar;
    var naziv = req.body.naziv;

    //Ako postoji ocena, a ne postoji komentar, moze da se dozvoli komentarisanje
    if (
      req.body.postoji.records[0]._fields[0] == true &&
      req.body.postojiKomentar.records[0]._fields[0] == false
    ) {
      neo4jSession.writeTransaction((tx) => {
        tx.run(
          `MATCH (p:Proizvod{naziv : $naziv}), (k:Korisnik{username : $username })
                CREATE (p)<-[rel:KOMENTARISAO {komentar : '${komentar}'}]-(k)`,
          { naziv, username }
        )
          .then((result) => {
            res.status(200).send("Komentarisanje uspesno");
          })
          .catch((err) => {
            res.status(500).send("NEUSPENO" + err);
          });
      });
    } else {
      if (req.body.postoji.records[0]._fields[0] == false)
        res
          .status(400)
          .send("Potrebno je oceniti proizvod pre komentarisanja!");

      res.status(400).send("Vec ste komentarisali proizvod!");
    }
  }
);

router.get("/pogledajSvojeTransakcije", authenticateJWTToken, (req, res) => {
  var username = req.query.username;

  neo4jSession.readTransaction((tx) => {
    tx.run(
      "MATCH (k:Korisnik{username:$username})-[r:KUPIO]->(p:Proizvod) RETURN p,r ORDER BY r.DatumKupovine DESC",
      { username }
    )
      .then((result) => {
        var output = [];
        result.records.forEach((element) => {
          const podatak1 = element._fields[0].properties;
          const podatak2 = element._fields[1].properties;
          output.push({...podatak1, ...podatak2});
        });
        res.status(200).send(output);
      })
      .catch((err) => {
        res.status(500).send("ERR TRANSAKCIJA" + err);
      });
  });
});

function vratiOcenioRelaciju(req, res, next) {
  var username = req.body.username;
  var naziv = req.body.naziv;

  neo4jSession
    .run(
      `
      RETURN EXISTS((:Proizvod{naziv : $naziv})<-[:OCENIO]-(:Korisnik{username : $username }))`,
      { naziv, username }
    )
    .then((result) => {
      //res.status(200).send('Ocenjivanje uspesno')
      req.body.postoji = result;

      next();
    })
    .catch((err) => {
      res.status(500).send("NEUSPENO" + err);
    });
}

//RELACIJA OCENI:
//router.post('/oceniProizvod', authenticateJWTToken, (req, res) =>
router.post(
  "/oceniProizvod",
  [authenticateJWTToken, vratiOcenioRelaciju],
  (req, res) => {
    var username = req.body.username;
    var ocena = req.body.ocena;
    var naziv = req.body.naziv;

    if (req.body.postoji.records[0]._fields[0] == false) {
      neo4jSession.writeTransaction((tx) => {
        tx.run(
          `MATCH (p:Proizvod{naziv : $naziv}), (k:Korisnik{username : $username })
                CREATE (p)<-[rel:OCENIO {ocena : ${ocena}}]-(k)`,
          { naziv, username }
        )
          .then((result) => {
            console.log("OCENIO SAM!");
            res.status(200).send("Ocenjivanje uspesno");
          })
          .catch((err) => {
            res.status(500).send("NEUSPENO" + err);
          });
      });
    } else {
      res.status(400).send("Vec ste ocenili proizvod!");
    }
  }
);

//TODO PREPOURKA PROIZVODA

//isto iz req.query idu param i to req.query.username

//Nalazi 5 korisnika koji su najslicniji po ukusu kao dati korisnik i nalazi proizvode koje su
//oni najbolje ocenili a da ih dati korisnik nije kupio

router.get(
  "/preporuceniProizvodiMetodaPrva",
  authenticateJWTToken,
  (req, res) => {
    var username = req.query.username;

    var listaPreporucenihProizvoda = [];

    /*MATCH (u1:User {name:"Cynthia Freeman"})-[r:RATED]->(m:Movie)
    WITH u1, avg(r.rating) AS u1_mean

    MATCH (u1)-[r1:RATED]->(m:Movie)<-[r2:RATED]-(u2)
    WITH u1, u1_mean, u2, COLLECT({r1: r1, r2: r2}) AS ratings WHERE size(ratings) > 10

    MATCH (u2)-[r:RATED]->(m:Movie)
    WITH u1, u1_mean, u2, avg(r.rating) AS u2_mean, ratings

    UNWIND ratings AS r

    WITH sum( (r.r1.rating-u1_mean) * (r.r2.rating-u2_mean) ) AS nom,
        sqrt( sum( (r.r1.rating - u1_mean)^2) * sum( (r.r2.rating - u2_mean) ^2)) AS denom,
        u1, u2 WHERE denom <> 0

    WITH u1, u2, nom/denom AS pearson
    ORDER BY pearson DESC LIMIT 10

    MATCH (u2)-[r:RATED]->(m:Movie) WHERE NOT EXISTS( (u1)-[:RATED]->(m) )

    RETURN m.title, SUM( pearson * r.rating) AS score
    ORDER BY score DESC LIMIT 25*/

    neo4jSession
      .run(
        "MATCH (k1:Korisnik{username:$username})-[r:OCENIO]->(p:Proizvod) \
                      WITH k1,avg(r.ocena) as k1_mean \
                      MATCH (k1)-[r1:OCENIO]->(p:Proizvod)<-[r2:OCENIO]-(k2:Korisnik) \
                      WITH k1, k1_mean, k2, COLLECT({r1:r1, r2:r2}) AS ocene WHERE size(ocene) > 1 \
                      MATCH (k2)-[rel:OCENIO]->(p:Proizvod) \
                      WITH k1, k1_mean, k2, avg(rel.ocena) AS k2_mean, ocene \
                      UNWIND ocene as o \
                      WITH sum( (o.r1.ocena - k1_mean) * (o.r2.ocena - k2_mean) ) AS nom, \
                      sqrt(sum( (o.r1.ocena - k1_mean)^2 + (o.r2.ocena - k2_mean)^2 )) as denom, \
                      k1,k2 WHERE denom <> 0 \
                      WITH k1,k2, nom/denom as pearson \
                      ORDER BY pearson DESC LIMIT 10 \
                      MATCH(k2)-[r:OCENIO]->(p:Proizvod) WHERE NOT EXISTS ((k1)-[:KUPIO]->(p) ) \
                      RETURN p, SUM(pearson * r.ocena) as score \
                      ORDER BY score DESC LIMIT 20",
        { username }
      )
      .then((result) => {
        let nizZaVracanje = [];
        result.records.forEach((record) => {
          let props = record._fields[0].properties;

          let found = false;

          nizZaVracanje.forEach((element) => {
            if (element.naziv === props.naziv) {
              found = true;
            }
          });
          if (!found) nizZaVracanje.push(props);
        });
        res.status(200).send(nizZaVracanje);
      })
      .catch((err) => {
        res.status(500).send("Preporuka ne radi" + err);
      });
  }
);

//Korisnici koji su kupili ovo sto si ti, kupili su jos i...
//req.query.username je parametar
router.get(
  "/preporuceniProizvodiMetodaDruga",
  authenticateJWTToken,
  (req, res) => {
    var username = req.query.username;
    neo4jSession
      .run(
        "MATCH (k:Korisnik{username:$username})-[rel:KUPIO]->(p:Proizvod)<-[rel2:KUPIO]-(k2:Korisnik)-[rel3:KUPIO]->(p2:Proizvod) \
                      WHERE k.username <> k2.username and p.naziv <> p2.naziv and p2.brojOcena <> 0 \
                      RETURN p2 ORDER BY (p2.zbirOcena/p2.brojOcena) DESC LIMIT 6",
        { username }
      )
      .then((result) => {
        var nizZaVracanje = [];

        result.records.forEach((record) => {
          let props = record._fields[0].properties;

          let found = false;

          nizZaVracanje.forEach((element) => {
            if (element.naziv === props.naziv) {
              found = true;
            }
          });
          if (!found) nizZaVracanje.push(props);
        });

        res.status(200).send(nizZaVracanje);
      })
      .catch((err) => {
        res.status(500).send("Preporuka 2 ne radi" + err);
      });
  }
);

//ovo gleda koje kategorije i tip proizvoda korisnik kupuje i predlaze mu iy tih kategorija/tipova
//proizvode koje nije jos uvek kupio
//isto je iz req.query.username korisnik
router.get(
  "/preporuceniProizvodiMetodaTreca",
  authenticateJWTToken,
  (req, res) => {
    var username = req.query.username;

    neo4jSession
      .run(
        "MATCH (k:Korisnik{username:$username})-[r:KUPIO]->(p:Proizvod) \
                MATCH (p2:Proizvod) WHERE p.naziv <> p2.naziv AND \
                p2.kategorija = p.kategorija \
                or p2.tip = p.tip or p2.proizvodjac = p.proizvodjac \
                MATCH (k2:Korisnik)-[rel:KUPIO]->(p2) \
                WHERE k2.username <> k.username \
                WITH avg(rel.ocena) as mean, p2 as proizvod2 \
                RETURN proizvod2, mean \
                ORDER BY mean DESC LIMIT 10",
        { username }
      )
      .then((result) => {
        var nizZaVracanje = [];
        result.records.forEach((record) => {
          let props = record._fields[0].properties;

          let found = false;

          nizZaVracanje.forEach((element) => {
            if (element.naziv === props.naziv) {
              found = true;
            }
          });
          if (!found) nizZaVracanje.push(props);
        });
        res.status(200).send(nizZaVracanje);
      })
      .catch((err) => {
        res.status(500).send("Preporuka 3 ne radi" + err);
      });
  }
);
module.exports = router;
