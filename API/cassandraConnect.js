const cassandra = require('cassandra-driver');

var contactPoints = ['127.0.0.1'];
var cassandraClient = new cassandra.Client({contactPoints: contactPoints, localDataCenter:'datacenter1', keyspace:'buyhub'})

cassandraClient.connect((err,res)=>{
    console.log('Cassandra connected....')
})

module.exports = cassandraClient;