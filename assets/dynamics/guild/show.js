(function(){
  
  // Init Foo Table
  var $playersTable = $("#players-table").footable();
  var playersTableObj = $playersTable.data("footable");
  var playersFilter = $playersTable.data("footable-filter");
  var nameColumnIndex = $playersTable.find("th[data-name='name']").index();
  var rankColumnIndex = $playersTable.find("th[data-name='rank']").index();
  
  // Init players name filter
  $("#players-name-filter").on("keyup", function(e){
    var $this = $(this);
    playersTableObj.timers.filter.stop();
    var timeout = playersTableObj.options.filter.timeout;
    if (e.which === 27){
      $this.val("");
      timeout = 0;
    }
    playersTableObj.timers.filter.start(function(){
      var val = $this.val();
      if (!val || val == "") val = false;
      var filterObj = {};
      filterObj[nameColumnIndex.toString()] = { term : val };
      playersFilter.filterByColumn(filterObj);
    }, timeout);
  }).trigger("keyup");
  
  // Init players rank filter
  $("#players-rank-filter")
    .selectpicker({
      style : "btn-default",
      width : "100%"
    })
    .on("change", function(){
      var value = $(this).val();
      filterRank(value);
    }).trigger("change");
  
  function filterRank(value){
    if (value == "null") value = false;
    var filterObj = {};
    filterObj[rankColumnIndex.toString()] = {
      term      : value,
      compare   : function(subject, term, $cell){
        return $cell.data("value").toUpperCase() == term.toUpperCase();
      }
    };
    playersFilter.filterByColumn(filterObj);
  }
  
  // Render actual parameters on players delete confirm
  $(document).on("click", ".btn-player-kick", function(){
//    var guildId = $(this).data("guild_id");
    var guildName = $(this).data("guild_name");
    var playerId = $(this).data("player_id");
    var playerName = $(this).data("player_name");
    var $dialog = $("#player-kick-confirm");
    $dialog.find("[name='playerId']").val(playerId);
    $dialog.find(".dialog-guild-name").text(guildName);
    $dialog.find(".dialog-player-name").text(playerName);
    var $submit = $dialog.find(":submit");
    var userId = $(this).data("user_id");
    if (userId){
      $submit.attr("disabled", true);
      var userNickname = $(this).data("user_nickname");
      $dialog.find("[name='userId']").val(userId);
      $dialog.find(".dialog-user-nickname").text(userNickname);
      $dialog.find(".player-kick-confirm-single").hide();
      $dialog.find(".player-kick-confirm-opts").show();
      var $opts = $dialog.find(":radio[name='player-kick-opt']")
        .prop("checked", false)
        .off("change")
        .one("change", function(){
          $submit.attr("disabled", false);
        })
        .on("change", function(){
          var opt = $opts.filter(":checked").val();
          $dialog.find("form").attr("action", (function(opt){
            switch(opt){
              case "player-kick"                : return "/player/kick/" + playerId;
              case "user-delete-players-kick"   : return "/user/destroy/" + userId + "?kickPlayers=on";
              case "user-delete-players-delete" : return "/user/destroy/" + userId + "?deletePlayers=on";
            }
          })(opt));
        });
    }else{
      $submit.attr("disabled", false);
      $dialog.find(".player-kick-confirm-opts").hide();
      $dialog.find(".player-kick-confirm-single").show();
      $dialog.find("form").attr("action", "/player/kick/" + playerId);
    }
  });
  
  // Render unknown time on players without timezone
  $(".player-current-time:not([data-timezone])").html("<i>unknown</i>");

  // Render current time of players
  function renderTime(){
    $(".player-current-time[data-timezone]").each(function(){
      var $this = $(this);
      var timezone = $this.data("timezone");
      var actualTime = moment().tz(timezone);
      $this.text(actualTime.format("HH:mm (ddd)"));
    });
  }

  renderTime();
  setTimeout(renderTime, 1000); // render time every 1000ms

})();