{CompositeDisposable} = require 'event-kit'

MinimapBookmarksBinding = null


module.exports =
  active: false

  isActive: -> @active

  activate: (state) ->
    @subscriptions = new CompositeDisposable

  consumeMinimapServiceV1: (@minimap) ->
    @minimap.registerPlugin 'bookmarks', this

  deactivate: ->
    @minimap.unregisterPlugin 'bookmarks'
    @minimap = null

  activatePlugin: ->
    return if @active

    @active = true

    @minimapsSubscription = @minimap.observeMinimaps (minimap) =>
      MinimapBookmarksBinding ?= require './minimap-bookmarks-binding'
      binding = new MinimapBookmarksBinding(minimap)

      @subscriptions.add subscription = minimap.onDidDestroy =>
        binding.destroy()
        @subscriptions.remove(subscription)
        subscription.dispose()

  deactivatePlugin: ->
    return unless @active

    @active = false
    @minimapsSubscription.dispose()
    @subscriptions.dispose()
