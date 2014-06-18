
// Init armor rarity filter
var $rarities = $("#crawler-rarities-selector")
  .selectpicker({
    style : "btn-default",
    width : "100%"
  })
  .selectpicker("val", ["legendary", "epic"])
  .selectpicker("refresh");

// Init guild rank selectpicker
var $crawlMode = $("#crawling-mode-selector")
  .selectpicker({
    style : "btn-default",
    width : "100%",
    showSubtext : true
  });

$("#start-crawling").on("click", function(){
  $(this).hide();
  $(".hidden-while-crawling").hide();
  $(".shown-while-crawling").show();
  $("#stop-crawling").attr("disabled", false).show();
  $("#new-results-container").empty();
  $("#updated-results-container").empty();
  $("#new-results-counter").text("0");
  $("#updated-results-counter").text("0");
  updateProgress({vale : 0, status : "", setClass : "progress-bar-success"});
  crawlStart();
});

$("#stop-crawling").attr("disabled", false).on("click", function(){
  $(this).attr("disabled", true);
  socket.request("/armor/crawlStop");
});

$("#restart-crawling").on("click", function(){
  $(this).hide();
  $(".hidden-while-crawling").show();
  $(".shown-while-crawling").hide();
  $("#start-crawling").show();
});

function crawlStart(){
  var params = [];
  var endpoint = "/armor/crawlStart";
  var rarities = $rarities.val();
  if (rarities != null)
    params.push("r=" + rarities.join(","));
  var mode = $crawlMode.val();
  params.push("m=" + mode);
  if (params.length)
    endpoint += "?" + params.join("&");
  socket.request(endpoint);
}

function updateProgress(progress){
  $("#progress-status").html(progress.status);
  var $progress = $("#crawling-progress .progress-bar");
  $progress.attr("aria-valuenow", progress.value);
  $progress.css("width", progress.value + "%");
  if (progress.setClass)
    $progress
      .removeClass("progress-bar-success progress-bar-danger")
      .addClass(progress.setClass);
}

socket.on("updateProgress", updateProgress);

socket.on("newArmor", function(armor){
  console.log("Found armor", armor);
  var $container = $("#new-results-container");
  var $templ = $(".armor-item-templ")
    .clone()
    .removeClass("armor-item-templ")
    .prependTo($container);
  $templ.find(".armor-name").html(
    "<a style='white-space:nowrap;' href='/armor/show/" + armor.id + "'>" + armor.name + "</a>");
  var picPath = armor.mainPic || "/linker/images/question_shield.png";
  $templ.find(".armor-mainpic").css("background-image", "url('" + picPath + "')");
  $("#new-results-counter").text($container.find("li").size());
  $templ.show();
});

socket.on("updateArmor", function(data){
  var armor = data.armor;
  console.log("Updated armor", armor);
  var $container = $("#updated-results-container");
  var $templ = $(".armor-item-templ")
    .clone()
    .removeClass("armor-item-templ")
    .prependTo($container);
  $templ.find(".armor-name").html(
    "<a style='white-space:nowrap;' href='/armor/show/" + armor.id + "'>" + armor.name + "</a>");
  var picPath = armor.mainPic || "/linker/images/question_shield.png";
  $templ.find(".armor-mainpic").css("background-image", "url('" + picPath + "')");
  $("#updated-results-counter").text($container.find("li").size());
  $templ.show();
});

socket.on("crawlEnd", function(overview){
  updateProgress({
    value       : 100,
    status      : "finished. scanned: <strong>" + overview.scanned + "</strong>",
    setClass    : "progress-bar-success"
  });
  end();
});

socket.on("crawlCancel", function(message){
  updateProgress({
    value       : 100,
    status      : message,
    setClass    : "progress-bar-danger"
  });
  end();
});

function end(){
  $("#stop-crawling").hide();
  $("#restart-crawling").show();
}