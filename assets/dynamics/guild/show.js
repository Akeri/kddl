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
  $(document).on("click", ".btn-players-delete", function(){
    var playersId = $(this).data("players_id");
    var playersNickname = $(this).data("players_nickname");
    $("#players-delete-confirm form").attr("action", "/players/destroy/" + playersId);
    $("#players-delete-confirm #players-delete-confirm-nickname").text(playersNickname);
  });

})();