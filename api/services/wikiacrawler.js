var http    = require("http");
var cheerio = require("cheerio");
var fs      = require("fs");
var path    = require("path");
var request = require("request");
var _s      = require('underscore.string');


(function(){
  
  /**
   * K&D Wikia domain
   * @var {string}
   */
  var wikia = "http://knights-and-dragons.wikia.com";
  
  /**
   * Parse a Wikia link
   * @param {string} raw
   * @returns {string} parsed
   */
  function parseWikiaLink(raw){
    return raw.replace(wikia, "");
  }
  
  /**
   * Search an image inside a node
   * @param {cheerio} $node
   * @returns {cheerio|undefined}
   */
  function searchImageInside($node){
    if (!$node.length) return;
    var uri = $node.attr("href");
    if (!_s.include(uri, "File:")) return uri;
    var $pic = $node.find("> noscript > img");
    if (!$pic.length) $pic = $node.find("> img");
    if ($pic.length){
      var uri = $pic.attr("src");
      if (_s.startsWith(uri, "data:")) return;
      return uri;
    }
    return;
  }
  
  /**
   * Collection of parsers attending to the armor rarity
   * @var {object}
   */
  var parsers = {
    
    // Common armors' parser
    commonParser : function($table, $){
      var index = [];
      var $tr = $table.first().find("> tr").slice(1);
      $tr.each(function(_, el){
        var $row = $(el);
        var armor = {};
        // retrieve armor link
        var $link = $row.find("> td:nth-child(1) > a:nth-child(2)");
        if (!$link.length) return;
        armor.wikiaLink = $link.attr("href");
        // retrieve armor name
        armor.name = $link.text().trim();
        // retrieve armor main picture
        var $shield = $row.find("> td:nth-child(1) > a:nth-child(1)");
        if ($shield.length) armor.mainPic = $shield.attr("href");
        // retrieve armor secondary picture
        var $full = $row.find("> td:nth-child(7) > a").first();
        if ($full.length) armor.secondaryPic = $full.attr("href");
        index.push(armor);
      });
      return index;
    },
    
    // Uncommon armors' parser
    uncommonParser : function($table, $){
      return parsers.superRareParser($table, $);
    },
    
    // Rare armors' parser
    rareParser : function($table, $){
      var index = [];
      var $tr = $table.first().find("> tr").slice(1);
      var lastName = false;
      $tr.each(function(i, el){
        var $row = $(el);
        var armor = {};
        // retrieve armor link
        var $link = $row.find("> td:nth-child(1) a");
        if (!$link.length) return;
        armor.wikiaLink = $link.attr("href");
        // retrieve armor name
        armor.name = $link.text().trim();
        if ((lastName + " +") == armor.name) return;
        lastName = armor.name;
        // retrieve armor main picture
        var $shield = $row.find("> td:nth-child(6) > a");
        if ($shield.length) armor.mainPic = $shield.attr("href");
        index.push(armor);
      });
      return index;
    },
    
    // Super rare armors' parser
    superRareParser : function($table, $){
      var index = [];
      var $tr = $table.first().find("> tr").slice(1);
      $tr.each(function(i, el){
        if (i % 2 != 0) return true;
        var $row = $(el);
        var armor = {};
        // retrieve armor link
        var $link = $row.find("> td:nth-child(1) a");
        if (!$link.length) return;
        armor.wikiaLink = parseWikiaLink($link.attr("href"));
        // retrieve armor name
        armor.name = $link.text().trim();
        // retrieve armor main picture
        var $helmet = $row.find("> td:nth-child(6) > a");
        armor.mainPic = searchImageInside($helmet);
        // retrieve armor secondary picture
//        var $full = $row.find("> td:nth-child(6) > a").first();
//        if ($full.length) armor.secondaryPic = $full.attr("href");
        index.push(armor);
      });
      return index;
    },
    
    // Ultra rare armors' parser
    ultraRareParser : function($table, $){
      var index = [];
      var find = function($tr){
        $tr.each(function(i, el){
          if (i % 2 != 0) return true;
          var $row = $(el);
          var armor = {};
          // retrieve armor link
          var $link = $row.find("> td:nth-child(1) a");
          if (!$link.length) return;
          armor.wikiaLink = parseWikiaLink($link.attr("href"));
          // retrieve armor name
          armor.name = $link.text().trim();
          // retrieve armor main picture
          var $helmet = $row.find("> td:nth-child(6) > a");
          armor.mainPic = searchImageInside($helmet);
          index.push(armor);
        });
      };
      find($table.first().find("> tr").slice(1)); // Craftables
      find($table.eq(1).find("> tr").slice(1)); // Non-craftables
      return index;
    },
    
    // Legendary armors' parser
    legendaryParser : function(_, $){
      var index = [];
      var processTable = function($tr, iTdPics){
        $tr.each(function(i, el){
          var $row = $(el);
          var armor = {};
          // retrieve armor link
          var $link = $row.find("> td:nth-child(1) a");
          if (!$link.length) return;
          armor.wikiaLink = parseWikiaLink($link.attr("href"));
          // retrieve armor name
          armor.name = $link.text().trim();
          // retrieve armor pictures
          var pic1, pic2;
          var $pic = $row.find("> td:nth-child(" + iTdPics + ") a").first();
          pic1 = searchImageInside($pic);
          var $pic = $pic.next();
          if ($pic.length && $pic.attr("title") != "View photo details")
            pic2 = searchImageInside($pic);
          if (pic1 && pic2){
            armor.mainPic = pic2;
            armor.secondaryPic = pic1;
          }else
            armor.mainPic = pic1;
          index.push(armor);
        });
      };
      var $tr = $("#mw-content-text > table").first().find("> tr").slice(1);
      processTable($tr, 10); // Craftables
      var $subtables = $("#mw-content-text > table").eq(1).find("> tr > td > table");
      index = index.concat(parsers.superRareParser($subtables.eq(0), $)); // Chance chest only
      processTable($subtables.eq(1).find("> tr").slice(1), 8); // Non-craftables
      return index;
    },
    
    // Epic armors' parser
    epicParser : function($table, $){
      var index = [];
      var $tr = $table.first().find("> tr").slice(1);
      $tr.each(function(i, el){
        var $row = $(el);
        var armor = {};
        // retrieve armor link
        var $link = $row.find("> td:nth-child(1) a");
        if (!$link.length) return;
        armor.wikiaLink = parseWikiaLink($link.attr("href"));
        // retrieve armor name
        armor.name = $link.text().trim();
        if (armor.name == "???") return true;
        // retrieve armor main picture
        var $helmet = $row.find("> td:nth-child(8) a").first();
        armor.mainPic = searchImageInside($helmet);
        // retrieve armor secondary picture
        var $full = $row.find("> td:nth-child(7) a").first();
        armor.secondaryPic = searchImageInside($full);
        index.push(armor);
      });
      return index;
    }
    
  };
  

module.exports = {
    
  wikiaUri : wikia,
    
  rarities : {
    common      : {
      link      : "/wiki/Common_Armor",
      parser    : "commonParser"
    },
    uncommon    : {
      link      : "/wiki/Uncommon_Armor",
      parser    : "uncommonParser"
    },
    rare        : {
      link      : "/wiki/Rare_Armor",
      parser    : "rareParser"
    },
    superrare   : {
      link      : "/wiki/Super_Rare_Armor",
      parser    : "superRareParser"
    },
    ultrarare   : {
      link      : "/wiki/Ultra_Rare_Armor",
      parser    : "ultraRareParser"
    },
    legendary   : {
      link      : "/wiki/Legendary_Armor",
      parser    : "legendaryParser"
    },
    epic        : {
      link      : "/wiki/Epic_Armor",
      parser    : "epicParser"
    }
  },
  
  /**
   * Retrieve index of armors by their rarity
   * @param {object} rarity Rarity object
   * @param {function} gotIndex Success callback
   * @param {function} gotError Error callback
   * @returns {[object]} List of found armor entries
   */
  retrieveArmorIndexByRarity : function(rarity, gotIndex, gotError){
    http.get(wikia + rarity.link, function(res){
      var data = "";
      res.on("data", function(chunk){
        data += chunk;
      });
      res.on("end", function(){
        var $ = cheerio.load(data);
        var $table = $("#mw-content-text > table");
        var index = parsers[rarity.parser]($table, $);
        gotIndex(index);
      });
    }).on("error", gotError);
  },
  
  /**
   * Inspect the armor profile on Wikia to retrieve an object
   * @param {object} armor Armor object. Wikia uri in armor's wikiaLink attribute
   * @param {function} gotArmor Success callback
   * @param {function} gotError Error callback
   */
  inspectArmor : function(armor, gotArmor, gotError){
    var self = this;
    http.get(wikia + armor.wikiaLink, function(res){
      var data = "";
      res.on("data", function(chunk){
        data += chunk;
      });
      res.on("end", function(){
        // find table
        var $ = cheerio.load(data);
        var $table = $("#mw-content-text > table").first();
        if ($table.find("> tr").length == 1) $table = $table.next();
        // retrieve name
        var $name =  $table.find("> tr:nth-child(1) > td:first-child");
        if (!$name.length) gotError("Cannot parse armor: missing name");
        else{
          var armorName = $name.text().trim();
          if (armorName.length) armor.name = armorName;
        }
        // retrieve rarity
        var $rarity =  $table.find("> tr:nth-child(3) > td");
        if ($rarity.length) armor.rarity = $rarity.text().trim().replace(" ", "").toLowerCase();
        // retrieve maxLevel
        var $maxLevel =  $table.find("> tr:nth-child(5) > td");
        if ($maxLevel.length) armor.maxLevel = parseInt($maxLevel.text().trim());
        // retrieve elements
        var elems = [];
        $table.find("> tr:nth-child(4) > td > [title='Elements'] > img").each(function(_, el){
          var alt = $(el).attr("alt");
          elems.push(alt.substr(0, alt.indexOf(" ")).toLowerCase());
        });
        if (elems.length) armor.elements = elems;
        // retrieve regular base attack
        var $regBaseAtt =  $table.find("> tr:nth-child(14) > td").first();
        if ($regBaseAtt.length){
          armor.regBaseAtt = parseInt($regBaseAtt.text().replace(",", "").trim()) || undefined;
          // retrieve regular attack step
          var $regAttStep = $regBaseAtt.next();
          armor.regAttStep = parseInt($regAttStep.text().replace(",", "").trim()) || undefined;
          // retrieve regular max attack
          var $regMaxAtt = $regAttStep.next();
          armor.regMaxAtt = parseInt($regMaxAtt.text().replace(",", "").trim()) || undefined;
        }
        // retrieve regular base defense
        var $regBaseDef =  $table.find("> tr:nth-child(15) > td").first();
        if ($regBaseDef.length){
          armor.regBaseDef = parseInt($regBaseDef.text().replace(",", "").trim()) || undefined;
          // retrieve regular defense step
          var $regDefStep = $regBaseDef.next();
          armor.regDefStep = parseInt($regDefStep.text().replace(",", "").trim()) || undefined;
          // retrieve regular max defense
          var $regMaxDef = $regDefStep.next();
          armor.regMaxDef = parseInt($regMaxDef.text().replace(",", "").trim()) || undefined;
        }
        // retrieve plus base attack
        var $plusBaseAtt =  $table.find("> tr:nth-child(16) > td").first();
        if ($plusBaseAtt.length){
          armor.plusBaseAtt = parseInt($plusBaseAtt.text().replace(",", "").trim()) || undefined;
          // retrieve plus attack step
          var $plusAttStep = $plusBaseAtt.next();
          armor.plusAttStep = parseInt($plusAttStep.text().replace(",", "").trim()) || undefined;
          // retrieve plus max attack
          var $plusMaxAtt = $plusAttStep.next();
          armor.plusMaxAtt = parseInt($plusMaxAtt.text().replace(",", "").trim()) || undefined;
        }
        // retrieve plus base defense
        var $plusBaseDef =  $table.find("> tr:nth-child(17) > td").first();
        if ($plusBaseDef.length){
          armor.plusBaseDef = parseInt($plusBaseDef.text().replace(",", "").trim()) || undefined;
          // retrieve plus defense step
          var $plusDefStep = $plusBaseDef.next();
          armor.plusDefStep = parseInt($plusDefStep.text().replace(",", "").trim()) || undefined;
          // retrieve plus max defense
          var $plusMaxDef = $plusDefStep.next();
          armor.plusMaxDef = parseInt($plusMaxDef.text().replace(",", "").trim()) || undefined;
        }
        // retrieve picture
        var $pic = $table.find("> tr:nth-child(2) > td a").first();
        var picUri = searchImageInside($pic);
        if (!armor.mainPic) armor.mainPic = picUri;
        else if (!armor.secondaryPic) armor.secondaryPic = picUri;
//        console.log("==> ", armor.mainPic);
//        console.log("==> ", armor.secondaryPic);
//        console.log("======================");
        gotArmor(armor);
      });
    }).on("error", gotError);
  },
  
  /**
   * Download armor pictures from given uris and set relative paths
   * @param {object} armor Armor object
   * @param {function} cb Callback
   */
  downloadArmorPics : function(armor, cb){
    var self = this;
    var counter = 2;
    var endRequest = function(){
      if (!--counter) cb(armor);
    };
    var requestImage = function(armor, prop){
      var uri = armor[prop];
      if (!uri) return endRequest();
//      var ext = uri.split(".").pop().toLowerCase();
//      var fileName = (armor.name + "_" + prop).replace(/[^a-z0-9]/gi, "_").toLowerCase() + "." + ext;
      var ext = path.extname(uri);
      var fileName = path.basename(uri, ext).replace(/[^a-z0-9]/gi, "_") + ext;
      var targetPath = "files/images/armors/" + fileName;
      armor[prop] = "/linker/images/armors/" + fileName;
      if (uri.indexOf("http://") == -1) uri = self.wikiaUri + uri;
      request(uri).pipe(fs.createWriteStream(targetPath)).on("close", endRequest);
    };
    requestImage(armor, "mainPic");
    requestImage(armor, "secondaryPic");
  },
  
  /**
   * Inspect recursively and asynchronously a list of armors
   * @param {string} mode Crawling mode
   * @param {int} i Index of current armor on the list
   * @param {[object]} armors Complete list of armors
   * @param {function} end Callback to execute when last armor on the list is explored
   * @param {float} step Progress porcentage that takes one armor inspection
   * @param {object} overview Object where to store the crawling details
   * @param {function} crawlingIsCanceled Callback to check whether the crawling process is terminated by client
   * @param {function} crawlCancel Callback to execute when the crawling is process is termianted by client
   * @param {function} updateProgress Callback to execute when a progress is performed on the crawling process
   * @param {function} newArmor Callback to execute when a new armor is found. Receives the new armor object as argument
   * @param {function} updateArmor Callback to execute when an existing armor is updated. Receives the updated armor object as argument
   * @param {function} gotError Callback to execute when the process got an error. Receives the error object as argument
   */
  inspectArmors : function(mode, i, armors, end, step, overview, crawlingIsCanceled, crawlCancel, updateProgress, newArmor, updateArmor, gotError){
    var self = this;
    var armor = armors[i];
    if (!armor) return end();
    overview.scanned++;
    updateProgress("updateProgress", { // emit progress step
      value     : step * (i + 1),
      status    : "scanning <strong>" + armor.name + "</strong>"
    });
    var next = function(){
      if (++i == armors.length) return end(); // last armor?
      if (crawlingIsCanceled()) return crawlCancel();
      self.inspectArmors(mode, i, armors, end, step, overview, crawlingIsCanceled, crawlCancel, updateProgress, newArmor, updateArmor, gotError); // inspect next one
    };
    Armor.findOne() // look for this armor on db
      .where({ wikiaLink : armor.wikiaLink })
      .then(function(dbArmor){
        if (mode == "basic" && dbArmor) return next(); // ignore this, inspect next one;
        self.inspectArmor(armor,
          function gotArmor(armor){
            // got new armor object
            if (!dbArmor){
              self.downloadArmorPics(armor, function(armor){
                Armor.create(armor, function armorStored(err, storedArmor){
                  if (err) return console.log("Error storing " + armor.name + ":", err);
                  newArmor(storedArmor);
                });
              });
            }else{
              self.downloadArmorPics(armor, function(armor){
                Armor.update(dbArmor.id, armor, function armorUpdated(err, updatedArmors){
                  if (err) return console.log("Error updating " + armor.name + ":", err);
                  var diff = Armor.compare(dbArmor, armor);
                  if (!_.isEmpty(diff)) updateArmor({
                    armor   : updatedArmors.shift(),
                    changes : diff
                  });
                });
              });
            }
            next();
          },
          gotError
        );
      })
    ;
  }
  
};

})();