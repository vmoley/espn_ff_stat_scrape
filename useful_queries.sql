SELECT pl.name, pts.opponent, pts.pts
FROM player_wk_espn_pts pts
INNER JOIN player pl ON pl.id=pts.player_id
WHERE pts > 10
ORDER BY pts DESC;


SELECT pl.name, pts.opponent, pass.ca, pass.yds, pass.tds, pass.ints, pts.pts
FROM player_wk_passing_stats pass
INNER JOIN player pl ON pl.id=pass.player_id
INNER JOIN player_wk_espn_pts pts ON pts.player_id=pass.player_id
#ORDER BY yds DESC, tds DESC, ints DESC
ORDER BY pts DESC
;

SELECT pl.name, pts.opponent, rush.yds, rush.tds, rush.att, rush.fmbls, pts.pts
FROM player_wk_rushing_stats rush
INNER JOIN player pl ON pl.id=rush.player_id
INNER JOIN player_wk_espn_pts pts ON pts.player_id=rush.player_id
WHERE pts > 10
ORDER BY yds DESC, tds DESC, att DESC
;
