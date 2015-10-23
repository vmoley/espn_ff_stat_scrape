var mysql       = require('mysql');

var pool        = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'root',
    database: 'fantasyfootball'
});

exports.tables = {
    "player":       "player",
    "playerPts":    "player_wk_espn_pts",
    "passingStats": "player_wk_passing_stats",
    "rushingStats": "player_wk_rushing_stats", 
    "receivingStats": "player_wk_receiving_stats"
};

exports.insert = function(table, values, callback, debug){
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

       //console.log(query.sql);
    });
}

exports.select = function(playerName, team, position, callback){
	pool.getConnection(function(err, connection){
	    var query = connection.query('SELECT id FROM ' + exports.tables.player + ' WHERE name=? AND team=? AND position=?', [playerName, team, position], function(err, rows, fields){
	        connection.release();

	        if(err){
	            console.log('Error Code: ' + err.code);
	            console.log('Error Msg: ' + err.message);
	            console.log('Query: ' + query.sql);

	            return callback(null);
	        }

	        //console.log(rows);

	        callback(rows[0].id);
	    });

	    //console.log(query.sql);
	});
}

exports.saveStats = function(id, pts, passing, rushing, receiving, callback, debug){
    if(passing != null && passing.yds > 0){
        passing.player_id = id;

        exports.insert(exports.tables.passingStats,   passing,    function(){}, debug);
    }
    if(rushing != null && rushing.yds > 0){
        rushing.player_id = id;

        exports.insert(exports.tables.rushingStats,   rushing,    function(){}, debug);
    }
    if(receiving != null && receiving.yds > 0){
        receiving.player_id = id;

        exports.insert(exports.tables.receivingStats, receiving,  function(){}, debug);
    }
    if(pts != null){
        pts.player_id = id;

        exports.insert(exports.tables.playerPts,      pts,        function(){}, debug);
    }

    if(callback) callback();
};