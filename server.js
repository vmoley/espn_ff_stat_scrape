var express     = require('express');
var fs          = require('fs');
var request     = require('request');
var cheerio     = require('cheerio');
var mysql       = require('mysql');

var app         = express();

var pool        = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'fantasyfootball'
});

var tables = {
    "player":       "player",
    "playerPts":    "player_wk_espn_pts",
    "passingStats": "player_wk_passing_stats",
    "rushingStats": "player_wk_rushing_stats", 
    "receivingStats": "player_wk_receiving_stats"
};

app.get('/scrape', function(req, res){
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

            retrieveNextPositionStats();
        }
    };

    var insertRecord = function(table, values, callback, debug){
        pool.getConnection(function(err, connection){
            var query = connection.query('INSERT INTO ' + table + ' SET ?', values, function(err, result){
                connection.release();

                if(!err){
                    return callback(result.insertId);
                } else if(debug && err.code != 'ER_DUP_ENTRY') {
                    console.log('Error Code: ' + err.code);
                    console.log('Error Msg: ' + err.message);
                    console.log('Query: ' + query.sql);
                }

                callback(null);
            });
        });
    };
    var selectPlayer = function(playerName, callback){
        pool.getConnection(function(err, connection){
            var query = connection.query('SELECT id FROM ' + tables.player + ' WHERE name=?', [playerName], function(err, rows, fields){
                connection.release();

                if(err){
                    console.log('Error Code: ' + err.code);
                    console.log('Error Msg: ' + err.message);
                    console.log('Query: ' + query.sql);

                    return callback(null);
                }

                callback(rows[0].id);
            });
        });
    };
    var insertStats = function(id, pts, passing, rushing, receiving, callback, debug){
        if(passing != null && passing.yds > 0){
            passing.player_id = id;

            insertRecord(tables.passingStats,   passing,    callback, debug);
        }
        if(rushing != null && rushing.yds > 0){
            rushing.player_id = id;

            insertRecord(tables.rushingStats,   rushing,    callback, debug);
        }
        if(receiving != null && receiving.yds > 0){
            receiving.player_id = id;

            insertRecord(tables.receivingStats, receiving,  callback, debug);
        }
        if(pts != null){
            pts.player_id = id;

            insertRecord(tables.playerPts,      pts,        callback, debug);
        }
    };

    var requestHandler = function(error, response, html){
        // First we'll check to make sure no errors occurred when making the request

        if(!error){
            // Next, we'll utilize the cheerio library on the returned html which will essentially give us jQuery functionality

            var $ = cheerio.load(html);

            $('.games-fullcol').filter(function(){
                // Let's store the data we filter into a variable so we can easily see what's going on.

                var data = $(this);

                // In examining the DOM we notice that the title rests within the first child element of the header tag. 
                // Utilizing jQuery we can easily navigate and get the text by writing the following code:

                var players = data.find(".playerTableTable tr");
                var pos = $(players.find(".playertablePlayerName")[1]).text().split(/\s/)[3];

                completionMap[pos].total = (players.length - 2);

                players.each(function(index, value){
                    // skip header
                    if(index > 1){
                        var player = $(this);
                        
                        var stats = player.find(".playertableStat");

                        var playerCol = player.find(".playertablePlayerName");
                        var playerName = playerCol.find("a").text();
                        var playerPos = playerCol.text().split(/\s/)[3];
                        var idx = 0;

                        while(playerPos != "QB" && playerPos != "RB" && playerPos != "WR" && playerPos != "TE") {
                            playerPos = playerCol.text().split(/\s/)[idx];
                            idx++;
                        }
                        

                        var opp = player.find(".flexpop:not([playerId])").text();

                        var passingCa = $(stats[0]).text();
                        var passingYds = $(stats[1]).text();
                        var passingTd = $(stats[2]).text();
                        var passingInt = $(stats[3]).text();

                        var rushingAtt = $(stats[4]).text();
                        var rushingYds = $(stats[5]).text();
                        var rushingTd = $(stats[6]).text();

                        var receivingRecs = $(stats[7]).text();
                        var receivingYds = $(stats[8]).text();
                        var receivingTd = $(stats[9]).text();
                        var receivingTrgts = $(stats[10]).text();

                        var twoPtConv = $(stats[11]).text();
                        var fumbl = $(stats[12]).text();

                        var pts = player.find(".appliedPoints").text();

                        var statsPts = {
                            player_id:  null,
                            week:       week,
                            opponent:   opp,
                            pts:        pts
                        };
                        var statsPassing = {
                            player_id:      null,
                            week:           week,
                            ca:             passingCa,
                            yds:            passingYds,
                            tds:            passingTd,
                            ints:           passingInt,
                            two_pt_conv:    twoPtConv
                        };
                        var statsRushing = {
                            player_id:      null,
                            week:           week,
                            att:            rushingAtt,
                            yds:            rushingYds,
                            tds:            rushingTd,
                            fmbls:          fumbl,
                            two_pt_conv:    twoPtConv
                        };
                        var statsReceiving = {
                            player_id:      null,
                            week:           week,
                            recs:           receivingRecs,
                            yds:            receivingYds,
                            tds:            receivingTd,
                            trgts:          receivingTrgts,
                            fmbls:          fumbl,
                            two_pt_conv:    twoPtConv 
                        };

                        if(playerPos == "QB"){
                            statsReceiving = null;
                        } else if(playerPos != "QB"){
                            statsPassing = null;
                        } else if(playerPos != "QB" && playerPos != "RB" && playerPos != "TE"){
                            statsRushing = null;
                        }

                        completionHandler(playerPos, playerName);

                        insertRecord(tables.player, { name: playerName }, function(id){
                            if(id == null){
                                selectPlayer(playerName, function(id){
                                    insertStats(id, statsPts, statsPassing, statsRushing, statsReceiving, function(){}, true);
                                }, true);
                            } else {
                                insertStats(id, statsPts, statsPassing, statsRushing, statsReceiving, function(){}, true);
                            }
                        }); 
                    }
                });
            });
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

    retrieveNextPositionStats();
});

app.listen('8081')

console.log('Magic happens on port 8081');

exports = module.exports = app;