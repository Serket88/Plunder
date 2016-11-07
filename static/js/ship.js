/*
        Name:  ship.js
        Purpose:  to contain ship functions
        Notes:  I have no idea quite how I'm building this yet.  It's an experiment for now.
*/

function Ship()
{
	this.name = "undefined";
	this.playerID = null;

	this.acc = 0;
    this.hp = 0;
    this.pow = 0;
    this.man = 0;
    this.fer = 0;

    this.maxHp = 0;
    this.ammo = 3;
    this.repo = 0;
};

Ship.prototype.select = function(stats) {
    this.name = stats.name;
    this.playerID = stats.id;

    this.acc = stats.acc;
    this.hp = stats.hp;
    this.maxHp = stats.hp;
    this.pow = stats.pow;
    this.man = stats.man;
    this.fer = stats.fer;
};
