module.exports.Element = function(name, icon){
  
  /**
   * Element name
   * @var {string}
   */
  this.name = name;
  
  /**
   * Element icon
   * @var {string}
   */
  this.icon = icon || '<span class="glyphicon glyphicon-certificate"></span>';
  
  /**
   * Strong versus what element
   * @var {Element}
   */
  this.strongVs = null;
  
  /**
   * Weak versus what element
   * @var {Element}
   */
  this.weakVs = null;
  
};