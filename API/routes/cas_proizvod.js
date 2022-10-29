const express = require("express");
const { copyFileSync } = require("fs");
const { Neo4jError } = require("neo4j-driver");
const neo4jSession = require("../neo4jConnection");
const cassandraClient = require("../cassandraConnect");
const router = express.Router();

const authenticateJWTToken = require("../auth").authenticateJWTToken;

//BITNO: Nema update ovde jer je naziv clustering key za ovu tabelu, ne moze da se menja

//Vraca sve kategorije i tipove
//Note: nisu lepo sortirani
//Mozda moze i preko Nea:
//MATCH (n: Proizvod)
//RETURN DISTINCT n.kategorija, n.tip
router.get("/vratiKategorijeTipove", (req, res) => {
  var query = "SELECT DISTINCT kategorija, tip FROM buyhub.proizvod_naziv";

  cassandraClient.execute(query, (err, result) => {
    if (err) {
      console.log("Unable to get data" + err);
    } else {
      console.log(req.query);
      res.status(200).send(result.rows);
    }
  });
});

/*
Za GET se salje Kategorija i Tip zbog particije uvek, salje se Pretraga : "Naziv" ili "Cena" ili "Ocena" ili "Popust" ili "Proizvodjac"
da bi se znalo kako da se pretrazi baza. Salje se i ascending : 0 ili 1, gde 1 znaci da se salje rastuce a 0 opadajauce
za Pretraga : "Naziv" salje se i Naziv proizvoda
za Pretraga : "Proizvodjac" salje se i Proizvodjac
*/
router.get("/", (req, res) => {
  var nazivQuery =
    "SELECT * FROM buyhub.proizvod_naziv WHERE kategorija = ? and tip = ? and naziv = ? ";
  var cenaQuery =
    "SELECT * FROM buyhub.proizvod_cenanaziv WHERE kategorija = ? and tip = ?";
  var ocenaQuery =
    "SELECT * FROM buyhub.proizvod_ocenanaziv WHERE kategorija = ? and tip = ?";
  var popustQuery =
    "SELECT * FROM buyhub.proizvod_popust WHERE kategorija = ? and tip = ?";
  var proizvodjacQuery =
    "SELECT * FROM buyhub.proizvod_proizvodjac WHERE kategorija = ? and tip = ? and proizvodjac = ?";

  var ascending = req.query.ascending;
  switch (req.query.pretraga) {
    case "Naziv":
      cassandraClient.execute(
        nazivQuery,
        [req.query.kategorija, req.query.tip, req.query.naziv],
        (err, result) => {
          if (err) {
            console.log("Unable to get data" + err);
          } else {
            console.log(req.query);
            res.status(200).send(result.rows);
          }
        }
      );
      break;
    case "Cena":
      cassandraClient.execute(
        cenaQuery,
        [req.query.kategorija, req.query.tip],
        (err, result) => {
          if (err) {
            console.log("Unable to get data" + err);
          } else {
            console.log(req.query);
            res
              .status(200)
              .send(ascending == 1 ? result.rows : result.rows.reverse());
          }
        }
      );
      break;
    case "Ocena":
      cassandraClient.execute(
        ocenaQuery,
        [req.query.kategorija, req.query.tip],
        (err, result) => {
          if (err) {
            console.log("Unable to get data" + err);
          } else {
            console.log(req.query);
            res
              .status(200)
              .send(ascending == 1 ? result.rows : result.rows.reverse());
          }
        }
      );
      break;
    case "Popust":
      cassandraClient.execute(
        popustQuery,
        [req.query.kategorija, req.query.tip],
        (err, result) => {
          if (err) {
            console.log("Unable to get data" + err);
          } else {
            console.log(req.query);
            res
              .status(200)
              .send(ascending == 1 ? result.rows : result.rows.reverse());
          }
        }
      );
      break;
    case "Proizvodjac":
      cassandraClient.execute(
        proizvodjacQuery,
        [req.query.kategorija, req.query.tip, req.query.proizvodjac],
        (err, result) => {
          if (err) {
            console.log("Unable to get data" + err);
          } else {
            console.log(req.query);
            res.status(200).send(result.rows);
          }
        }
      );
      break;
  }
});

