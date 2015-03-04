(function() {
  var Backbone, Bacon, init,
    __slice = [].slice;

  init = function(Bacon, Backbone) {
    var ReactiveView, _undelegate;
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
    _.extend(Bacon.Property.prototype, Backbone.BaconProperty);
    (function(proto) {
      return proto.matches = proto.matchesSelector = proto.matches || proto.matchesSelector || proto.webkitMatchesSelector || proto.mozMatchesSelector || proto.msMatchesSelector || proto.oMatchesSelector || function(selector) {
        var i, nodes;
        nodes = (this.parentNode || this.document).querySelectorAll(selector);
        i = -1;
        while (nodes[++i] && nodes[i] !== this) {}
        return !!nodes[i];
      };
    })(Element.prototype);
    _undelegate = Backbone.View.prototype.undelegateEvents;
    ReactiveView = {
      onEvent: function(eventName, selector, eventTransformer) {
        var stream, _ref;
        if ((_ref = this.bus) == null) {
          this.bus = new Bacon.Bus();
        }
        stream = this.$el.asEventStream(eventName, selector, eventTransformer);
        this.bus.plug(stream);
        return this.bus.filter(function(x) {
          return x instanceof $.Event && x.type === eventName && (!(selector != null) || x.currentTarget.matches(selector));
        });
      },
      undelegateEvents: function() {
        var args, _ref;
        args = 1 <= arguments.length ? __slice.call(arguments, 0) : [];
        _undelegate.apply(this, args);
        if ((_ref = this.bus) != null) {
          _ref.end();
        }
        return this;
      }
    };
    _.extend(Backbone.View.prototype, ReactiveView);
    return Backbone;
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
