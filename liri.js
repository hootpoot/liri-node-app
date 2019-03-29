require("dotenv").config();

var keys = require("./keys");
var inquirer = require("inquirer");
var axios = require("axios");
var moment = require("moment");
var Spotify = require("node-spotify-api");
var spotify = new Spotify(keys.spotify);
var fs = require("fs");

var action = process.argv[2];
var search = process.argv;
var input = "";

for (var i = 3; i < search.length; i++) {

    if (i > 3 && i < search.length) {
        input = input + "+" + search[i];
    } else {
        input += search[i];

    }
};



function concertThis(input) {
    var queryURL = "https://rest.bandsintown.com/artists/" + input + "/events?app_id=codingbootcamp";


    axios.get(queryURL).then(
        function (response) {

            var results = response.data;
            for (var i = 0; i < results.length; i++) {
                var venue = results[i].venue.name;
                var location = results[i].venue.city + ", " + results[i].venue.country;
                var date = results[i].datetime;
                var concertObject = new Concert(venue, location, date);
                concertObject.venueInfo();
            }
        }
    )
};

function Concert(venue, location, date) {
    this.venue = venue;
    this.location = location;
    this.date = date;

    this.venueInfo = function () {
        console.log("\n-------------\n");
        console.log("Venue: " + this.venue + "\nLocation: " + this.location + "\nDate: " + moment(this.date).format('L'));
        console.log("\n-------------\n");
    }
};

function spotifyThisSong(input) {
    spotify.search({
        type: 'track',
        query: input
    }, function (err, data) {
        if (err) {
            return console.log('Error occurred: ' + err);
        }

        function setSongObject() {
            var results = data.tracks.items;

            var name = results[0].name;
            var artist = results[0].artists[0].name;
            var link = results[0].preview_url;
            var album = results[0].album.name;
            var songObject = new Song(artist, name, link, album);
            songObject.songInfo();
        };


        if (data.tracks.items.length != 0) {
            setSongObject();
        } else {

            spotify.search({
                type: 'track',
                query: 'the+sign+ace+base'
            }, function (err, data) {
                if (err) {
                    return console.log('Error occurred: ' + err);
                }
                results = data.tracks.items;

                console.log("\n-------------\n");
                console.log("Artist: " + results[0].artists[0].name + "\nName: " + results[0].name + "\nLink: " + results[0].preview_url + "\nAlbum: " + results[0].album.name);
                console.log("\n-------------\n");
            })
        }
    })
};

function Song(artist, name, link, album) {
    this.artist = artist;
    this.name = name;
    this.link = link;
    this.album = album;
    this.songInfo = function () {
        console.log("\n-------------\n");
        console.log("Artist: " + this.artist + "\nTrack: " + this.name + "\nLink: " + this.link + "\nAlbum: " + this.album);
        console.log("\n-------------\n");
    }
};



function movieThis(input) {
    var queryURL = "http://www.omdbapi.com/?t=" + input + "&y=&plot=short&apikey=trilogy";
    var mrNobody = "http://www.omdbapi.com/?t=mr+nobody&y=&plot=short&apikey=trilogy"

    axios.get(queryURL).then(
        function (response) {

            function setMovieObject() {
                var results = response.data;
                var title = results.Title;
                var year = results.Year;
                var rating = results.imdbRating;
                var tomatoes = results.Ratings[1].Value;
                var country = results.Country;
                var language = results.Language;
                var plot = results.Plot;
                var actors = results.Actors;
                var movieObject = new Movie(title, year, rating, tomatoes, country, language, plot, actors);
                movieObject.movieInfo();
            };

            if (response.data.Response === "True") {
                setMovieObject();
            } else {
                console.log("yeeyee!")
                axios.get(mrNobody).then(
                    function (response) {
                        results = response.data;
                        console.log("\n-------------\n");
                        console.log("Title: " + results.Title + "\nYear: " + results.Year + "\nIMDB Rating: " + results.imdbRating + "\nRotten Tomatoes Score: " + results.Ratings[1].Value + "\nCountry: " + results.Country + "\nLanguage: " + results.Language + "\nPlot: " + results.Plot + "\nActors: " + results.Actors);
                        console.log("\n-------------\n");
                    }
                )
            }

        }
    )
};

function Movie(title, year, rating, tomatoes, country, language, plot, actors) {
    this.title = title;
    this.year = year;
    this.rating = rating;
    this.tomatoes = tomatoes;
    this.country = country;
    this.language = language;
    this.plot = plot;
    this.actors = actors;
    this.movieInfo = function () {
        console.log("\n-------------\n");
        console.log("Title: " + this.title + "\nYear: " + this.year + "\nIMDB Rating: " + this.rating + "\nRotten Tomatoes Score: " + this.tomatoes + "\nCountry: " + this.country + "\nLanguage: " + this.language + "\nPlot: " + this.plot + "\nActors: " + this.actors);
        console.log("\n-------------\n");
    };
};

function doWhat() {
    fs.readFile("random.txt", "utf8", function (error, data) {

        var instructions = data.split(",");
        

        if (instructions.length === 2) {
            action = instructions[0]; 
            input = instructions[1];
        } else if (instructions.length === 1) {
            action = instructions[0];
        }

        
        console.log(action + " " + input);

        spotifyThisSong("i+want+it+that+way");
        
    });
};


if (action === "concert-this") {
    concertThis(input);
} else if (action === "spotify-this-song") {
    spotifyThisSong(input);
} else if (action === "movie-this") {
    movieThis(input);
} else if (action === "do-what-it-says") {
    doWhat();
} else {
    console.log("Liri does not recognize this command.");
};