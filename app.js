require('dotenv').config();
const express = require('express');
const hbs = require('hbs');
const SpotifyWebApi = require('spotify-web-api-node');


const app = express();

// accept incoming request body
// app.use(express.json()) // as JSON
app.use(express.urlencoded({ extended: true })) // as url form data


app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

// setting the spotify-api goes here:
const spotifyApi = new SpotifyWebApi({
    clientId: process.env.CLIENT_ID,
    clientSecret: process.env.CLIENT_SECRET
  });
  
  // Retrieve an access token
  spotifyApi
    .clientCredentialsGrant()
    .then(data => spotifyApi.setAccessToken(data.body['access_token']))
    .catch(error => console.log('Something went wrong when retrieving an access token', error));

// test spotify
// spotifyApi.getArtistAlbums('43ZHCT0cAZBISjO8DG9PnE').then(
//     function(data) {
//       console.log('Artist albums', data.body);
//     },
//     function(err) {
//       console.error(err);
//     } 
//   );


// Our routes go here:
app.get('/', (req, res, next)=>{
    console.log(req);
    res.render('home');
})

app.get('/artist-search', (req,res,next) => {
    const {q} = req.query;
//   const searchArtist = q.split(' ').map((word)=> new RegExp(word, 'i'));

    spotifyApi.searchArtists(q)
  .then((data) => {
    const artists = data.body.artists.items.map((q) => {
      console.log(q, 'resultats artist search')
      return {
        id: q.id,
        name: q.name,
        imageUrl: q.images[0] ? q.images[0].url : null,
      }
    })
    res.render("artist-search-results", { artists })
  })
  .catch((err)=>{
      console.log(err)
  })   
})

//Get artist Albums
app.get("/albums/:artistId", (req, res, next) => {

  const { artistId } = req.params

  spotifyApi.getArtist(artistId)
    .then( data => {
      console.log(data, 'lartiste')
      const artistName = data.body.name;
      return artistName;
    })
    .catch()

  spotifyApi.getArtistAlbums(artistId, { limit: 10, offset: 0 })
  .then((data) => {
    console.log(data.body.items[0], 'la réponse')
    const albums = data.body.items.map((album) => {
      return {
        id: album.id,
        name: album.name,
        coverUrl: album.images[0] ? album.images[0].url : null,
        // artist : album.artists[0] ? album.artist[0].name : null
      }
    })
    const result = { albums }

    

    res.render("albums", result, )
  })
  .catch((err) => console.log("The error while searching albums occurred: ", err))
})


app.listen(3000, () => console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊'));
