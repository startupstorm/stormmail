module.exports = function(sequelize, DataTypes) {
  var Mail = sequelize.define("User", {
    id: { type: DataTypes.STRING, unique: true },
    username: { type: DataTypes.STRING, unique: true },
    page: DataTypes.INTEGER,

    //Serialized JSON data from email object
    data: DataTypes.TEXT,
    _data: DataTypes.TEXT,

  }, {
    getterMethods: {
        data: function(){
            return JSON.parse(this._data);
        }
    },
    setterMethods: {
        data: function(v){
            this._data = JSON.stringify(v);
        }
    }
  });
  return Mail;
}