//ISTO IZ BODY IDU PARAMS, SLATI SA /r/n za svaku stavku
router.post(
  "/dodajUSveTabeleProizvoda",
  [authenticateJWTToken, dodajProizvodNeo],
  (req, res) => {
    var allArgs = [
      req.body.kategorija,
      req.body.tip,
      req.body.naziv,
      req.body.cena,
      req.body.ocena,
      req.body.proizvodjac,
      req.body.opis,
      req.body.slika,
      req.body.popust,
    ];
    var argsArray = [];
    for (i = 0; i < 5; i++) {
      allArgs.forEach((element) => {
        argsArray.push(element);
      });
    }
    //console.log(argsArray);
    var addAllQuery =
      "BEGIN BATCH INSERT INTO buyhub.proizvod_naziv (kategorija, tip, naziv, cena, ocena, proizvodjac, opis, slika, popust) VALUES (?,?,?,?,?,?,?,?,?) ; INSERT INTO buyhub.proizvod_cenanaziv (kategorija, tip, naziv, cena, ocena, proizvodjac, opis, slika, popust) VALUES (?,?,?,?,?,?,?,?,?); INSERT INTO buyhub.proizvod_ocenanaziv (kategorija, tip, naziv, cena, ocena, proizvodjac, opis, slika, popust) VALUES (?,?,?,?,?,?,?,?,?); INSERT INTO buyhub.proizvod_popust (kategorija, tip, naziv, cena, ocena, proizvodjac, opis, slika, popust) VALUES (?,?,?,?,?,?,?,?,?); INSERT INTO buyhub.proizvod_proizvodjac (kategorija, tip, naziv, cena, ocena, proizvodjac, opis, slika, popust) VALUES (?,?,?,?,?,?,?,?,?); APPLY BATCH";
    cassandraClient.execute(
      addAllQuery,
      argsArray,
      { prepare: true },
      (err, result) => {
        if (err) {
          console.log(req.body);
          console.log("Unable to put data" + err);
        } else {
          console.log(req.body);
          res.status(200).send(result);
        }
      }
    );
  }
);

//URADJENO
//KAD brisemo iz tabele naziv, pre brisanja da zapamtimo Cenu,Ocenu,Proizvodjaca,Popust
router.delete(
  "/obrisiIzSvihTabelaProizvoda",
  authenticateJWTToken,
  (req, res) => {
    var deleteNAZIVQuery =
      "DELETE FROM buyhub.proizvod_naziv WHERE kategorija = ? and tip = ? and naziv = ?;";
    var deleteCENAQuery =
      "DELETE FROM buyhub.proizvod_cenanaziv WHERE kategorija = ? and tip = ? and cena = ? and proizvodjac = ? and naziv = ?;";
    var deleteOCENAQuery =
      "DELETE FROM buyhub.proizvod_ocenanaziv WHERE kategorija = ? and tip = ? and ocena = ? and proizvodjac = ? and naziv = ?;";
    var deletePROIZVODJACQuery =
      " DELETE FROM buyhub.proizvod_proizvodjac WHERE kategorija = ? and tip = ? and proizvodjac = ? and naziv = ?;";
    var deletePOPUSTQuery =
      "DELETE FROM buyhub.proizvod_popust WHERE kategorija = ? and tip = ? and popust = ? and naziv = ?";
    var deleteAll =
      "BEGIN BATCH " +
      deleteNAZIVQuery +
      " " +
      deleteCENAQuery +
      " " +
      deleteOCENAQuery +
      " " +
      deletePROIZVODJACQuery +
      " " +
      deletePOPUSTQuery +
      " APPLY BATCH";

    cassandraClient.execute(
      deleteAll,
      [
        req.query.kategorija,
        req.query.tip,
        req.query.naziv,
        req.query.kategorija,
        req.query.tip,
        req.query.cena,
        req.query.proizvodjac,
        req.query.naziv,
        req.query.kategorija,
        req.query.tip,
        req.query.ocena,
        req.query.proizvodjac,
        req.query.naziv,
        req.query.kategorija,
        req.query.tip,
        req.query.proizvodjac,
        req.query.naziv,
        req.query.kategorija,
        req.query.tip,
        req.query.popust,
        req.query.naziv,
      ],
      { prepare: true },
      (err, result) => {
        if (err) {
          console.log(req.query);
          console.log("Unable to delete data" + err);
        } else {
          console.log(req.query);
          res.status(200).send(result);
        }
      }
    );
  }
);

