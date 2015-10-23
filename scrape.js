var cheerio = require('cheerio');

exports.retrievePlayerStats = function(playerHtmlSelector){
	var $ = cheerio.load(playerHtmlSelector);

	var stats = $(".playertableStat");

    var playerCol = $(".playertablePlayerName");
    var playerName = playerCol.find("a").text();
    var playerSplit = playerCol.text().split(/\s/);
    var playerTeam = playerSplit[2];
    var playerPos = playerSplit[3];

    var idx = 1;

    while(playerPos != "QB" && playerPos != "RB" && playerPos != "WR" && playerPos != "TE") {
        playerSplit = playerCol.text().split(/\s/);

        playerPos = playerSplit[idx].replace(/,/g, "");
        playerTeam = playerSplit[idx-1].replace(/,/g, "");

        idx++;
    }

    var opp = $(".flexpop:not([playerId])").text();

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

    var pts = $(".appliedPoints").text();

    var statsPts = {
        player_id:  null,
        opponent:   opp,
        pts:        pts
    };
    var statsPassing = {
        player_id:      null,
        ca:             passingCa,
        yds:            passingYds,
        tds:            passingTd,
        ints:           passingInt,
        two_pt_conv:    twoPtConv
    };
    var statsRushing = {
        player_id:      null,
        att:            rushingAtt,
        yds:            rushingYds,
        tds:            rushingTd,
        fmbls:          fumbl,
        two_pt_conv:    twoPtConv
    };
    var statsReceiving = {
        player_id:      null,
        recs:           receivingRecs,
        yds:            receivingYds,
        tds:            receivingTd,
        trgts:          receivingTrgts,
        fmbls:          fumbl,
        two_pt_conv:    twoPtConv 
    };

    var data = {
    	position: 	playerPos,
    	team: 		playerTeam,
    	name: 		playerName,
    	pts: 		statsPts,
    	passing: 	statsPassing,
    	rushing: 	statsRushing,
    	receiving: 	statsReceiving
    };

    return data;
}