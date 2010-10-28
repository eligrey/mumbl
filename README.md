mumbl
=====

*Version 0.1.1b1*

**mumbl** is a JavaScript library that makes it easy to play music and create playlists
on web pages.


Demo
----

A demo is included with mumbl but if you dont want to download it, there is also an
[online demo][demo].

Please note that mumbl is not the player in the demo. mumbl is the *back-end* and the
demo is just an example of using mumbl.


Supported Platforms
-------------------

* HTML5 &lt;audio/&gt;
* [Songbird][sb]
* [SoundManager 2][sm2] version 2.95b.20100323 or higher


Supported Browsers
------------------

* HTML5
    * Firefox 3.5+
    * Google Chrome 4+
* SoundManager 2 (version 2.95b.20100323+)
    * Firefox 1.5+
    * Opera 10+
    * Google Chrome 1+
* Songbird 1.4+


API
---

Strong and emphasized text has titles (which can be viewed by hovering your cursor over
them) containing their type if they are not functions or return type if they are.


### Methods

<dl>
  <dt><code>mumbl.<strong title="void">addTrack</strong>(<strong title="Array.&lt;?String&gt;">TrackItem</strong>)</code></dt>
  <dd>Adds <code>TrackItem</code>* to the playlist.</dd>

  <dt><code>mumbl.<strong title="void">addTracks</strong>(<strong title="Array.&lt;TrackItem&gt;">TrackItemList</strong>)</code></dt>
  <dd>
    Adds every <code>TrackItem</code> in <code>TrackItemList</code> to the playlist.
  </dd>

  <dt><code>mumbl.<strong title="void">clear</strong>()</code></dt>
  <dd>
    Clears the playlist.
  </dd>

  <dt><code>mumbl.<strong title="Function">createEventDispatcher</strong>(<strong title="String">event</strong>)</code></dt>
  <dd>
    Creates an event dispatcher for the specified event. Custom events cannot be observed
    until at least one event dispatcher for the event has been created.
  </dd>

  <dt><code>mumbl.<strong title="void">destruct</strong>()</code></dt>
  <dd>
    Uninitializes mumbl. <code>window.mumbl</code> will be deleted.
  </dd>

  <dt><code>mumbl.<strong title="Number (non-negative)">duration</strong>()</code></dt>
  <dd>
    Returns the duration in seconds of the currently selected track.
  </dd>

  <dt><code>mumbl.<strong title="Number (non-negative integer)">length</strong>()</code></dt>
  <dd>
    Returns the amount of tracks in the playlist.
  </dd>

  <dt><code>mumbl.<strong title="Boolean">mute</strong>()</code></dt>
  <dd>
    Returns <code>true</code> if the player is muted or <code>false</code> if the
    player is not muted.
  </dd>

  <dt><code>mumbl.<strong title="void">mute</strong>(<strong title="Boolean">muteState</strong>)</code></dt>
  <dd>
    If <code>muteState</code> is <code>true</code>, the player is muted if not
    already muted.
    <br />
    If <code>muteState</code> is <code>false</code>, the player is unmuted if not
    already unmuted.
  </dd>

  <dt><code>mumbl.<strong title="void">observe</strong>(<strong title="String">event</strong>, <strong title="Function">observer</strong>)</code></dt>
  <dd>
    This calls <code>observer</code>, passing it the event type as the first argument,
    whenever the specified event is dispatched.
   </dd>

  <dt><code>mumbl.<strong title="Number (integer from 0 to 2)">loop</strong>()</code></dt>
  <dd>
    Returns the current <code>loopType</code>.
  </dd>

  <dt><code>mumbl.<strong title="void">loop</strong>(<strong title="Number (integer from 0 to 2)">loopType</strong>)</code></dt>
  <dd>
    If <code>loopType</code> is <code>0</code>, looping is turned off.
    <br />
    If <code>loopType</code> is <code>1</code>, the currently selected track is looped.
    <br />
    If <code>loopType</code> is <code>2</code>, the playlist is looped. This is the
    default <code>loopType</code>.
  </dd>

  <dt><code>mumbl.<strong title="void">next</strong>()</code></dt>
  <dd>Selects the next track in the playlist from the currently selected track.</dd>

  <dt><code>mumbl.<strong title="void">onready</strong>(<strong title="Function">callback</strong> [, <strong title="?Object">scope</strong>])</code></dt>
  <dd>
    After mumbl is ready to be used, the callback is called using the scope specified or
    the <code>mumbl</code> object if no scope is specified.
  </dd>

  <dt><code>mumbl.<strong title="void">play</strong>()</code></dt>
  <dd>
    Plays the currently selected track at its current position.
  </dd>

  <dt><code>mumbl.<strong title="void">pause</strong>()</code></dt>
  <dd>
    Pauses playback of the currently selected track.
  </dd>

  <dt><code>mumbl.<strong title="Boolean">paused</strong>()</code></dt>
  <dd>
    Returns <code>true</code> if player is currently paused. Otherwise, returns
    <code>false</code>.
  </dd>

  <dt><code>mumbl.<strong title="Boolean">playing</strong>()</code></dt>
  <dd>
    Returns <code>true</code> if player is currently playing. Otherwise, returns
    <code>false</code>.
  </dd>
  
  <dt><code>mumbl.<strong title="Boolean">playerIs</strong>(<strong title="String">playerName</strong>)</code></dt>
  <dd>
    Returns <code>true</code> if the player being used is the player of
    <code>playerName</code>. Otherwise, returns <code>false</code>.
  </dd>

  <dt><code>mumbl.players.<strong title="Number (non-negative integer)">addPlayer</strong>(<strong title="String">playerName</strong>)</code></dt>
  <dd>
    Returns the player ID of the player of `playerName` (case-insensitive)</code>.
    If no such player already exists, it is added to <code>mumbl.players</code> and the
    player ID of the newly added player is returned.
  </dd>

  <dt><code>mumbl.<strong title="Number (non-negative)">position</strong>()</code></dt>
  <dd>
    Returns the current seek position, in seconds, of the currently selected track.
  </dd>

  <dt><code>mumbl.<strong title="void">position</strong>(<strong title="Number (non-negative)">newPosition</strong>)</code></dt>
  <dd>
    The currently selected track will seek to <code>newPosition</code>, in seconds.
  </dd>

  <dt><code>mumbl.<strong title="void">previous</strong>()</code></dt>
  <dd>Selects the previous track in the playlist from the currently selected track.</dd>

  <dt><code>mumbl.<strong title="Boolean">shuffle</strong>()</code></dt>
  <dd>
    Returns the shuffle state of the playlist.
  </dd>

  <dt><code>mumbl.<strong title="void">shuffle</strong>(<strong title="Boolean">shuffleState</strong>)</code></dt>
  <dd>
    If <code>shuffleState</code> is <code>true</code>, the playlist is played in a random
    order.
    <br />
    If <code>shuffleState</code> is <code>false</code>, the playlist is played in the
    order that it was created.
  </dd>

  <dt><code>mumbl.<strong title="void">stop</strong>()</code></dt>
  <dd>
    Stops playback if playing and resets the position of the currently selected
    track.
  </dd>

  <dt><code>mumbl.<strong title="Boolean">stopped</strong>()</code></dt>
  <dd>
    Returns <code>true</code> if player is currently stopped. Otherwise, returns
    <code>false</code>.
  </dd>

  <dt><code>mumbl.<strong title="Number (non-negative integer)">track</strong>()</code></dt>
  <dd>
    Returns the index (zero-based) of the currently selected track in the playlist.
  </dd>

  <dt><code>mumbl.<strong title="void">track</strong>(<strong title="Number (non-negative integer)">trackNumber</strong>)</code></dt>
  <dd>
    The track in the playlist with the index (zero-based) of <code>trackNumber</code>
    is selected.
  </dd>

  <dt><code>mumbl.<strong title="TrackItemList">tracks</strong>()</code></dt>
  <dd>Returns the <code>TrackItemList</code> representing the playlist.</dd>

  <dt><code>mumbl.<strong title="void">togglePause</strong>()</code></dt>
  <dd>
    Toggles the playing state of the player from paused to playing or playing to
    paused.
  </dd>

  <dt><code>mumbl.<strong title="void">unobserve</strong>(<strong title="String">event</strong>, <strong title="Function">observer</strong>)</code></dt>
  <dd>
    This removes a previously assigned event observer.
  </dd>

  <dt><code>mumbl.<strong title="Number (0 to 1)">volume</strong>()</code></dt>
  <dd>
    Returns the player volume from zero to one.
  </dd>

  <dt><code>mumbl.<strong title="void">volume</strong>(<strong title="Number (0 to 1)">newVolume</strong>)</code></dt>
  <dd>
    The player volume (zero to one) is set to <code>newVolume</code>.
  </dd>
