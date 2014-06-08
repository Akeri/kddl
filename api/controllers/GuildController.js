/**
 * GuildController
 *
 * @module      :: Controller
 * @description	:: A set of functions called `actions`.
 *
 *                 Actions contain code telling Sails how to respond to a certain type of request.
 *                 (i.e. do stuff, then send some JSON, show an HTML page, or redirect to another URL)
 *
 *                 You can configure the blueprint URLs which trigger these actions (`config/controllers.js`)
 *                 and/or override them with custom routes (`config/routes.js`)
 *
 *                 NOTE: The code you write here supports both HTTP and Socket.io automatically.
 *
 * @docs        :: http://sailsjs.org/#!documentation/controllers
 */

module.exports = {
    
  // Render the guild view
  show : function(req, res, next){
    var end = function(guild){
      res.view({
        guild : guild
      });
    };
    var guildId = req.param("id");
    Guild.findOne(guildId, function foundGuild(err, guild){
      if (err) return next(err);
      if (!guild){
        req.session.flash = {
          err : [{ message : "Guild not found" }]
        };
        return res.redirect("/");
      }
      Player.find({guildId : guildId})
        .exec(function foundPlayers(err, players){
          if (err) return next(err);
          guild.players = players;
          if (!players.length) return end(guild);
          var mapPlayers = _.indexBy(players, "id");
          Player.completeWithDetailedArmors(mapPlayers, function(err){
            if (err) return next(err);
            Player.completeWithPower(mapPlayers, function(err){
              if (err) return next(err);
              Player.completeWithUser(mapPlayers, function(err){
                if (err) return next(err);
                end(guild);
              });
            });
          });
      });
    });
  },
  
  // Render the guilds of session user
  showUserGuild : function(req, res, next){
    var userId = req.session.User.id;
    Player.find({userId : userId}, function(err, players){
      if (err) return next(err);
      var guildIds = [];
      _.each(players, function(player){
        if (player.guildId != null) guildIds.push(player.guildId);
      });
      if (!guildIds.length) res.redirect("/user/profile/" + userId);
      res.redirect("/guild/show/" + guildIds[0]);
    });
  }
  
};
