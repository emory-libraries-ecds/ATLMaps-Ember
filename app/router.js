import Ember from 'ember';
import config from './config/environment';

var Router = Ember.Router.extend({
  location: config.locationType
});

export default Router.map(function() {
  this.route('edit-project-modal');
  this.route('project');
  this.route('about');
  this.route('project-layer');
});