</dl>

### Fields

<dl>
  <dt><code>mumbl.<strong title="Array">version</strong></code></dt>
  <dd>
    An array with five items representing the version of the mumbl library being used.
    The string representation of this array matches the regular expression,
    <code>[0-9]+.[0-9]+.[0-9]+[ab]?[0-9]+?</code>.
  </dd>

  <dt><code>mumbl.<strong title="Object">players</strong></code></dt>
  <dd>An object populated with constants representing various players:
    <ul>
      <li><code>UNSUPPORTED</code></li>
      <li><code>HTML5</code></li>
      <li><code>SONGBIRD</code></li>
      <li><code>SOUNDMANAGER2</code></li>
    </ul>
  </dd>

  <dt><code>mumbl.<strong title="Number (non-negative integer)">player</strong></code></dt>
  <dd>The player from <code>mumbl.players</code> used to play audio.</dd>

  <dt><code>mumbl.<strong title="Boolean">integrated</strong></code></dt>
  <dd>
    A boolean value that represents if there is a native interface being used for the
    player.
  </dd>

  <dt><code>mumbl.<strong title="?Object">interface</strong></code></dt>
  <dd>The interface to the player being used.</dd>
</dl>

### Events

Events can be subscribed to and unsubscribed from with `mumbl.observe()` and
`mumbl.unobserve()`. External events are events resulting from direct interaction
with a native interface for a player (like Songbird).

