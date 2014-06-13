module.exports = {
    
  roles : {
    
    owner : {
      label       : "Owner",
      description : false,
      groups      : ["owner", "admin", "operator", "staff", "consumer"],
      above       : ["admin", "operator", "support", "consumer", "trial"]
    },
    
    admin : {
      label       : "Administrator",
      description : false,
      groups      : ["admin", "operator", "staff", "member"],
      above       : ["operator", "support", "consumer", "trial"]
    },
    
    operator : {
      label       : "Operator",
      description : false,
      groups      : ["operator", "staff", "consumer"],
      above       : ["support", "consumer", "trial"]
    },
    
    support : {
      label       : "Support",
      description : false,
      groups      : ["support", "staff"],
      above       : ["consumer", "trial"]
    },
    
    consumer : {
      label       : "Member",
      description : false,
      groups      : ["consumer"],
      above       : []
    },
    
    trial : {
      label       : "Trial guy",
      description : false,
      groups      : ["consumer"],
      above       : []
    }
    
  },
  
  /**
   * Get the list of role keys
   * @returns {[string]}
   */
  getRoleKeys : function(){
    return Object.keys(this.roles);
  },
  
  /**
   * Get role by its key
   * @param {string} roleKey Key of role
   * @returns {object}
   */
  getRoleByKey : function(roleKey){
    return this.roles[roleKey];
  },
  
  /**
   * Whether a user is included within a role group
   * @param {User} User User instance
   * @param {string} groupKey Key of role group
   * @returns {bool}
   */
  userInGroup : function(User, groupKey){
    var role = this.roles[User.role];
    return role.groups.indexOf(groupKey) != -1;
  },
  
  /**
   * Whether a user is above another one depending on their role
   * @param {User|string} srcUser
   * @param {User|string} tgtUser
   * @param {function} response Callback which receives bool as response
   */
  userAboveUser : function(srcUser, tgtUser, response){
    var roles = this.roles;
    var getUser = function(userId, next){
      User.findOne(userId, function(err, user){
        next(user);
      });
    };
    var step2 = function(srcUser){
      var step3 = function(tgtUser){
        var srcRole = roles[srcUser.role];
        response(srcRole.above.indexOf(tgtUser.role) != -1);
      };
      if (!_.isObject(tgtUser)) getUser(tgtUser, step3);
      else step3(tgtUser);
    };
    if (!_.isObject(srcUser)) getUser(srcUser, step2);
    else step2(srcUser);
  },
  
  /**
   * Get the list of role objects which are below a given one
   * @param {string} roleKey Above role key
   * @returns [{object}]
   */
  getRolesBelow : function(roleKey){
    var mapRoles = this.roles;
    var roles = mapRoles[roleKey].above;
    var belowRoles = {};
    _.each(roles, function(rk){
      belowRoles[rk] = mapRoles[rk];
    });
    return belowRoles;
  }
  
};