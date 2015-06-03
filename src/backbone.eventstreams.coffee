init = (Bacon, Backbone) ->
  Backbone.EventStream =
    listenToEventStream: (eventTarget, eventName, eventTransformer = _.identity) ->
      listener = this
      Bacon.fromBinder (sink) ->
        handler = (args...) ->
          reply = sink(new Bacon.Next(eventTransformer args...))
          if reply == Bacon.noMore
            unbind()

        unbind = -> listener.stopListening(eventTarget, eventName, handler)
        listener.listenTo(eventTarget, eventName, handler)
        unbind

    asEventStream: (eventName, eventTransformer = _.identity) ->
      eventTarget = this
      Bacon.fromBinder (sink) ->
        handler = (args...) ->
          reply = sink(new Bacon.Next(eventTransformer args...))
          if reply == Bacon.noMore
            unbind()

        unbind = -> eventTarget.off(eventName, handler)
        eventTarget.on(eventName, handler, this)
        unbind

  _.extend Backbone,                      Backbone.EventStream
  _.extend Backbone.Model.prototype,      Backbone.EventStream
  _.extend Backbone.Collection.prototype, Backbone.EventStream
  _.extend Backbone.Router.prototype,     Backbone.EventStream
  _.extend Backbone.History.prototype,    Backbone.EventStream
  _.extend Backbone.View.prototype,       Backbone.EventStream

  Backbone.BaconProperty =
    toModel: ->
      model = new Backbone.Model(this.take(1))
      handler = (value) ->
        model.set value
      this.onValue(handler)
      model
        

  _.extend Bacon.Property.prototype,      Backbone.BaconProperty
  
  ((proto) ->
    proto.matches = proto.matchesSelector = proto.matches ||
    proto.matchesSelector ||
    proto.webkitMatchesSelector ||
    proto.mozMatchesSelector ||
    proto.msMatchesSelector ||
    proto.oMatchesSelector ||
    (selector) ->
      nodes = (@parentNode || @document).querySelectorAll(selector)
      i = -1
      while (nodes[++i] && nodes[i] isnt @) then
      !!nodes[i]
  )(Element::)


  _undelegate = Backbone.View::undelegateEvents

  ReactiveView =
    onEvent: (eventName, selector, eventTransformer) ->
      @bus ?= new Bacon.Bus()
      stream = @$el.asEventStream(eventName, selector, eventTransformer)
      @bus.plug stream
      @bus.filter (x) -> 
        x instanceof $.Event &&
        x.type is eventName &&
        (!selector? || x.currentTarget.matches(selector))

    undelegateEvents: (args...) ->
      _undelegate.apply(@, args)
      @bus?.end()
      @  

  _.extend Backbone.View.prototype, ReactiveView
  Backbone

if module?
  Bacon = require("baconjs")
  Backbone = require("backbone")
  module.exports = init(Bacon, Backbone)
else
  if typeof define == "function" and define.amd
    define ["bacon", "backbone"], init
  else
    init(this.Bacon, this.Backbone)