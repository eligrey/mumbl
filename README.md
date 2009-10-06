mumbl
=====

*Version 0.1a2*

**mumbl** is a JavaScript library that makes it easy to play music and create playlists
on web pages.


Demo
----

A demo is included with mumbl but if you dont want to download it, there is also an
[online demo][demo].

Please note that mumbl is not the player in the demo. mumbl is the *back-end* and the
demo is just an example of using mumbl.


Testers Needed!
---------------

If you would like to help test mumbl on your browser, please [contact me][contact].


Supported Platforms
-------------------

 * HTML5 &lt;audio/&gt;
 * [Songbird][sb]
 * [SoundManager 2][sm2] version 2.95a.20090717 and higher


Tested Browsers
---------------

---

### Legend

 * **\[SM2\]**: SoundManager2
 * **\[HTML5\]**: HTML5 &lt;audio/&gt;
 * **\[SB\]**: Songbird 

---

 * Linux
     * **\[SM2\]** Firefox 3
     * **\[HTML5\]** Firefox 3.5
     * **\[SM2\]** Opera 10
     * **\[SM2\]** Google Chrome
     * **\[HTML5\]** Chromium
     * **\[SB\]** Songbird 1.2-1.4


API
---

### Methods

<dl>
  <dt><code>mumbl.addTrack(TrackItem):void</code></dt>
  <dd>Adds <code>TrackItem</code> to the playlist.</dd>

  <dt><code>mumbl.addTracks(TrackItemList):void</code></dt>
  <dd>
    Adds every <code>TrackItem</code> in <code>TrackItemList</code> to the playlist.
  </dd>

  <dt><code>mumbl.clear():void</code></dt>
  <dd>Clears the playlist.</dd>

  <dt><code>mumbl.destruct():void</code></dt>
  <dd>Uninitializes mumbl. <code>window.mumbl</code> will be deleted.</dd>

  <dt><code>mumbl.duration():float</code></dt>
  <dd>Returns the duration in seconds of the currently selected track.</dd>

  <dt><code>mumbl.length():int</code></dt>
  <dd>Returns the amount of tracks in the playlist.</dd>

  <dt><code>mumbl.mute(muteState:boolean):boolean, void</code></dt>
  <dd>
    If <code>muteState</code> is not boolean, this returns <code>true</code> if the
    player is muted or <code>false</code> if the player is not muted.
    <br />
    If <code>muteState</code> is <code>true</code>, the player is muted if not
    already muted.
    <br />
    If <code>muteState</code> is <code>false</code>, the player is unmuted if not
    already unmuted.
  </dd>

  <dt><code>mumbl.listen(event:string, handler:function):void</code></dt>
  <dd>This calls <code>handler</code> whenever the specified event is dispatched.</dd>

  <dt><code>mumbl.loop(loopType:int /*0 to 2*/)</code></dt>
  <dd>
    If <code>loopType</code> is not a number, the currently stored
    <code>loopType</code> is returned.
    <br />
    If <code>loopType</code> is <code>0</code>, looping is turned off.
    <br />
    If <code>loopType</code> is <code>1</code>, the current track is looped.
    <br />
    If <code>loopType</code> is <code>2</code>, the playlist is looped. This is the
    default <code>loopType</code>.
  </dd>

  <dt><code>mumbl.next():void</code></dt>
  <dd>Selects the next track in the playlist from the currently selected track.</dd>

  <dt><code>mumbl.onready(callback:function [, scope]):void</code></dt>
  <dd>
    Immediately calls <code>callback()</code> in the specified scope unless the player
    being used is SoundManager2; in which case the callback and scope are forwarded to
    <code>soundManager.onready()</code>.
  </dd>

  <dt><code>mumbl.play():void</code></dt>
  <dd>Plays the current track at its current position.</dd>

  <dt><code>mumbl.pause():void</code></dt>
  <dd>Pauses playback of the current track.</dd>

  <dt><code>mumbl.paused():boolean</code></dt>
  <dd>
    Returns <code>true</code> if player is currently paused. Otherwise, returns
    <code>false</code>.
  </dd>

  <dt><code>mumbl.playing():boolean</code></dt>
  <dd>
    Returns <code>true</code> if player is currently playing. Otherwise, returns
    <code>false</code>.
  </dd>

  <dt><code>mumbl.players.addPlayer(playerName:string):void</code></dt>
  <dd>
    Returns the player ID of <code>mumbl.players[playerName.toUpperCase]</code>.
    If no such player already exists, it is added to <code>mumbl.players</code>.
  </dd>

  <dt><code>mumbl.position(newPosition:float /*seconds*/):void, float</code></dt>
  <dd>
    If <code>newPosition</code> is not a number, the current position of the current
    track is returned.
    <br />
    If <code>newPosition</code> is defined, the current track will seek to
    <code>newPosition</code>.
  </dd>

  <dt><code>mumbl.previous():void</code></dt>
  <dd>Selects the previous track in the playlist from the currently selected track.</dd>

  <dt><code>mumbl.shuffle(shuffleState:boolean):boolean, void)</code></dt>
  <dd>
    If <code>shuffleState</code> is not boolean, the shuffle state of the playlist
    is returned.
  </dd>
  <dd>
    If <code>shuffleState</code> is <code>true</code>, random items from the
    playlist are played until every item has been played. Any changes to the playlist
    will not persist once reverted back to the original playlist. By using
    <code>mumbl.shuffle(false)</code>.
    <br />
    If <code>shuffleState</code> is <code>false</code>, the playlist is played in
    the order it was created.
  </dd>

  <dt><code>mumbl.stop():void</code></dt>
  <dd>
    Stops playback if playing and resets the position of the currently selected
    track.
  </dd>

  <dt><code>mumbl.stopped():boolean</code></dt>
  <dd>
    Returns <code>true</code> if player is currently stopped. Otherwise, returns
    <code>false</code>. <code>mumbl.stopped()</code> is <code>false</code> after
    you select a track because the track is loaded. It will only be <code>true</code>
    again after you call <code>mumbl.stop()</code> or <code>mumbl.clear()</code>.
  </dd>

  <dt><code>mumbl.track(trackNumber:int):void</code></dt>
  <dd>
    Selects <code>trackNumber</code> from the playlist as the current track.
    mumbl uses a zero-index array for a playlist.
  </dd>

  <dt><code>mumbl.tracks():TrackItemList</code></dt>
  <dd>Returns the <code>TrackItemList</code> representing the playlist.</dd>

  <dt><code>mumbl.togglePause():void</code></dt>
  <dd>
    Toggles the playing state of the player from paused to playing or playing to
    paused.
  </dd>

  <dt><code>mumbl.unlisten(event:string, handler:function):void</code></dt>
  <dd>
    This removes a previous event listener which calls <code>handler</code> when
    the specified event is dispatched.
  </dd>

  <dt><code>mumbl.volume(newVolume:float /*0 to 1*/):void, float</code></dt>
  <dd>
    If <code>newVolume</code> is not a number, the player volume (0 to 1) is
    returned.
    <br />
    If <code>newVolume</code> is defined, the player volume is set to
    <code>newVolume</code>.
  </dd>
