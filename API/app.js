const express = require('express');
const cors = require('cors');
const path = require('path');

var dir = path.join(__dirname);

const cas_proizvod_Router = require('./routes/cas_proizvod');
const cas_proizvodjac_Router = require('./routes/cas_proizvodjac');
const cas_transakcija_Router = require('./routes/cas_transakcija');
const cas_popularno_Router = require('./routes/cas_popularno');

const neo_proizvod_Router = require('./routes/neo_proizvod');
const neo_prodavnica_Router = require('./routes/neo_prodavnica');
const neo_korisnik_Router = require('./routes/neo_korisnik');
const neo_radnik_Router = require('./routes/neo_radnik');

const corsOptions = {
    origin:'http://localhost:4200'
}


const app = express();
const APIRouter = express.Router();
const rootRouter = express.Router();


app.use(cors(corsOptions));

rootRouter.use('/cas_proizvod', cas_proizvod_Router);
rootRouter.use('/cas_proizvodjac', cas_proizvodjac_Router);
rootRouter.use('/cas_transakcija', cas_transakcija_Router);
rootRouter.use('/cas_popularno', cas_popularno_Router);

rootRouter.use('/neo_proizvod', neo_proizvod_Router);
rootRouter.use('/neo_prodavnica', neo_prodavnica_Router);
rootRouter.use('/neo_korisnik', neo_korisnik_Router);
rootRouter.use('/neo_radnik', neo_radnik_Router);

app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(express.static(dir));

app.use('/', rootRouter);

const PORT = process.env.PORT || 5000;

app.listen(PORT, ()=>console.log("Server is running on PORT 5000....."));

app.get('/', (req,res)=>{
    res.status(200).send('Glavna stranica ')
})



