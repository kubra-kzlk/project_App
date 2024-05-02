import express, { Express } from 'express';
import { Lamp,Fabrikant  } from './interface';
import { connectToDatabase } from './database';
import dotenv from 'dotenv';
import path from "path";

const app: Express = express();// Get the default connection

dotenv.config(); // Load environment variables from .env file
app.set('view engine', 'ejs'); // EJS als view engine, Set the view engine for the app
app.use(express.json());// Parse JSON bodies for this app
app.use(express.urlencoded({ extended: true }));// Parse URL-encoded bodies for this app
app.use(express.static('public', { extensions: ['html'] }));// Serve static files from the 'public' directory. tell express to serve the content of public dir, the express.static middleware is used to serve static files from the public directory. The middleware should be added before any other routes or middleware.
app.set('views', path.join(__dirname, 'views'));// Set the views directory for the app
app.set('port', 3000);// Set the port for the app


// Parse JSON data
let lampsData: Lamp[] = [];
let fabricsData: Fabrikant[] = [];

app.get('/', async (req, res) => {
  res.render('index');
});

/* Als route niet bestaat */
app.use((_, res) => {
  res.type('text/html');
  res.status(404).render('404');
});

app.get("/register-success", (req, res) => {
  res.render("register-success");
});

app.get('/lamps', async (req, res) => {
  //zoekbalk producten
  const searchQuery =
    typeof req.query.q === 'string' ? req.query.q.toLowerCase() : '';
  let filteredLamps = lampsData;

  if (searchQuery) {
    filteredLamps = lampsData.filter(lamp =>
      lamp.naam.toLowerCase().includes(searchQuery)
    );
  }

  //sorteer gedeelte
  const sortField =
    typeof req.query.sortField === 'string' ? req.query.sortField : 'naam';
  const sortDirection =
    typeof req.query.sortDirection === 'string'
      ? req.query.sortDirection
      : 'asc';

  let sortedLamps = [...filteredLamps].sort((a, b) => {
    if (sortField === 'naam') {
      return sortDirection === 'asc'
        ? a.naam.localeCompare(b.naam)
        : b.naam.localeCompare(a.naam);
    } else if (sortField === 'prijs') {
      return sortDirection === 'asc' ? a.prijs - b.prijs : b.prijs - a.prijs;
    } else if (sortField === 'id') {
      return sortDirection === 'asc' ? a.id - b.id : b.id - a.id;
    } else if (sortField === 'kleur') {
      return sortDirection === 'asc'
        ? a.kleur.localeCompare(b.kleur)
        : b.kleur.localeCompare(a.kleur);
    } else if (sortField === 'actief') {
      return sortDirection === 'asc'
        ? Number(a.actief) - Number(b.actief)
        : Number(b.actief) - Number(a.actief);
    } else {
      return 0;
    }
  });

  const sortFields = [
    {
      value: 'naam',
      text: 'Naam',
      selected: sortField === 'naam' ? 'selected' : '',
    },
    {
      value: 'prijs',
      text: 'Prijs',
      selected: sortField === 'prijs' ? 'selected' : '',
    },
    {
      value: 'id',
      text: 'Id',
      selected: sortField === 'id' ? 'selected' : '',
    },
    {
      value: 'kleur',
      text: 'Kleur',
      selected: sortField === 'kleur' ? 'selected' : '',
    },
    {
      value: 'actief',
      text: 'Actief',
      selected: sortField === 'actief' ? 'selected' : '',
    },
  ];

  const sortDirections = [
    {
      value: 'asc',
      text: 'Ascending',
      selected: sortDirection === 'asc' ? 'selected' : '',
    },
    {
      value: 'desc',
      text: 'Descending',
      selected: sortDirection === 'desc' ? 'selected' : '',
    },
  ];

  res.render('lamps', {
    lamps: sortedLamps,
    sortFields: sortFields,
    sortDirections: sortDirections,
    sortField: sortField,
    sortDirection: sortDirection,
    searchQuery,
  });
});

app.get('/lampDetail/:id',  (req, res) => {
  const id = parseInt( req.params.id);
  const lamp = lampsData.find(l => l.id ===id);
  if(lamp){
    res.render('lampDetail', {
      lamp: lamp,
    });
  }else{
    res.status(404).send('Geen lamp gevonden')
  }
});

app.get('/fabrics', async (req, res) => {
  res.render('fabrics', {
    fabrics: fabricsData,
  });
});

app.get('/fabricDetail/:id',  (req, res) => {
  const id = parseInt( req.params.id);
  const fabric = fabricsData.find(f => f.id ===id);
  if(fabric){
    res.render('fabricDetail', {
      fabric: fabric,
    });
  }else{
    res.status(404).send('Geen lamp gevonden')
  }
});

// Database MongoDB
async function main() {
  try {
    await connectToDatabase();
    console.log('Connected to MongoDB Atlas from index.ts!');

  } catch (error) {
    console.error(error);
  }
}

//start server
app.listen(app.get('port'), async () => {
  const lampResponse = await fetch(
    'https://raw.githubusercontent.com/kubra-kzlk/lamps/main/lamps.json'
  );
  const data = await lampResponse.json();
  data.forEach((lamp: Lamp) => {
    lampsData.push(lamp);
  });

  const fabricResponse = await fetch(
    'https://raw.githubusercontent.com/kubra-kzlk/lamps/main/fabrikant.json'
  );
  const fabricdata = await fabricResponse.json();
  fabricdata.forEach((fabric: Fabrikant) => {
    fabricsData.push(fabric);
  });

  console.log('[server] http://localhost:' + app.get('port'));
});
