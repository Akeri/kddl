(function(){
  
  // Init Foo Table
  var $armorTable = $(".footable").footable();
  var armorTableObj = $armorTable.data("footable");
  var armorFilter = $armorTable.data("footable-filter");
  var nameColumnIndex = $armorTable.find("th[data-name='name']").index();
  var rarityColumnIndex = $armorTable.find("th[data-name='rarity']").index();
  var elemsColumnIndex = $armorTable.find("th[data-name='elements']").index();
  
  // Init armor name filter
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
        return match;
      }
    };
    armorFilter.filterByColumn(filterObj);
  }
  
  // Render actual parameters on player armor add dialog
  $(document).on("click", ".trigger-player-armor-add-dialog", function(){
    var userId = $(this).data("user_id");
    var playerId = $(this).data("player_id");
    var playerArmor = $(this).data("player_armor");
    var $dialog = $("#player-armor-add-dialog");
    var armor;
    if (playerArmor){
      armor = playerArmor.armor;
      $dialog.find(".player-armor-add-id").val(playerArmor.id);
      $dialog.find("form#delete-owned-armor").attr("action", "/user/" + userId + "/player/" + playerId + "/armor/destroy/" + playerArmor.id);
      $dialog.find("form#fuse-owned-armor").attr("action", "/user/" + userId + "/player/" + playerId + "/armor/fuse/" + playerArmor.id);
      $dialog.find("form#own-new-armor").attr("action", "/user/" + userId + "/player/" + playerId + "/armor/update/" + playerArmor.id);
      $dialog.find("button.btn-owned-armor").show();
      $dialog.find("button.btn-new-armor").text("Update");
    }else{
      armor = $(this).data("armor");
      $dialog.find(".player-armor-add-id").removeAttr("value");
      $dialog.find("form#own-new-armor").attr("action", "/user/" + userId + "/player/" + playerId + "/armor/create");
      $dialog.find("button.btn-owned-armor").hide();
      $dialog.find("button.btn-new-armor").text("Submit");
    }
    $dialog.find("#player-armor-add-name").text(armor.name);
    $dialog.find("#player-armor-add-armor-id").val(armor.id);
    $dialog.find(".player-armor-add-thumb").attr("src", armor.mainPic || armor.secondaryPic || armor.defaultPic);
    var $level = $dialog.find("#player-armor-add-level").attr("max", armor.maxLevel)
      .val(playerArmor ? playerArmor.level : armor.maxLevel);
    // Init max level button
    $dialog.find("#player-armor-add-max-level").off("click").on("click", function(){
      $level.val(armor.maxLevel).trigger("change");
    });
    var $plus = $("#player-armor-add-plus");
    if (playerArmor) $plus.prop("checked", playerArmor.plus === true);
    var _updateStats = function(){
      var plus = $plus.is(":checked");
      var level = $level.val();
      updateStats($dialog, armor, plus, level);
    };
    // Init armor plus switch
    if ($plus.bootstrapSwitch) $plus.bootstrapSwitch("destroy");
    $plus.bootstrapSwitch({
      state     : false,
      onText    : "Plus",
      offText   : "Reg",
      size      : "normal",
      onSwitchChange : _updateStats
    });
    $level.off("change").on("change", _updateStats).trigger("change");
  });
  
  // Function to calculate and update armors' att/def attending to plus condition and level
  function updateStats($dialog, armor, plus, level){
    var baseAtt, baseDef, stepAtt, stepDef;
    if (plus === true){
      baseAtt = armor.plusBaseAtt;
      baseDef = armor.plusBaseDef;
      stepAtt = armor.plusAttStep;
      stepDef = armor.plusDefStep;
    }else{
      baseAtt = armor.regBaseAtt;
      baseDef = armor.regBaseDef;
      stepAtt = armor.regAttStep;
      stepDef = armor.regDefStep;
    }
    var att = $.isNumeric(baseAtt) ? baseAtt + ((level - 1) * stepAtt) : 0;
    var def = $.isNumeric(baseDef) ? baseDef + ((level - 1) * stepDef) : 0;
    $dialog.find("#player-armor-add-att").text(att);
    $dialog.find("#player-armor-add-def").text(def);
  }
  
})();