</dl>

### Fields

<dl>
  <dt><code>mumbl.version</code></dt>
  <dd>
    A string representing the version of the mumbl script. The version string is in the
    format of <code><em>major</em>.<em>minor</em>.<em>revision</em></code>.
  </dd>

  <dt><code>mumbl.players</code></dt>
  <dd>An object populated with constants representing various players:
    <ul>
      <li><code>UNSUPPORTED</code></li>
      <li><code>HTML5_AUDIO</code></li>
      <li><code>SONGBIRD</code></li>
      <li><code>SOUNDMANAGER2</code></li>
    </ul>
  </dd>

  <dt><code>mumbl.player</code></dt>
  <dd>The player from <code>mumbl.players</code> used to play audio.</dd>

  <dt><code>mumbl.INTEGRATED</code></dt>
  <dd>
    A boolean value that represents if there is a native interface being used for the
    player.
  </dd>

  <dt><code>mumbl._interface</code></dt>
  <dd>The interface to the player being used.</dd>
</dl>

### Events

Events can be subscribed to and unsubscribed from with `mumbl.listen()` and
`mumbl.unlisten()`.External events are events resulting from direct interaction
with a native interface for a player (like Songbird).

<dl>
  <dt><code>trackchange</code></dt>
  <dd>
    This is dispatched when a track is selected. The track number is available at
    this time.
  </dd>
  
  <dt><code>trackready</code></dt>
  <dd>
    This is dispatched after when the metadata for the selected track (including
    the duration) is accessible.
  </dd>
  
  <dt><code>canplaytrack</code></dt>
  <dd>
    This is dispatched when enough data from the currently selected track is loaded
    that it can play.
  </dd>
  
  <dt><code>canplaythroughtrack</code></dt>
  <dd>
    This is dispatched when the rate at which the data from the selected track is
    loading fast enough to play through the whole track.
  </dd>
  
  <dt><code>trackload</code></dt>
  <dd>
    This is dispatched when all of the data for the selected track has been loaded.
  </dd>
  
  <dt><code>externalplaystatechange</code></dt>
  <dd>This is dispatched when the playing state of the player is changed externally.</dd>
  
  <dt><code>externalvolumechange</code></dt>
  <dd>This is dispatched when the volume of the player is changed externally.</dd>
  
  <dt><code>externalmutechange</code></dt>
  <dd>This is dispatched when the player is muted or unmuted externally.</dd>
  
  <dt><code>externalloopingchange</code></dt>
  <dd>This is dispatched when the player's looping state is externally changed.</dd>
  
  <dt><code>externalshufflingchange</code></dt>
  <dd>This is dispatched when the player's shuffling state is externally changed.</dd>
