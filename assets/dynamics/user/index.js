(function(){
  
  // Init Foo Table
  var $userTable = $("#user-table").footable();
  var userTableObj = $userTable.data("footable");
  var userFilter = $userTable.data("footable-filter");
  var nameColumnIndex = $userTable.find("th[data-name='nickname']").index();
  var roleColumnIndex = $userTable.find("th[data-name='role']").index();
  
  // Init user name filter
  $("#user-name-filter").on("keyup", function(e){
    var $this = $(this);
    userTableObj.timers.filter.stop();
    var timeout = userTableObj.options.filter.timeout;
    if (e.which === 27){
      $this.val("");
      timeout = 0;
    }
    userTableObj.timers.filter.start(function(){
      var val = $this.val();
      if (!val || val == "") val = false;
      var filterObj = {};
      filterObj[nameColumnIndex.toString()] = { term : val };
      userFilter.filterByColumn(filterObj);
    }, timeout);
  }).trigger("keyup");
  
  // Init user role filter
  $("#user-role-filter")
  .selectpicker({
    style : "btn-default",
    width : "100%"
  })
  .on("change", function(){
    var value = $(this).val();
    filterRole(value);
  }).trigger("change");
  
  function filterRole(value){
    if (value == "null") value = false;
    var filterObj = {};
    filterObj[roleColumnIndex.toString()] = {
      term      : value,
      compare   : function(subject, term, $cell){
        return $cell.data("value").toUpperCase() == term.toUpperCase();
      }
    };
    userFilter.filterByColumn(filterObj);
  }
  
  // Render actual parameters on user delete confirm
  $(document).on("click", ".btn-user-delete", function(){
    var userId = $(this).data("user_id");
    var userNickname = $(this).data("user_nickname");
    $("#user-delete-confirm form").attr("action", "/user/destroy/" + userId);
    $("#user-delete-confirm #user-delete-confirm-nickname").text(userNickname);
  });

})();