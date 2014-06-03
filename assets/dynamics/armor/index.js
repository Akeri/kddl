(function(){
  
  // Init Foo Table
  var $armorTable = $(".footable").footable();
  var armorTableObj = $armorTable.data("footable");
  var armorFilter = $armorTable.data("footable-filter");
  var nameColumnIndex = $armorTable.find("th[data-name='name']").index();
  var rarityColumnIndex = $armorTable.find("th[data-name='rarity']").index();
  var elemsColumnIndex = $armorTable.find("th[data-name='elements']").index();
  
//  $(function(){
    
    // init armor name filter
    $("#armor-name-filter").on("keyup", function(e){
      var $this = $(this);
      armorTableObj.timers.filter.stop();
      var timeout = armorTableObj.options.filter.timeout;
      if (e.which === 27){
        $this.val("");
        timeout = 0;
      }
      armorTableObj.timers.filter.start(function(){
        var val = $this.val();
        if (!val || val == "") val = false;
        var filterObj = {};
        filterObj[nameColumnIndex.toString()] = { term : val };
        armorFilter.filterByColumn(filterObj);
      }, timeout);
    }).trigger("keyup");
    
    // Init armor rarity filter
    $("#armor-rarity-filter")
    .selectpicker({
      style : "btn-default",
      width : "100%"
    })
    .on("change", function(){
      var value = $(this).val();
      filterRarity(value);
    }).trigger("change");
    
    function filterRarity(value){
      if (value == "null") value = false;
      var filterObj = {};
      filterObj[rarityColumnIndex.toString()] = {
        term      : value,
        compare   : function(subject, term, $cell){
          return $cell.data("value").toUpperCase() == term.toUpperCase();
        }
      };
      armorFilter.filterByColumn(filterObj);
    }
    
    // Init armor element filter
    $("#armor-element-filter")
    .selectpicker({
      style : "btn-default",
      width : "100%"
    })
    .on("change", function(){
      var value = $(this).val();
      filterElements(value);
    }).trigger("change");
    
//  });
  
  function filterElements(value){
    if (value == null || !value.length) value = false;
    var filterObj = {};
    filterObj[elemsColumnIndex.toString()] = {
      term      : value,
      compare   : function(subject, term, $cell){
        var subj = $cell.data("value").split(",");
        var match = true;
        $.each(term, function(i, val){
          if ($.inArray(val, subj) == -1){
            match = false;
            return false;
          }
        });
//        console.log(subj, term, match);
        return match;
      }
    };
    armorFilter.filterByColumn(filterObj);
  }
  
  // Render actual parameters on user delete confirm
//  $(document).on("click", ".btn-user-delete", function(){
//    var userId = $(this).data("user_id");
//    var userNickname = $(this).data("user_nickname");
//    $("#user-delete-confirm form").attr("action", "/user/destroy/" + userId);
//    $("#user-delete-confirm #user-delete-confirm-nickname").text(userNickname);
//  });
  
})();
