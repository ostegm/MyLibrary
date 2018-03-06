'use strict';
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');
require('mongoose-type-email');

mongoose.Promise = global.Promise;

const UserSchema = mongoose.Schema({
  email: {type: mongoose.SchemaTypes.Email, required: true, unique: true},
  password: {type: String, required: true},
  cellphone: {type: Number, required: true}
});

UserSchema.methods.serialize = function() {
  return {
    email: this.email,
    cellphone: this.cellphone,
    id: this._id
  };
};

UserSchema.methods.validatePassword = function(password) {
  return bcrypt.compare(password, this.password);
};

UserSchema.statics.hashPassword = function(password) {
  return bcrypt.hash(password, 10);
};

const User = mongoose.model('User', UserSchema);

module.exports = {User};