</dl>

Note: The `ready` event cannot be subscribed to with `mumbl.listen()`. The
`mumbl.onready()` event listener method should be used instead to subscribe to the
`ready` event.

-----

\* A TrackItemList is an array of TrackItems. A TrackItem is a list that follows the
following format. When a TrackItem or a TrackItemList is specified as the only
argument for a function, pass every array indice as a separate argument. e.g.,
`someFunction(TrackItem)` would be called as
`someFunction(URI-1, media-type-1, ... URI-N, media-type-N)`
and `someFunction(TrackItemList)` would be called as
`someFunction(TrackItem-1, ... TrackItem-N)`.


The choices are in order of preference. If you do not know the media type of an audio
file, just pass `null` in place of the media type.

    [
      choice-1-URI, choice-1-media-type,
      choice-2-URI, choice-2-media-type,
      ...
      choice-N-URI, choice-N-media-type
    ]


Roadmap
-------

 * A while after version 0.1 is released
   * Create a simple library that makes all MP3, OGG, WAV, etc. links be able to
     be played using mumbl.
   * Make the demo mumbl-powered music player (it will be renamed "mumblr")
     portable and reusable.
     * Remove jQuery dependancy from mumblr.
     * Add a shuffle button to mumblr.
     * Make the track title display scroll (maybe using a `<marquee>`) when it overflows.
 * Version 0.2
   * Full compatability with every major browser.
 * The distant future
   * Create a simplified flash audio backend for mumbl that integrates much more
     nicely and has a smaller file size than SoundManager2.


  [contact]: http://github.com/eligrey
  [demo]: http://purl.eligrey.com/mumbl/demo
  [sb]: http://getsongbird.com/
  [sm2]: http://www.schillmania.com/projects/soundmanager2/
  [bug15169]: http://bugzilla.songbirdnest.com/show_bug.cgi?id=15169
