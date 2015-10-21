var express = require('express');
var fs = require('fs');
var request = require('request');
var cheerio = require('cheerio');
var app     = express();

app.get('/scrape', function(req, res){
    /*
        ================================
        TODO:
            - add loop for other weeks
            - add other positions
            - insert into mysql 
        ================================
    */

    /*
        0  => "QB",
        2  => "RB",
        4  => "WR",
        6  => "TE",
        16 => "DST"
    */

    var position = 0;
    var week = 4;
    var season = 2015;

    url = 'http://games.espn.go.com/ffl/leaders?&slotCategoryId=' + position + '&scoringPeriodId=' + week + '&seasonId=' + season;

    // The structure of our request call
    // The first parameter is our URL
    // The callback function takes 3 parameters, an error, response status code and the html

    request(url, function(error, response, html){
        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            console.log($);

            var json  = [];

            $('.games-fullcol').filter(function(){
                // Let's store the data we filter into a variable so we can easily see what's going on.

                var data = $(this);
                var json = [];

                // In examining the DOM we notice that the title rests within the first child element of the header tag. 
                // Utilizing jQuery we can easily navigate and get the text by writing the following code:

                var players = data.find(".playerTableTable tr");

                players.each(function(index, value){
                	var player = $(this);
                	var stats = player.find(".playertableStat ");

                	var playerName = player.find(".playertablePlayerName a").text();
                	var passingCa = $(stats[0]).text();
                	var passingYds = $(stats[1]).text();
                	var passingTd = $(stats[2]).text();
                	var passingInt = $(stats[3]).text();

                    var rushingAtt = $(stats[4]).text();
                    var rushingYds = $(stats[5]).text();
                    var rushingTd = $(stats[6]).text();

                    var twoPtConv = $(stats[11]).text();
                    var fumbl = $(stats[12]).text();


                	if(index > 1){
                		json.push({
                            "Player Name": playerName,
                            "Passing C/A": passingCa,
                            "Passing Yds": passingYds,
                            "Passing Tds": passingTd,
                            "Passing Int": passingInt,

                            "Rushing Att": rushingAtt,
                            "Rushing Yds": rushingYds,
                            "Rushing Tds": rushingTd,

                            "Two Pt Conv": twoPtConv,
                            "Fumbles": fumbl
                        }); 
                	}
                });

                fs.writeFile('output.json', JSON.stringify(json, null, 4), function(err){
                    console.log('File successfully written! - Check your project directory for the output.json file');
                });

                // Finally, we'll just send out a message to the browser reminding you that this app does not have a UI.
                res.send('Check your console!');
            });
        }
    })
})

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;