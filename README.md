mumbl
=====

*Version 0.0.1*

**mumbl** is a JavaScript library that makes it easy to play music and create playlists on web pages.

Demo
----

A demo is included with mumbl but if you dont want to download it, there is also an [online demo][demo].

Please note that mumbl is not the player in the demo. mumbl is the *back-end* and the demo is just an example of using mumbl.

Testers Needed!
---------------

If you would like to help test mumbl on your browser, please [contact me][contact].

Supported Platforms
-------------------

 * All browsers that support HTML5 `<audio>` tags.
 * [Songbird][sb]
 * [SoundManager 2][sm2] (not yet, but planned for version 0.1)

Version 0.0.2 Changes
---------------------

 * Created unit tests.
 * Renamed `mumbl.players.AUDIO_TAG` to `mumbl.players.HTML5_AUDIO`.
 * Removed `onExternal*` event handling code from the HTML5 `<audio>` code as it's
   very unlikely it would ever be fired. The `onExternal*` events still work in Songbird.
 * Now using spaces instead of tabs.

### Bugfixes
 * `mumbl.addTracks` fixed.
 * [Songbird] `mumbl.addTrack` now searches through the `TrackItem` for any non-OGG files so you
   may now put OGG files at the top of your `TrackItem`s (as long as there are other formats specified).

API
---

### Methods:

 * `mumbl.addTrack(TrackItem):void`
   * Adds `TrackItem` to the playlist.
 * `mumbl.addTracks(TrackItemList):void`
   * Adds every `TrackItem` in `TrackItemList` to the playlist.
 * `mumbl.clear():void`
   * Clears the playlist.
 * `mumbl.duration():float`
   * Returns the duration in seconds of the currently selected track.
 * `mumbl.loop(loopType:int /*0 to 2*/)`
   * If `loopType` is not a number, the currently stored `loopType` is returned.
   * If `loopType` is `0`, looping is turned off.
   * If `loopType` is `1`, the current track is looped.
   * If `loopType` is `2`, the playlist is looped. This is the default `loopType`.
 * `mumbl.length():int`
   * Returns the amount of tracks in the playlist.
 * `mumbl.mute(muteState:boolean):boolean, void`
   * If `muteState` is not boolean, this returns `true` if the player is muted or `false` if the player is not muted.
   * If `muteState` is `true`, the player is muted if not already muted.
   * If `muteState` is `false`, the player is unmuted if not already unmuted.
 * `mumbl.next():void`
   * Selects the next track in the playlist from the currently selected track.
 * `mumbl.play():void`
   * Plays the current track at its current position.
 * `mumbl.pause():void`
   * Pauses playback of the current track.
 * `mumbl.paused():boolean`
   * Returns `true` if player is currently paused. Otherwise, returns `false`.
 * `mumbl.playing():boolean`
   * Returns `true` if player is currently playing. Otherwise, returns `false`.
 * `mumbl.previous():void`
   * Selects the previous track in the playlist from the currently selected track.
 * `mumbl.position(newPosition:float /*seconds*/):void, float`
   * If `newPosition` is not a number, the current position of the current track is returned.
   * If `newPosition` is defined, the current track will seek to `newPosition`.
 * `mumbl.shuffle(shuffleState:boolean):boolean, void)` (**Unimplemented** as of 0.0.2, with a read-only implementation for Songbird)
   * If `shuffleState` is not boolean, the shuffle state of the playlist is returned.
   * If `shuffleState` is `true`, the random items from the playlist are played until every item has been played.
   * If `shuffleState` is `false`, the playlist is played in the order it was created.
 * `mumbl.stop():void`
   * Stops playback if playing and resets the position of the currently selected track.
 * `mumbl.stopped():boolean`
   * Returns `true` if player is currently stopped. Otherwise, returns `false`. `mumbl.stopped()` is `false` after you select a track because the track is loaded. It will only be `true` again after you call `mumbl.stop()` or `mumbl.clear()`.
 * `mumbl.track(trackNumber:int):void`
   * Selects `trackNumber` from the playlist as the current track.
 * `mumbl.tracks():TrackItemList`
   * Returns the `TrackItemList` representing the playlist.
 * `mumbl.togglePause():void`
   * Toggles the playing state of the player from paused to playing or playing to paused.
 * `mumbl.volume(newVolume:float /*0 to 1*/):void, float`
   * If `newVolume` is not a number, the player volume (0 to 1) is returned.
   * If `newVolume` is defined, the player volume is set to `newVolume`.

