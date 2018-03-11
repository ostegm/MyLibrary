'use strict';

const mongoose = require('mongoose');

mongoose.Promise = global.Promise;


const LibrarySchema = mongoose.Schema({
  userId: {type: String, required: true},
  title: {type: String, required: true},
  author: {type: String, required: true},
  dateFinished: {type: Date, required: true},
  comments: {type: String}
});

LibrarySchema.methods.serialize = function() {
  return {
    userId: this.userId,
    title: this.title,
    author: this.author,
    dateFinished: this.dateFinished,
    comments: this.comments,
    id: this._id,
  };
};

const Library = mongoose.model('Library', LibrarySchema);

module.exports = {Library};
