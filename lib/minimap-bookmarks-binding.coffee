{CompositeDisposable} = require 'event-kit'

module.exports =
class MinimapBookmarksBinding
  constructor: (@minimap) ->
    @subscriptions = new CompositeDisposable
    @editor = @minimap.getTextEditor()

    @subscriptions.add @editor.displayBuffer.onDidCreateMarker (marker) =>
      if marker.matchesProperties(class: 'bookmark')
        @minimap.decorateMarker(marker, type: 'line', class: 'bookmark')

  destroy: ->
    @subscriptions.dispose()
