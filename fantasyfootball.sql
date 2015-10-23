CREATE DATABASE fantasyfootball;

DROP TABLE player;
DROP TABLE player_wk_espn_pts;
DROP TABLE player_wk_passing_stats;
DROP TABLE player_wk_rushing_stats;
DROP TABLE player_wk_receiving_stats;

DELETE FROM player;
DELETE FROM player_wk_espn_pts;
DELETE FROM player_wk_passing_stats;
DELETE FROM player_wk_rushing_stats;
DELETE FROM player_wk_receiving_stats;

CREATE TABLE player (
id INTEGER PRIMARY KEY AUTO_INCREMENT,
name VARCHAR(200) NOT NULL,
position VARCHAR(2) NOT NULL,
team VARCHAR(3) NOT NULL,

UNIQUE (name, position, team),

INDEX name_idx(name),
INDEX position_idx(position),
INDEX team_idx(team)
);

CREATE TABLE player_wk_espn_pts (
id INTEGER PRIMARY KEY AUTO_INCREMENT,
player_id INTEGER NOT NULL,
opponent VARCHAR(10) NOT NULL,
week INTEGER NOT NULL,
pts INTEGER NOT NULL,

UNIQUE (player_id, week),

INDEX player_id_idx(player_id),
INDEX opponent_idx(opponent),
INDEX week_idx(week),
INDEX pts_idx(pts)
);

CREATE TABLE player_wk_passing_stats (
id INTEGER PRIMARY KEY AUTO_INCREMENT,
player_id INTEGER NOT NULL,
week INTEGER NOT NULL,
ca VARCHAR(10) NOT NULL,
yds INTEGER NOT NUll,
tds INTEGER NOT NULL,
ints INTEGER NOT NULL,
two_pt_conv INTEGER NOT NULL,

UNIQUE (player_id, week),

INDEX player_id_idx(player_id),
INDEX week_idx(week),
INDEX ca_idx(ca),
INDEX yds_idx(yds),
INDEX tds_idx(tds),
INDEX ints_idx(ints),
INDEX two_pt_conv_idx(two_pt_conv)
);

CREATE TABLE player_wk_rushing_stats (
id INTEGER PRIMARY KEY AUTO_INCREMENT,
player_id INTEGER NOT NULL,
week INTEGER NOT NULL,
att INTEGER NOT NULL,
yds INTEGER NOT NUll,
tds INTEGER NOT NULL,
fmbls INTEGER NOT NULL,
two_pt_conv INTEGER NOT NULL,

UNIQUE (player_id, week),

INDEX player_id_idx(player_id),
INDEX week_idx(week),
INDEX att_idx(att),
INDEX yds_idx(yds),
INDEX tds_idx(tds),
INDEX fmbls_idx(fmbls),
INDEX two_pt_conv_idx(two_pt_conv)
);

CREATE TABLE player_wk_receiving_stats (
id INTEGER PRIMARY KEY AUTO_INCREMENT,
player_id INTEGER NOT NULL,
week INTEGER NOT NULL,
recs INTEGER NOT NULL,
yds INTEGER NOT NUll,
tds INTEGER NOT NULL,
trgts INTEGER NOT NULL,
fmbls INTEGER NOT NULL,
two_pt_conv INTEGER NOT NULL,

UNIQUE (player_id, week),

INDEX player_id_idx(player_id),
INDEX week_idx(week),
INDEX recs_idx(recs),
INDEX yds_idx(yds),
INDEX trgts_idx(trgts),
INDEX tds_idx(tds),
INDEX fmbls_idx(fmbls),
INDEX two_pt_conv_idx(two_pt_conv)
);
