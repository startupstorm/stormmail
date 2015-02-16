"use strict";

module.exports = function(sequelize, DataTypes) {
  var User = sequelize.define("User", {
    username: { type: DataTypes.STRING, unique: true },

    //Postfix Columns
    email: { type:DataTypes.STRING, unique: true },
    password: DataTypes.STRING,
    maildir: DataTypes.STRING,
    created: { 
    	type: DataTypes.DATE, 
    	allowNull: false,
  		defaultValue: DataTypes.NOW
  	},

    tokens: DataTypes.ARRAY(DataTypes.TEXT),

    firstName: DataTypes.STRING,
    lastName: DataTypes.STRING,

    is_verified: DataTypes.BOOLEAN, 
    is_admin: DataTypes.BOOLEAN,

    reset_email: DataTypes.STRING,
    phone: DataTypes.STRING

  }, {
  	freezeTableName: true,
  	hooks: {
  		beforeCreate: function(user, next) {
  			//Generate email from username
  			user.email = user.username + config.mailDomain;

  			//Generate password hash
			  bcrypt.genSalt(10, function(err, salt) {
			    if (err) return next(err);
			    bcrypt.hash(user.password, salt, null, function(err, hash) {
			      if (err) return next(err);
			      user.password = hash;
			      next();
			    });
			  });
	    },
	    beforeUpdate: function(user, next) {
    	  try {
			    var pass = JSON.parse(user.password);
				  bcrypt.genSalt(10, function(err, salt) {
				    if (err) return next(err);
				    bcrypt.hash(user.password, salt, null, function(err, hash) {
				      if (err) return next(err);
				      user.password = hash;
				      next();
				    });
				  });
			  } catch (e) {
			    process.nextTick(next);
			  }
	    }
  	},
    classMethods: {
      comparePassword: function(candidatePassword, cb) {
			  bcrypt.compare(candidatePassword, this.password, function(err, isMatch) {
			    if (err) return cb(err);
			    cb(null, isMatch);
			  });
			}
    }
  });

  return User;
};
