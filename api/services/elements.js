
var Element = require("./classes/element.js").Element; 


var elements = {
  
  /**
   * Fire element
   */
  fire : new Element("fire", '<span title="Fire" class="glyphicon glyphicon-fire text-danger"></span>'),
  
  /**
   * Water element
   */
  water : new Element("water", '<span title="Water" class="glyphicon glyphicon-tint text-primary"></span>'),
  
  /**
   * Air element
   */
  air : new Element("air", '<span title="Air" class="glyphicon glyphicon-flash text-info"></span>'),
  
  /**
   * Earth element
   */
  earth : new Element("earth", '<span title="Earth" class="glyphicon glyphicon-leaf" style="color:#AF7C69;"></span>'),
  
  /**
   * Spirit element
   */
  spirit : new Element("spirit", '<span title="Spirit" class="glyphicon glyphicon-fire" style="color:#8e7bad;"></span>'),
  
  /**
   * Starmetal element
   */
  starmetal : new Element("starmetal", '<span title="Starmetal" class="glyphicon glyphicon-certificate" style="color:#aaaaaa;"></span>')
    
};

elements.fire.strongVs      = elements.spirit;
elements.fire.weakVs        = elements.water;

elements.water.strongVs     = elements.fire;
elements.water.weakVs       = elements.air;

elements.air.strongVs       = elements.water;
elements.air.weakVs         = elements.earth;

elements.earth.strongVs     = elements.air;
elements.earth.weakVs       = elements.spirit;

elements.spirit.strongVs    = elements.earth;
elements.spirit.weakVs      = elements.fire;


module.exports.elements = elements;