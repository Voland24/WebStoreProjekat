const express = require("express");
const { copyFileSync } = require("fs");
const cassandraClient = require("../cassandraConnect");
const neo4jSession = require("../neo4jConnection");
const router = express.Router();
const authenticateJWTToken = require("../auth").authenticateJWTToken;

router.get("/", napraviPopularneProizvode, (req, res) => {
  var getQuery = "SELECT * FROM buyhub.popularno WHERE popularno = ?";
  cassandraClient.execute(getQuery, ["POPULARNO"], (err, result) => {
    if (err) {
      console.log("Unable to get data" + err);
    } else {
      res.status(200).send(result.rows);
    }
  });
});

function napraviPopularneProizvode(req, res, next) 
{
  neo4jSession.readTransaction((tx) => 
  {
    tx.run(
      "MATCH (p:Proizvod) \
        WHERE p.brojKupovina >= 2 \
        and p.brojOcena > 1 \
        and p.zbirOcena / (p.brojOcena) > 3\
        RETURN p LIMIT 5"
    )
      .then((result) => {
        var argsArray = [];
        var i = 0;
        result.records.forEach((element) => {
          var elemUnpacked = element._fields[0].properties;
          argsArray.push({
            popularno: "POPULARNO",
            ocena: elemUnpacked.zbirOcena / elemUnpacked.brojOcena,
            cena: elemUnpacked.cena,
            kategorija: elemUnpacked.kategorija,
            naziv: elemUnpacked.naziv,
            tip: elemUnpacked.tip,
            slika: elemUnpacked.slika,
          });
        });
        var batchQueriesArray = [];
        argsArray.forEach((element) => {
          batchQueriesArray.push({
            query:
              "INSERT INTO buyhub.popularno (popularno, ocena, cena, kategorija,naziv,tip,slika) VALUES (?,?,?,?,?,?,?);",
            params: [
              element.popularno,
              element.ocena,
              element.cena,
              element.kategorija,
              element.naziv,
              element.tip,
              element.slika,
            ],
          });
        });
    
        cassandraClient.batch(
          batchQueriesArray,
          { prepare: true },
          (err, result) => {
            if (err) {
              console.log("Unable to put data" + err);
            }
            else
            {
              next();
            }
          }
        );
      })
  });
}

//Treba slika da se doda
router.post(
  "/dodajNovePopularne",
  [authenticateJWTToken, getPopularneProizvodeNeo],
  (req, res) => {
    var batchQueriesArray = [];
    req.body.argsArray.forEach((element) => {
      batchQueriesArray.push({
        query:
          "INSERT INTO buyhub.popularno (popularno, ocena, cena, kategorija,naziv,tip,slika) VALUES (?,?,?,?,?,?,?);",
        params: [
          element.popularno,
          element.ocena,
          element.cena,
          element.kategorija,
          element.naziv,
          element.tip,
          element.slika,
        ],
      });
    });

    cassandraClient.batch(
      batchQueriesArray,
      { prepare: true },
      (err, result) => {
        if (err) {
          console.log("Unable to put data" + err);
        }
      }
    );

    res.status(200).send(req.body.argsArray);
  }
);

router.delete("/obrisiOceneIPopularno", authenticateJWTToken,(req, res) => {
  var deletePopularno = "TRUNCATE buyhub.popularno";
  var deleteOcene = "TRUNCATE ocene";

  var executeBoth =
    "BEGIN BATCH" + deleteOcene + " " + deletePopularno + "APPLY BATCH";

  cassandraClient.execute(executeBoth, [], (err, result) => {
    if (err) {
      console.log(proizvod);
      console.log("Unable to put data" + err);
    } else {
      res.status(200).send(result);
    }
  });
});

async function getPopularneProizvodeNeo(req, res, next) {
  neo4jSession.readTransaction((tx) => {
    tx.run(
      "MATCH (p:Proizvod) \
        WHERE p.brojKupovina >= 2 \
        and p.brojOcena > 1 \
        and p.zbirOcena / (p.brojOcena) > 3\
        RETURN p LIMIT 5"
    )
      .then((result) => {
        var argsArray = [];
        var i = 0;
        result.records.forEach((element) => {
          var elemUnpacked = element._fields[0].properties;
          argsArray.push({
            popularno: "POPULARNO",
            ocena: elemUnpacked.zbirOcena / elemUnpacked.brojOcena,
            cena: elemUnpacked.cena,
            kategorija: elemUnpacked.kategorija,
            naziv: elemUnpacked.naziv,
            tip: elemUnpacked.tip,
            slika: elemUnpacked.slika,
          });
        });
        req.body.argsArray = argsArray;
        next();
      })
      .catch((err) => {
        res.status(500).send("Neo4j not working" + err);
      });
  });
}

module.exports = router;