<dl>
  <dt><code>track</code></dt>
  <dd>
    This is dispatched when a track is selected.
  </dd>
  
  <dt><code>position</code></dt>
  <dd>
    This is dispatched when <code>mumbl.position()</code> changes.
  </dd>
  
  <dt><code>duration</code></dt>
  <dd>
    This is dispatched when <code>mumbl.duration()</code> changes.
  </dd>
  
  <dt><code>canplay</code></dt>
  <dd>
    This is dispatched when enough data from the currently selected track is loaded
    that it can play.
  </dd>
  
  <dt><code>canplaythrough</code></dt>
  <dd>
    This is dispatched when the rate at which the data from the selected track is
    loading fast enough to play through the whole track.
  </dd>
  
  <dt><code>load</code></dt>
  <dd>
    This is dispatched when all of the data for the selected track has been loaded.
  </dd>
  
  <dt><code>externalplaystate</code></dt>
  <dd>This is dispatched when the playing state of the player is changed externally.</dd>
  
  <dt><code>externalvolume</code></dt>
  <dd>This is dispatched when the volume of the player is changed externally.</dd>
  
  <dt><code>externalmute</code></dt>
  <dd>This is dispatched when the player is muted or unmuted externally.</dd>
  
  <dt><code>externallooping</code></dt>
  <dd>This is dispatched when the player's looping state is externally changed.</dd>
  
  <dt><code>externalshuffling</code></dt>
  <dd>This is dispatched when the player's shuffling state is externally changed.</dd>
</dl>


Note: There is no `ready` event which can be subscribed to with `mumbl.observe()`. The
`mumbl.onready()` subscription method should be used instead.

------------------------------------------------------------------------------------------

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

* 0.1.2
   * Use SM2 fallback when HTML5 is supported but none of the media types provided to mumbl are supported.
   * Better error handling.
   * A `loaderror` event.
* A while after version 0.1 is released
   * Create a simple library that makes all MP3, OGG, WAV, etc. links be able to
     be played using mumbl.
   * Make the demo mumbl-powered music player (it might be renamed "mumblr")
     portable and reusable.
    * Remove jQuery dependency from mumblr.
    * Make the track title display scroll (maybe using a &lt;marquee&gt;) when
       it overflows.
* Version 0.2
   * Full compatability with every major browser.
* The distant future (maybe version 1.0)
   * Create a simplified flash audio back-end for mumbl that integrates much more
     nicely and has a smaller file size than SoundManager2.


![Tracking image](//in.getclicky.com/212712ns.gif =1x1)


  [contact]: http://github.com/eligrey
  [demo]: http://purl.eligrey.com/mumbl/demo
  [sb]: http://getsongbird.com/
  [sm2]: http://www.schillmania.com/projects/soundmanager2/
