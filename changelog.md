mumbl Changelog
===============

0.0.3
-----
Chromium [issue 16768](http://code.google.com/p/chromium/issues/detail?id=16768) has been fixed so the workaround code is no longer needed.

0.0.2
-----

 * Created unit tests.
 * Added `mumbl.destruct()` method to remove mumbl and stop audio playback.
 * Added read-only shuffling support for Songbird.
 * Renamed `mumbl.players.AUDIO_TAG` to `mumbl.players.HTML5_AUDIO`.
 * Removed `onExternal*` event handling code from the HTML5 `<audio>` code as it's
   very unlikely it would ever be fired. The `onExternal*` events still work in Songbird.
   * Added `mumbl.onExternalLoopingChange` and `mumbl.onExternalShufflingChange`.
 * Now using spaces instead of tabs.

### Bugfixes
 * `mumbl.addTracks` fixed.
 * [Songbird] `mumbl.addTrack` now searches through the `TrackItem` for any non-OGG files so you
   may now put OGG files at the top of your `TrackItem`s (as long as there are other formats specified).
 * [Songbird] `mumbl.play` now checks to see if `songbird.paused` is true before playing (otherwise Songbird used to crash).

