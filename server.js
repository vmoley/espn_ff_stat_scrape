var express     = require('express');
var fs          = require('fs');
var request     = require('request');
var cheerio     = require('cheerio');
var scrape      = require('./scrape');
var persistence = require('./persistence');

var app         = express();

app.get('/scrape', function(req, res){
    fs.unlink('output.json', function(){});

    var players;
    var initPlayerIdx = 2;
    var playerIdx = initPlayerIdx;
    var completionMap = { 
       QB: {
            total: 0,
            cntr: 0
       },
       RB: {
            total: 0,
            cntr: 0
       },
       WR: {
            total: 0,
            cntr: 0
       },
       TE: {
            total: 0,
            cntr: 0
       }
    };
    var completionHandler = function(position, playerName){
        var status = completionMap[position];

        status.cntr++;

        //console.log(playerName + ' - ' + position + ' ' + status.cntr + ' of ' + status.total);

        if(status.cntr >= status.total) {
            console.log(position + "s DONE");

            playerIdx = initPlayerIdx;
            players = null;

            retrieveNextPositionStats();
        } else {
            retrieveNextPlayer();
        }
    };

    var requestHandler = function(error, response, html){
        if(!error){
            var $ = cheerio.load(html);

            $('.games-fullcol').filter(function(){
                var data = $(this);
                players = data.find(".playerTableTable tr");
                var pos = $(players.find(".playertablePlayerName")[1]).text().split(/\s/)[3];

                console.log(pos + " - " + (players.length - 2));

                completionMap[pos].total = (players.length - 2);

                retrieveNextPlayer();
            });
        } else {
            console.log(error);
        }
    };

    /*
        0  => "QB",
        2  => "RB",
        4  => "WR",
        6  => "TE",
        16 => "DST"
    */

    var week = 4;
    var season = 2015;
    var positions = [0, 2, 4, 6];

    var retrieveNextPositionStats = function(){
        var position = positions.pop();

        if(position != null){
            var url = 'http://games.espn.go.com/ffl/leaders?&slotCategoryId=' + position + '&scoringPeriodId=' + week + '&seasonId=' + season;

            request(url, requestHandler);
        } else {
            console.log("ALL DONE");
        }
    };
    var retrieveNextPlayer = function(){
        var player = players[playerIdx];
        playerIdx++;
        var stats = scrape.retrievePlayerStats(player);

        stats.pts.week = week;
        stats.passing.week = week;
        stats.rushing.week = week;
        stats.receiving.week = week;

        if(stats.position == "QB"){
            stats.receiving = null;
        } else if(stats.position != "QB"){
            stats.passing = null;
        } else if(stats.position != "QB" && stats.position != "RB" && stats.position != "TE"){
            stats.rushing = null;
        }

        fs.appendFile('output.json', JSON.stringify(stats, null, 4), function(){});

        persistence.insert(persistence.tables.player, { name: stats.name, team: stats.team, position: stats.position }, function(id){
            if(id == null){
                persistence.select(stats.name, stats.team, stats.position, function(id){
                    persistence.saveStats(id, stats.pts, stats.passing, stats.rushing, stats.receiving, function(){
                        completionHandler(stats.position, stats.name);
                    }, true);
                }, true);
            } else {
                persistence.saveStats(id, stats.pts, stats.passing, stats.rushing, stats.receiving, function(){
                    completionHandler(stats.position, stats.name);
                }, true);
            }
        });
    };

    retrieveNextPositionStats();
});

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;