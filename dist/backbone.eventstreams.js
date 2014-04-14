(function() {
  var Backbone, Bacon, init,
    __slice = [].slice;

  init = function(Bacon, Backbone) {
    Backbone.EventStream = {
      listenToEventStream: function(eventTarget, eventName, eventTransformer) {
        var listener;
        if (eventTransformer == null) {
          eventTransformer = _.identity;
        }
        listener = this;
        return new Bacon.EventStream(function(sink) {
          var handler, unbind;
          handler = function() {
            var args, reply;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            reply = sink(new Bacon.Next(eventTransformer.apply(null, args)));
            if (reply === Bacon.noMore) {
              return unbind();
            }
          };
          unbind = function() {
            return listener.stopListening(eventTarget, eventName, handler);
          };
          listener.listenTo(eventTarget, eventName, handler);
          return unbind;
        });
      },
      asEventStream: function(eventName, eventTransformer) {
        var eventTarget;
        if (eventTransformer == null) {
          eventTransformer = _.identity;
        }
        eventTarget = this;
        return new Bacon.EventStream(function(sink) {
          var handler, unbind;
          handler = function() {
            var args, reply;
            args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
            reply = sink(new Bacon.Next(eventTransformer.apply(null, args)));
            if (reply === Bacon.noMore) {
              return unbind();
            }
          };
          unbind = function() {
            return eventTarget.off(eventName, handler);
          };
          eventTarget.on(eventName, handler, this);
          return unbind;
        });
      }
    };
    _.extend(Backbone, Backbone.EventStream);
    _.extend(Backbone.Model.prototype, Backbone.EventStream);
    _.extend(Backbone.Collection.prototype, Backbone.EventStream);
    _.extend(Backbone.Router.prototype, Backbone.EventStream);
    _.extend(Backbone.History.prototype, Backbone.EventStream);
    _.extend(Backbone.View.prototype, Backbone.EventStream);
    Backbone.BaconProperty = {
      toModel: function() {
        var handler, model;
        model = new Backbone.Model(this.take(1));
        handler = function(value) {
          return model.set(value);
        };
        this.onValue(handler);
        return model;
      }
    };
    return _.extend(Bacon.Property.prototype, Backbone.BaconProperty);
  };

  if (typeof module !== "undefined" && module !== null) {
    Bacon = require("baconjs");
    Backbone = require("backbone");
    module.exports = init(Bacon, Backbone);
  } else {
    if (typeof define === "function" && define.amd) {
      define(["bacon", "backbone"], init);
    } else {
      init(this.Bacon, this.Backbone);
    }
  }

}).call(this);
