(function(){
  
  // Init Foo Table
  $(".footable").footable();
  
  // Trigger resize when player is selected
  $("a[data-toggle='tab'].player-tab").on("show.bs.tab", function(e){
    setTimeout(function(){
      var $table = $(".footable:visible");
      $table.trigger("footable_resize");
    }, 500);
  });
  
  function getTable($control){
    var $table = $($control.closest(".armor-filter-case").data("table_target"));
    return $table;
  }
  
  function getColumnIndex($table, columnName){
    var index = $table.find("th[data-name='" + columnName + "']").index();
    return index;
  }

  // init armor name filter
  $(".armor-name-filter").on("keyup", function(e){
    var $this = $(this);
    var $table = getTable($this);
    var armorTableObj = $table.data("footable");
    var armorFilter = $table.data("footable-filter");
    armorTableObj.timers.filter.stop();
    var timeout = armorTableObj.options.filter.timeout;
    if (e.which === 27){
      $this.val("");
      timeout = 0;
    }
    var nameColumnIndex = getColumnIndex($table, "name");
    armorTableObj.timers.filter.start(function(){
      var val = $this.val();
      if (!val || val == "") val = false;
      var filterObj = {};
      filterObj[nameColumnIndex.toString()] = { term : val };
      armorFilter.filterByColumn(filterObj);
    }, timeout);
  }).trigger("keyup");
  
  // Init armor rarity filter
  $(".armor-rarity-filter")
  .selectpicker({
    style : "btn-default",
    width : "100%"
  })
  .on("change", function(){
    var $this = $(this);
    var value = $this.val();
    var $table = getTable($this);
    filterRarity($table, value);
  }).trigger("change");
  
  function filterRarity($table, value){
    if (value == "null") value = false;
    var armorFilter = $table.data("footable-filter");
    var filterObj = {};
    var rarityColumnIndex = getColumnIndex($table, "rarity");
    filterObj[rarityColumnIndex.toString()] = {
      term      : value,
      compare   : function(subject, term, $cell){
        return $cell.data("value").toUpperCase() == term.toUpperCase();
      }
    };
    armorFilter.filterByColumn(filterObj);
  }
  
  $(".armor-element-filter")
  .selectpicker({
    style : "btn-default",
    width : "100%"
  })
  .on("change", function(){
    var $this = $(this);
    var value = $this.val();
    var $table = getTable($this);
    filterElements($table, value);
  }).trigger("change");
  

  function filterElements($table, value){
    if (value == null || !value.length) value = false;
    var armorFilter = $table.data("footable-filter");
    var elemsColumnIndex = getColumnIndex($table, "elements");
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
        return match;
      }
    };
    armorFilter.filterByColumn(filterObj);
  }

})();