//MENJAMO ILI OCENU ILI POPUST, OSTALO OSTAJE ISTO
//AKO SE MENJA OCENA, MENJAMO I U NEU
//Mora da se posalje ceo proizvod sa fronta, da bih mogao da ga nadjem
//u tabelama gde nije samo naziv clustering key
//i da bih mogao da obrisem i dodam ceo jedan red u tabelu u kojoj menjamo clustering key
router.put(
  "/updateProizvodOcena",
  [authenticateJWTToken, vratiOcenioRelaciju, updateOcenaNEO],
  (req, res) => {
    var staraOcena = 0;
    if (req.body.proizvod.brojOcena != 1)
      staraOcena =
        (req.body.proizvod.zbirOcena - req.body.novaOcena) /
        (req.body.proizvod.brojOcena - 1);
    if (req.body.postoji.records[0]._fields[0] == false) {
      const batchQueries = [
        {
          query:
            "UPDATE buyhub.proizvod_naziv SET ocena = ? WHERE kategorija = ? and tip = ? and naziv = ?",
          params: [
            parseFloat(
              req.body.proizvod.zbirOcena / req.body.proizvod.brojOcena
            ).toFixed(2),
            req.body.proizvod.kategorija,
            req.body.proizvod.tip,
            req.body.proizvod.naziv,
          ],
        },
        {
          query:
            "UPDATE buyhub.proizvod_cenanaziv SET ocena = ? WHERE kategorija = ? and tip = ? and cena = ? and proizvodjac = ? and naziv = ?",
          params: [
            req.body.proizvod.zbirOcena / req.body.proizvod.brojOcena,
            req.body.proizvod.kategorija,
            req.body.proizvod.tip,
            req.body.proizvod.cena,
            req.body.proizvodjac,
            req.body.proizvod.naziv,
          ],
        },
        {
          query:
            "UPDATE buyhub.proizvod_proizvodjac SET ocena = ? WHERE kategorija = ? and tip = ? and proizvodjac = ? and naziv = ?",
          params: [
            req.body.proizvod.zbirOcena / req.body.proizvod.brojOcena,
            req.body.proizvod.kategorija,
            req.body.proizvod.tip,
            req.body.proizvodjac,
            req.body.proizvod.naziv,
          ],
        },
        {
          query:
            "UPDATE buyhub.proizvod_popust SET ocena = ? WHERE kategorija = ? and tip = ? and popust = ? and naziv = ? ",
          params: [
            req.body.proizvod.zbirOcena / req.body.proizvod.brojOcena,
            req.body.proizvod.kategorija,
            req.body.proizvod.tip,
            req.body.proizvod.popust,
            req.body.proizvod.naziv,
          ],
        },
        {
          query:
            "DELETE FROM buyhub.proizvod_ocenanaziv WHERE kategorija = ? and tip = ? and ocena = ? and proizvodjac = ? and naziv = ? ",
          params: [
            req.body.proizvod.kategorija,
            req.body.proizvod.tip,
            staraOcena,
            req.body.proizvodjac,
            req.body.proizvod.naziv,
          ],
        },
        {
          query:
            "INSERT INTO buyhub.proizvod_ocenanaziv (kategorija, tip, ocena, proizvodjac,naziv,cena,opis,popust,slika ) VALUES(?,?,?,?,?,?,?,?,?)",
          params: [
            req.body.proizvod.kategorija,
            req.body.proizvod.tip,
            req.body.proizvod.zbirOcena / req.body.proizvod.brojOcena,
            req.body.proizvodjac,
            req.body.proizvod.naziv,
            req.body.proizvod.cena,
            req.body.proizvod.opis,
            req.body.proizvod.popust,
            req.body.proizvod.slika,
          ],
        },
      ];

      cassandraClient.batch(batchQueries, { prepare: true }, (err, result) => {
        if (err) {
          console.log(req.body);
          console.log("Unable to do whole update" + err.message);
        } else {
          console.log(req.body);
          res.status(200).send(result);
        }
      });
    } else {
      res.status(400).send('Vec ste ocenili proizvod!');
    }
  }
);

async function updateOcenaNEO(req, res, next) {
  ocena = req.body.novaOcena;
  neo4jSession.writeTransaction((tx) => {
    tx.run(
      `MATCH (p:Proizvod {naziv: $naziv}) SET p.brojOcena = p.brojOcena + 1, p.zbirOcena = p.zbirOcena + ${ocena} RETURN p`,
      { naziv: req.body.naziv }
    )
      .then((result) => {
        req.body.proizvod = result.records[0]._fields[0].properties;
        next();
      })
      .catch((err) => {
        res.status(500).send("Neo4j not working" + err);
      });
  });
}

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
      req.body.postoji = result;
      next();
    })
    .catch((err) => {
      res.status(500).send("NEUSPENO" + err);
    });
}

