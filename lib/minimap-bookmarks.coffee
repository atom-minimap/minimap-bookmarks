[MinimapBookmarksBinding, CompositeDisposable, requirePackages] = null

module.exports =
  active: false

  isActive: -> @active

  bindings: {}

  activate: (state) ->

  consumeMinimapServiceV1: (@minimap) ->
    @minimap.registerPlugin 'bookmarks', this

  deactivate: ->
    @minimap?.unregisterPlugin 'bookmarks'
    @minimap = null

  activatePlugin: ->
    return if @active

    requirePackages ?= require('atom-utils').requirePackages

    requirePackages('bookmarks').then ([bookmarks]) =>
      CompositeDisposable ?= require('atom').CompositeDisposable

      @subscriptions = new CompositeDisposable
      @active = true

      @minimapsSubscription = @minimap.observeMinimaps (minimap) =>
        MinimapBookmarksBinding ?= require './minimap-bookmarks-binding'

        binding = new MinimapBookmarksBinding(minimap, bookmarks)
        @bindings[minimap.id] = binding

        @subscriptions.add subscription = minimap.onDidDestroy =>
          binding.destroy()
          @subscriptions.remove(subscription)
          subscription.dispose()
          delete @bindings[minimap.id]

  deactivatePlugin: ->
    return unless @active

    binding.destroy() for id,binding of @bindings
    @bindings = {}
    @active = false
    @minimapsSubscription.dispose()
    @subscriptions.dispose()
