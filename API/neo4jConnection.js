const neo4j = require('neo4j-driver');

const driver = neo4j.driver('bolt://localhost', neo4j.auth.basic('neo4j', 'pas123'),{ disableLosslessIntegers: true });

const session = driver.session();

if(session){
    console.log('Neo4j Connected...')
}
else {
    console.log("Neo4j NOT Connected...")
}
module.exports = session;