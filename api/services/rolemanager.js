module.exports = {
    
  roles : {
    
    owner : {
      label       : "Owner",
      description : false
    },
    
    admin : {
      label       : "Administrator",
      description : false
    },
    
    operator : {
      label       : "Operator",
      description : false
    },
    
    support : {
      label       : "Support",
      description : false
    },
    
    consumer : {
      label       : "Member",
      description : false
    },
    
    trial : {
      label       : "Trial guy",
      description : false
    }
    
  },
    
  groups : {
    
    owner : {
      roles : ["owner"]
    },
  
    admin: {
      roles : ["owner", "admin"]
    },
    
    operator : {
      roles : ["owner", "admin", "operator"]
    },
    
    support : {
      roles : ["owner", "admin", "operator", "support"]
    },
    
    staff : {
      roles : ["owner", "admin", "operator", "support"]
    },
    
    consumer : {
      roles : ["owner", "admin", "operator", "support", "consumer"]
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
    var group = this.groups[groupKey];
    return group.roles.indexOf(User.role) != -1;
  }
  
};