###Fields:

 * `mumbl.players` - An object populated with constants representing various players:
   * `UNSUPPORTED` - 0
   * `HTML5_AUDIO` - 1
   * `SONGBIRD` - 2
   * `SOUNDMANAGER2` - 3
 * `mumbl.player` - The player from `mumbl.players` used to play audio.
 * `mumbl._interface` - The interface to the player being used.

###Event Handlers:

Define any of the following methods and they will be called during the appropriate events. External events occur when a user directly interacts with a player's native interface (like Songbird) or if the native interface is progmatically interacted with outside of the mumbl library.

 * `mumbl.onTrackChange`
   * This is called when a track is selected. The track number is available at this time.
 * `mumbl.onTrackReady`
   * This is called after when the metadata for the selected track (including the duration) is accessible.
 * `mumbl.onCanPlayTrack`
   * This is called when enough data from the currently selected track is loaded that it can play.
 * `mumbl.onCanPlayThroughTrack`
   * This is called when the rate at which the data from the selected track is loading fast enough to play through the whole track.
 * `mumbl.onTrackLoad`
   * This is called when all of the data for the selected track has been loaded.
 * `mumbl.onExternalPlayStateChange`
   * This is called when the playing state of the player is changed externally.
 * `mumbl.onExternalVolumeChange`
   * This is called when the volume of the player is changed externally.
 * `mumbl.onExternalMuteChange`
   * This is called when the player is muted or unmuted externally.
 * `mumbl.onExternalLoopingChange`
   * This is called when the player's looping state is externally changed.
 * `mumbl.onExternalShufflingChange`
   * This is called when the player's shuffling state is externally changed.


**\***Note: A TrackItemList is an array of TrackItems. A TrackItem is a list that follows the following format. When a TrackItem or a TrackItemList is specified as the only argument for a function, pass every array indice as a separate argument. e.g., `someFunction(TrackItem)` would be called as `someFunction(URI-1, media-type-1, ... URI-N, media-type-N)` and `someFunction(TrackItemList)` would be called as `someFunction(TrackItem-1, ... TrackItem-N)`.


The choices are in order of preference. If you do not know the media type of an audio file, just pass `null` in place of the media type.

    [
      choice-1-URI, choice-1-media-type,
      choice-2-URI, choice-2-media-type,
      ...
      choice-N-URI, choice-N-media-type
    ]


Roadmap
-------

 * Version 0.1
   * Add playlist shuffle functionality.
   * Add support for SoundManager2.
   * Do cross-browser testing.
     * Get testers for browsers I can't test.
 * Eventually, after version 0.1 is released.
   * Create a simple library for turning all MP3, OGG, WAV, etc. links into mumbl-powered audio players.
   * Make the demo mumbl-powered music player (it will be renamed "mumblr") portable and reusable.
     * Remove jQuery dependancy from mumblr.
     * Make the track title display scroll (maybe using a `<marquee>`) when it overflows.

  [contact]: http://github.com/eligrey
  [demo]: http://purl.eligrey.com/mumbl/demo
  [sb]: http://getsongbird.com/
  [sm2]: http://www.schillmania.com/projects/soundmanager2/
  [bug15169]: http://bugzilla.songbirdnest.com/show_bug.cgi?id=15169