//salji mi i proslu vrednost popusta da bih mogao da nadjem u cassandri lepo sve
// req.body.stariPopust
router.put(
  "/updateProizvodPopust",
  [authenticateJWTToken, updatePopustNEO],
  (req, res) => {
    const batchQueries = [
      {
        query:
          "UPDATE buyhub.proizvod_naziv SET popust = ? WHERE kategorija = ? and tip = ? and naziv = ?",
        params: [
          req.body.popust,
          req.body.proizvod.kategorija,
          req.body.proizvod.tip,
          req.body.proizvod.naziv,
        ],
      },
      {
        query:
          "UPDATE buyhub.proizvod_cenanaziv SET popust = ? WHERE kategorija = ? and tip = ? and cena = ? and proizvodjac = ? and naziv = ?",
        params: [
          req.body.popust,
          req.body.proizvod.kategorija,
          req.body.proizvod.tip,
          req.body.proizvod.cena,
          req.body.proizvod.proizvodjac,
          req.body.proizvod.naziv,
        ],
      },
      {
        query:
          "UPDATE buyhub.proizvod_proizvodjac SET popust = ? WHERE kategorija = ? and tip = ? and proizvodjac = ? and naziv = ?",
        params: [
          req.body.popust,
          req.body.proizvod.kategorija,
          req.body.proizvod.tip,
          req.body.proizvod.proizvodjac,
          req.body.proizvod.naziv,
        ],
      },
      {
        query:
          "UPDATE buyhub.proizvod_ocenanaziv SET popust = ? WHERE kategorija = ? and tip = ? and ocena = ? and proizvodjac = ? and naziv = ? ",
        params: [
          req.body.popust,
          req.body.proizvod.kategorija,
          req.body.proizvod.tip,
          req.body.proizvod.zbirOcena / req.body.proizvod.brojOcena,
          req.body.proizvod.proizvodjac,
          req.body.proizvod.naziv,
        ],
      },
      {
        query:
          "DELETE FROM buyhub.proizvod_popust WHERE kategorija = ? and tip = ? and popust = ? and naziv = ? ",
        params: [
          req.body.proizvod.kategorija,
          req.body.proizvod.tip,
          req.body.stariPopust,
          req.body.proizvod.naziv,
        ],
      },
      {
        query:
          "INSERT INTO buyhub.proizvod_popust(kategorija, tip, ocena, proizvodjac,naziv,cena,opis,popust,slika ) VALUES(?,?,?,?,?,?,?,?,?)",
        params: [
          req.body.proizvod.kategorija,
          req.body.proizvod.tip,
          req.body.proizvod.zbirOcena / req.body.proizvod.brojOcena,
          req.body.proizvod.proizvodjac,
          req.body.proizvod.naziv,
          req.body.proizvod.cena,
          req.body.proizvod.opis,
          req.body.popust,
          req.body.proizvod.slika,
        ],
      },
    ];

    cassandraClient.batch(batchQueries, { prepare: true }, (err, result) => {
      if (err) {
        console.log(req.body);
        console.log("Unable to do whole update" + err.message);
      } else {
        console.log(req.body);
        res.status(200).send(result);
      }
    });
  }
);

async function updatePopustNEO(req, res, next) {
  var popust = req.body.popust;
  var naziv = req.body.naziv;
  neo4jSession
    .run(`MATCH (p:Proizvod{naziv:$naziv}) SET p.popust = ${popust} RETURN p`, {
      naziv,
    })
    .then((result) => {
      req.body.proizvod = result.records[0]._fields[0].properties;
      next();
    })
    .catch((err) => {
      res.status(500).send("NEO4J update POPUST ne radi" + err);
    });
}

async function dodajProizvodNeo(req, res, next) {
  var brojKupovina = 0;
  var brojOcena = 0;
  var cena = req.body.cena;
  var kategorija = req.body.kategorija;
  var naziv = req.body.naziv;
  var popust = 0;
  var tip = req.body.tip;
  var zbirOcena = 0;

  if (!naziv || popust < 0 || cena < 0 || brojKupovina < 0)
    res.status(400).send("Bad request params");

  const addQuery =
    "CREATE (p:Proizvod{brojKupovina : $brojKupovina,brojOcena : $brojOcena,cena : $cena,kategorija:$kategorija,naziv:$naziv,popust:$popust,tip:$tip,zbirOcena:$zbirOcena}) RETURN p";
  neo4jSession
    .run(addQuery, {
      brojKupovina,
      brojOcena,
      cena,
      kategorija,
      naziv,
      popust,
      tip,
      zbirOcena,
    })
    .then((result) => {
      next();
    })
    .catch((err) => {
      res.status(500).send("Neo4j not working" + err);
    });
}
module.exports = router;
