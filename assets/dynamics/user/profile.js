(function(){
  
  // Render user actual time
  var timezone = $("#user-timezone").text();
  var actualTime = moment.tz(timezone).format("ddd, HH:mm");
  $("#user-actual-time").text(actualTime);
  
  // Render actual parameters on player delete confirm
  $(document).on("click", ".btn-player-delete", function(){
    var userId = $(this).data("user_id");
    var playerId = $(this).data("player_id");
    var playerName = $(this).data("player_name");
    $("#player-delete-confirm form").attr("action", "/user/" + userId + "/player/destroy/" + playerId);
    $("#player-delete-confirm #player-delete-confirm-name").text(playerName);
  });
  
})();