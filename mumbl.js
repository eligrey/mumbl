/*
 * mumbl JavaScript Library v0.1
 * 2010-04-03
 * By Elijah Grey, http://eligrey.com
 *
 * See README.md for help
 *
 * License: GNU GPL v3 and the X11/MIT license
 *   See COPYING.md
 */

/*global self, setTimeout */

/*jslint white: true, undef: true, eqeqeq: true, bitwise: true, regexp: true, nomen: true,
  strict: true, newcap: true, immed: true, maxerr: 1000, maxlen: 90 */

// Ignore all of JSLint's "Expected an assignment or function call and instead
// saw an expression" errors as the code is perfectly valid.

/* Relevant Player Bugs
 *
 * Songbird:
 *  - [FIXED] http://bugzilla.songbirdnest.com/show_bug.cgi?id=17577
 *      songbird.play() crashes Songbird unless playing and paused
 *  - http://bugzilla.songbirdnest.com/show_bug.cgi?id=17578
 *      songbird.duration or songbird.length needed for currently playing song
 *  - http://bugzilla.songbirdnest.com/show_bug.cgi?id=17582
 *      accessing dataremotes through remoteapi via observers throws exception
 *  - http://bugzilla.songbirdnest.com/show_bug.cgi?id=15169
 *      Ogg-in-Flac files do not show track duration time
 *
 * Chromium / Google Chrome:
 *  - [FIXED] http://code.google.com/p/chromium/issues/detail?id=16768
 *      layout test fails because "ended" event is not triggered when video plays to end
 */

"use strict";

self.mumbl = self.mumbl || (function (self) {
	var
	
	// Fields:
	$player            = "player",
	$players           = $player + "s",
	$interface         = "interface",
	
	// Methods:
	$play              = "play",
	$stop              = "stop",
	$pause             = "pause",
	$position          = "position",
	$volume            = "volume",
	$playing           = $play  + "ing",
	$stopped           = $stop  + "ped",
	$paused            = $pause + "d",
	$loop              = "loop",
	$duration          = "duration",
	$add_track         = "addTrack",
	$remove_track      = "removeTrack",
	$add_tracks        = $add_track + "s",
	$next              = "next",
	$previous          = "previous",
	$clear             = "clear",
	$track             = "track",
	$tracks            = $track + "s",
	$length            = "length",
	$toggle_pause      = "togglePause",
	$mute              = "mute",
	$shuffle           = "shuffle",
	
	players            = 4,
	
	events             = {},
	played             = [],
	
	doc                = self.document,
	audioElem          = doc && doc.createElement("audio"),
	
	math               = Math,
	ArrayCtr           = Array,
	
	trackIndex         = 0,
	looping            = 2, // 0 = no loop, 1 = loop track, 2 = loop playlist
	duration           = 0,
	volume             = 1,
	playlistLen        = 0,
	
	TRUE               = !0,
	FALSE              = !1,
	NULL               = null,
	
	stopped            = TRUE,
	paused             = TRUE,
	muted              = FALSE,
	shuffled           = FALSE,
	
	$add_evt_listener  = "addEventListener",
	
	playlist,
	player,
	
	arrayIndexOf = ArrayCtr.prototype.indexOf || function (item) {
		var len = this[$length],
			i   = 0;
		for (; i < len; i++) {
			if (i in this && this[i] === item) {
				return i;
			}
		}
		return -1;
	},
	
	hasOwnProp = Object.prototype.hasOwnProperty,
	
	mumbl  = {
		version: [0, 1, 0, "", ""], // 0.1.0
		player: 0,
		players: {
			UNSUPPORTED   : 0,
			HTML5         : 1,
			SONGBIRD      : 2,
			SOUNDMANAGER2 : 3,
			addPlayer     : function (player) { // use this to add custom players
				player = player.toUpperCase().replace(/\s/g, "");
				if (!(player in mumbl[$players])) {
					mumbl[$players][player] = players++;
				}
				return mumbl[$players][player];
			}
		},
		playerIs: function (player) {
			return mumbl.player === mumbl[$players][
				player.toUpperCase().replace(/\s/g, "")
			];
		},
		observe: function (event, observer) {
			if (hasOwnProp.call(events, event)) {
				events[event].push(observer);
			}
		},
		unobserve: function (eventType, observer) {
			if (hasOwnProp.call(events, eventType)) {
				var event = events[eventType],
				indexOfObserver = arrayIndexOf.call(event, observer);
				if (indexOfObserver !== -1) {
					event.splice(indexOfObserver, 1);
				}
			}
		},
		destruct: function () {
			mumbl[$clear]();
			delete self.mumbl;
		},
		onready: function (callback, scope) {
			scope = scope === NULL || typeof scope === "undefined" ? mumbl : scope;
			if (mumbl.player !== 3) { // !mumbl.playerIs("SoundManager")
				callback.call(scope, mumbl);
			} else {
				player.onready(function () {
					callback.call(scope, mumbl);
				});
			}
		},
		integrated: FALSE
	},
	
	removeFromPlayed = function (track) {
		var i = played[$length];
		while (i--) {
			if (played[i] > track) {
				played[i]--;
			} else if (played[i] === track) {
				played.splice(i, 1);
			}
		}
	},
	
	randomUnplayedTrack = function () {
		var track = math.floor(math.random() * playlistLen);
		if (arrayIndexOf.call(played, track) === -1) {
			return track;
		}
		return randomUnplayedTrack();
	},
	
	onEnded = function () {
		var track = mumbl[$track]();
		if (looping) {
			if (looping === 2 && track === mumbl[$length]() - 1) {
				mumbl[$track](0);
			} else if (looping === 1) {
				mumbl[$track](track);
				return;
			}
		}
		if (track < mumbl[$length]() - 1) {
			mumbl[$next]();
		}
	},
	
	slice = function (obj) {
		return ArrayCtr.prototype.slice.call(obj);
	},
	
	createExceptionThrower = function (ex) {
		return function () {
			throw ex;
		};
	},
	
	dispatchEvent = function (eventType) {
		var event = events[eventType],
		len = event[$length],
		i = 0;
		if (len) {
			for (; i < len; i++) {
				try {
					event[i].call(mumbl, eventType);
				} catch (ex) {
					setTimeout(createExceptionThrower(ex), 0);
				}
			}
		}
	},
	
	createEventDispatcher = mumbl.createEventDispatcher = function (event) {
		if (!hasOwnProp.call(events, event)) {
			events[event] = [];
		}
		return function () {
			dispatchEvent(event);
		};
	},
	
	// Event methods:
	
	$canplay  = "canplay",
	$external = "external",
	
	onTrackChange             = createEventDispatcher($track),
	onDurationUpdate          = createEventDispatcher($duration),
	onPositionUpdate          = createEventDispatcher($position),
	onCanPlayTrack            = createEventDispatcher($canplay),
	onCanPlayThroughTrack     = createEventDispatcher($canplay + "through"),
	onTrackLoad               = createEventDispatcher("load"),
	onExternalPlayStateChange = createEventDispatcher($external + "playstate"),
	onExternalVolumeChange    = createEventDispatcher($external + "volume"),
	onExternalMuteChange      = createEventDispatcher($external + "mute"),
	onExternalLoopingChange   = createEventDispatcher($external + "looping"),
	onExternalShufflingChange = createEventDispatcher($external + "shuffling"),
	
	allTrackHandlers = function () {
		onTrackChange();
		onDurationUpdate();
		onPositionUpdate();
		onCanPlayTrack();
		onCanPlayThroughTrack();
		onTrackLoad();
	},
	
	inited;
	
	mumbl.version.toString = function () {
		return this.slice(0, 3).join(".") + this.slice(3, 5).join("");
	};
	
	mumbl[$length] = function () {
		return playlistLen;
	};
	mumbl[$playing] = function () {
		return !stopped;
	};
	mumbl[$paused] = function () {
		return paused;
	};
	mumbl[$stopped] = function () {
		return stopped;
	};
	mumbl[$next] = function () {
		var item = mumbl[$track];
		if (!shuffled) {
			if (item() + 1 < mumbl[$length]()) {
				item(item() + 1);
			} else if (looping === 2) {
				item(0);
			}
		} else {
			if (played[$length] === playlistLen) { // played every track
				if (looping === 2) {
					played[$length] = 0; // reset played
				} else {
					return;
				}
			}
			
			var track = arrayIndexOf.call(played, item()) + 1 && played.push(item());
			if (played[track]) {
				item(played[track]);
			} else {
				if (played[$length] === playlistLen) {
					played[$length] = 0;
				}
				item(randomUnplayedTrack());
			}
		}
	};
	mumbl[$previous] = function () {
		var item = mumbl[$track];
		if (!shuffled) {
			if (item()) {
				item(item() - 1);
			} else if (looping === 2) {
				item(playlistLen - 1);
			}
		} else {
			var track = arrayIndexOf.call(played, item());
			
			if (track === -1) {
				track = played.push(item()) - 1;
			}
			if (track) {
				item(played[track - 1]);
			} else {
				mumbl[$next]();
			}
		}
	};
	mumbl[$toggle_pause] = function () {
		if (paused) {
			mumbl[$play]();
		} else {
			mumbl[$pause]();
		}
	};
	mumbl[$shuffle] = function (state) {
		if (!arguments[$length]) {
			return shuffled;
		}
		shuffled = state;
	};
	mumbl[$add_tracks] = function () {
		var args = slice(arguments),
		len = args[$length],
		i = 0;
		for (; i < len; i++) {
			mumbl[$add_track].apply(mumbl, args[i]);
		}
	};
	mumbl[$duration] = function () {
		return duration;
	};
	
	// developer note: To remove last-created library:
	// songbird.siteLibrary.remove(songbird.siteLibrary.getPlaylists().getNext())
	inited = (self.songbird && (function () {
		player               = self.songbird;
		
		var currentTrack     = 0,
		notSettingVolume     = TRUE,
		notChangingPlayState = TRUE,
		notMuting            = TRUE,
		notSettingShuffle    = TRUE,
		notSettingLooping    = TRUE,
		library              = player.siteLibrary,
		durationProp         = "http://songbirdnest.com/data/1.0#duration",
		uriProp              = "http://purl.eligrey.com/mumbl#originURI",
		anchor               = doc.createElement("a"),
		isOGG                = /^\s*a(?:udio|pplication)\/(?:x-)?ogg\s*(?:$|;)/i,
		addListener          = function (topic, observer) {
			player.addListener(topic, {
				observe: observer
			});
		},
		playlist = library.createSimpleMediaList("mumbl");
		playlist[$clear](); // just in case it wasn't cleared previously (browser crash)
		
		var onTrackChangeObserver = function (evt) {
			var track = evt.item;
			if (!playlist.contains(track)) {
				return;
			}
			currentTrack = track;
			trackIndex   = playlist.indexOf(track);
			duration     = (
				parseInt(
					track.getProperty(durationProp),
					10
				) / 1000000 // convert microseconds to seconds
			) || 0;
			
			allTrackHandlers();
		};
		
		
		mumbl[$player]    = 2; // mumbl.players.SONGBIRD
		mumbl[$interface] = player;
		mumbl.integrated  = TRUE;
		
		mumbl[$play] = function () {
			notChangingPlayState = FALSE;
			player[$play]();
			notChangingPlayState = TRUE;
			stopped = FALSE;
		};
		mumbl[$pause] = function () {
			notChangingPlayState = FALSE;
			player[$pause]();
			notChangingPlayState = TRUE;
		};
		mumbl[$add_track] = function (uri) {
			// Songbird can play anything gstreamer can but has issues with seeking OGG
			// files, so prefer anything that doesn't match ^a(udio|pplication)\/ogg
			if (arguments[$length] > 2) { // more than one file specified
				var args = slice(arguments),
				len = args[$length],
				file,
				i = 0;
				
				for (; i < len; i += 2) {
					file = args.slice(i, i + 2);
					// file[0] = file URI
					// file[1] = file media type
					if (!isOGG.test(file[1])) {
						uri = file[0];
						break;
					}
				}
			}
			anchor.href = uri;
			var absURI = anchor.href, // get absolute location of uri
			mediaItem  = library.createMediaItem(absURI);
			anchor.removeAttribute("href");
			mediaItem.setProperty(uriProp, uri);
			playlist.add(mediaItem);
			
			playlistLen = playlist[$length];
		};
		mumbl[$stop] = function () {
			player[$stop]();
			duration = 0;
			stopped = TRUE;
			allTrackHandlers();
		};
		mumbl[$mute] = function (state) {
			if (!arguments[$length]) {
				return muted;
			}
			notMuting = FALSE;
			player[$mute] = muted = state;
			notMuting = TRUE;
		};
		mumbl[$loop] = function (loopType) {
			if (!arguments[$length]) {
				return looping;
			}
			notSettingLooping = FALSE;
			player.repeat = loopType;
			notSettingLooping = TRUE;
		};
		mumbl[$shuffle] = function (state) {
			if (!arguments[$length]) {
				return shuffled;
			}
			notSettingShuffle = FALSE;
			player[$shuffle] = state;
			notSettingShuffle = TRUE;
		};
		mumbl[$tracks] = function () {
			// recreate playlist as a TrackItemList
			var tracks = [],
			    i      = 0;
			for (; i < playlistLen; i++) {
				tracks.push([playlist.getItemByIndex(i).getProperty(uriProp), NULL]);
			}
			return tracks;
		};
		mumbl[$volume] = function (newVolume) {
			if (!arguments[$length]) {
				return volume;
			}
			notSettingVolume = FALSE;
			player[$volume] = newVolume * 255;
			notSettingVolume = TRUE;
		};
		mumbl[$track] = function (index) {
			if (!arguments[$length]) {
				return trackIndex;
			}
			var wasPaused = paused;
			notChangingPlayState = FALSE;
			player.playMediaList(playlist, index);
			if (wasPaused) {
				mumbl[$pause]();
			}
			notChangingPlayState = TRUE;
		};
		mumbl[$remove_track] = function (index) {
			playlist.removeByIndex(index);
			playlistLen = playlist[$length];
		};
		mumbl[$clear] = function () {
			mumbl[$stop]();
			playlist[$clear]();
			playlistLen = playlist[$length];
		};
		mumbl[$playing] = function () {
			return player[$playing];
		};
		mumbl[$position] = function (seconds) {
			if (!arguments[$length]) {
				return player[$position] / 1000;
			} else if (!mumbl[$stopped]()) {
				if (seconds < 0) {
					seconds = 0;
				}
				// can't set it as of v1.4 but can in future
				player[$position] = 1 + (seconds * 1000); // convert seconds to ms
			}
		};
		mumbl.destruct = function () {
			self.removeEventListener("trackchange", onTrackChangeObserver, FALSE);
			mumbl[$clear]();
			library.remove(playlist);
			self.removeEventListener("unload", mumbl.destruct, FALSE);
			delete self.mumbl;
		};
		
		addListener("faceplate." + $volume, function () {
			volume = player[$volume] / 255;
			if (notSettingVolume) {
				onExternalVolumeChange();
			}
		});
		addListener("faceplate." + $mute, function () {
			muted = player[$mute];
			if (notMuting) {
				onExternalMuteChange();
			}
		});
		addListener("faceplate." + $paused, function () {
			paused = player[$paused];
			if (notChangingPlayState) {
				onExternalPlayStateChange();
			}
		});
		addListener("playlist.repeat", function () {
			looping = player.repeat;
			if (notSettingLooping) {
				onExternalLoopingChange();
			}
		});
		addListener("playlist." + $shuffle, function () {
			shuffled = player[$shuffle];
			if (notSettingShuffle) {
				onExternalShufflingChange();
			}
		});
		addListener("metadata." + $position, onPositionUpdate);
		
		// undocumented "trackchange" event:
		// http://src.songbirdnest.com/source/xref/client/components/remoteapi/src/
		// sbRemotePlayer.cpp#219
		self[$add_evt_listener]("trackchange", onTrackChangeObserver, FALSE);
		
		self[$add_evt_listener]("unload", mumbl.destruct, FALSE);
		
		return (paused = (stopped = TRUE));
	}())) || (typeof audioElem.canPlayType === "function" && (function () {
		player   = audioElem;
		playlist = [];
		
		var addEvent,
		clearChildren = function () {
			var nodes = player.childNodes,
			i = nodes[$length];
			while (i--) {
				player.removeChild(nodes.item(i));
			}
			player.load();
		};
		
		if (player[$add_evt_listener]) {
			addEvent = function (event, observer) {
				player[$add_evt_listener](event, observer, FALSE);
			};
		} else if (player.attachEvent) {
			// you never know, IE might actually add support for HTML5 audio
			addEvent = function (event, observer) {
				player.attachEvent("on" + event, observer);
			};
		}
	
		mumbl[$player]    = 1; // mumbl.players.HTML5_AUDIO
		mumbl[$interface] = player;
		
		
		mumbl[$play] = function () {
			player[$play]();
			(paused = stopped = FALSE);
		};
		mumbl[$pause] = function () {
			player[$pause]();
			paused = !(stopped = FALSE);
		};
		mumbl[$stop] = function () {
			stopped = TRUE;
			duration = 0;
			clearChildren();
			allTrackHandlers();
		};		
		mumbl[$clear] = function () {
			mumbl[$stop]();
			playlist = [];
			played   = [];
			playlistLen = 0;
		};
		mumbl[$add_track] = function () {
			var args  = slice(arguments),
			    len   = args[$length],
			    files = [],
			    i     = 0;
			for (; i < len; i += 2) {
				files.push(args.slice(i, i + 2));
			}
			playlistLen = playlist.push(files);
		};
		mumbl[$remove_track] = function (index) {
			playlist.splice(index, 1);
			playlistLen = playlist[$length];
			removeFromPlayed(index);
		};
		mumbl[$tracks] = function () {
			// convert [[[1,2],[3,4]],[[5,6],[7,8]]] to [[1,2,3,4],[5,6,7,8]]
			var flatItem = [],
			flatPlaylist = [],
			i            = 0,
			items, item;
			for (; i < playlistLen; i++) {
				items = playlist[i];
				item = items[$length];
				while (item--) {
					flatItem = items[item].concat(flatItem);
				}
				flatPlaylist.push(flatItem);
				flatItem.length = 0;
			}
			return flatPlaylist;
		};
		mumbl[$loop] = function (state) {
			if (!arguments[$length]) {
				return looping;
			}
			if ((looping = state) && player.ended) {
				onEnded();
			}
		};
		mumbl[$mute] = function (state) {
			if (!arguments[$length]) {
				return player.muted;
			}
			muted = player.muted = state;
		};
		mumbl[$track] = function (index) {
			if (!arguments[$length]) {
				return trackIndex;
			}
			var items = playlist[index],
			len = items[$length],
			source,
			i = 0;
			clearChildren();
			for (; i < len; i++) {
				source = doc.createElement("source");
				source.setAttribute("src", items[i][0]);
				if (items[i][1]) {
					source.setAttribute("type", items[i][1]);
				}
				player.appendChild(source);
			}
			trackIndex = index;
			stopped = FALSE;
			player.load();
			if (paused) {
				player[$pause]();
			}
			onTrackChange();
		};
		mumbl[$position] = function (seconds) {
			if (!arguments[$length]) {
				return player.currentTime;
			} else if (!stopped) {
				if (seconds < 1) {
					// fix negative position
					seconds = (seconds < 0 ? 0 : seconds) + 0.01022;
				}
				player.currentTime = seconds;
			}
		};
		mumbl[$volume] = function (vol) {
			if (!arguments[$length]) {
				return volume;
			}
			volume = player[$volume] = vol;
		};
		
		addEvent($duration + "change", function () {
			duration = player[$duration];
			onDurationUpdate();
		});
		addEvent("timeupdate", onPositionUpdate);
		addEvent("suspend", onTrackLoad); // most likely loaded
		addEvent("load", onTrackLoad);
		addEvent("canplay", onCanPlayTrack);
		addEvent("canplaythrough", onCanPlayThroughTrack);
		addEvent("ended", onEnded);
		
		return (player.autoplay = TRUE);
	}())) || (self.soundManager && (function () {
		// http://www.schillmania.com/projects/soundmanager2/doc/
		player   = self.soundManager;
		playlist = [];
		
		player.useFastPolling = player.allowPolling = TRUE;
		
		var sounds     = player.sounds,
		mumblNS        = "mumbl:",
		currentTrackId,
		getCurrentTrack = function () {
			return sounds[currentTrackId];
		},
		playSound = function (sound) {
			sound.setVolume(volume * 100);
			sound.setPosition(0);
			sound[$play]();
			if (sound.loaded) {
				allTrackHandlers();
			}
		},
		createReadyHandler = function (trackId) {
			var track = sounds[trackId],
			    ready = FALSE;
			return function () {
				if (ready) {
					onDurationUpdate();
				} else if (track[$duration] > track[$position] - 1) {
					// > 1 second is loaded
					ready = TRUE;
					onDurationUpdate();
					onCanPlayTrack();
				}
			};
		},
		createPlayingHandler = function (trackId) {
			var track = sounds[trackId],
			    ready = FALSE;
			return function () {
				if (ready) {
					onPositionUpdate();
				} else {
					ready = TRUE;
					if (stopped || paused) {
						track[$pause]();
						track.setPosition(0);
					}
					onDurationUpdate();
					onCanPlayThroughTrack();
				}
			};
		},
		SM2SoundOpts = function (uri) {
			var opts = this,
			trackId  = opts.id = mumblNS + (opts.url = uri);
			
			// SM2 disregards inherited properties, so don't use SoundOpts.prototype
			
			// callbacks
			opts.onload                 = allTrackHandlers;
			opts.whileloading           = createReadyHandler(trackId);
			opts.whileplaying           = createPlayingHandler(trackId);
			opts.onfinish               = onEnded;
			
			opts.stream                 = TRUE;
			
			// null
			opts.onplay                 = 
			opts.onpause                = 
			opts.onresume               = 
			opts.onstop                 = 
			opts.onid3                  = 
			opts.onbeforefinish         = 
			opts.onbeforefinishcomplete = 
			opts.onjustbeforefinish     = 
			opts.position               = NULL;
			
			// false
			opts.autoLoad               = 
			opts.multiShot              = 
			opts.multiShotEvents        = 
			opts.autoPlay               = FALSE;
			
			// ints
			opts.onbeforefinishtime     = // default 5000
			opts.onjustbeforefinishtime = // default 200
			opts.pan                    = 0;
			opts.volume                 = 100;
		};
		
		mumbl[$player]    = 3; // mumbl.players.SOUNDMANAGER2
		mumbl[$interface] = player;
		
		mumbl[$play] = function () {
			var track = getCurrentTrack();
			if (track && (stopped || paused)) {
				track.resume();
				stopped = paused = FALSE;
			}
		};
		mumbl[$pause] = function () {
			getCurrentTrack()[$pause]();
			paused = TRUE;
		};
		mumbl[$stop] = function () {
			getCurrentTrack()[$stop]();
			paused = stopped = TRUE;
		};
		mumbl[$loop] = function (state) {
			if (!arguments[$length]) {
				return looping;
			}
			if ((looping = state) &&
			    math.floor(mumbl[$position]() / mumbl[$duration]()) === 1)
			{
				onEnded();
			}
		};
		mumbl[$position] = function (seconds) {
			if (!arguments[$length]) {
				return getCurrentTrack()[$position] / 1000 || 0;
			}
			getCurrentTrack().setPosition(seconds * 1000);
		};
		mumbl[$volume] = function (vol) {
			if (!arguments[$length]) {
				return volume;
			}
			volume = vol;
			if (currentTrackId) {
				getCurrentTrack().setVolume(vol * 100);
			}
		};
		mumbl[$track] = function (index) {
			if (!arguments[$length]) {
				return trackIndex;
			}
			if (playlistLen) {
				var sound = sounds[playlist[index]];
				if (sound) {
					if (currentTrackId) {
						getCurrentTrack()[$stop]();
					}
					playSound(sound);
					currentTrackId = playlist[trackIndex = index];
					onTrackChange();
				}
			}
		};
		mumbl[$tracks] = function () {
			var tracks = [],
			    i      = 0;
			for (; i < playlistLen; i++) {
				tracks.push([playlist[i].substr(6), NULL]); // 6 === mumblNS.length
			}
			return tracks;
		};
		mumbl[$mute] = function (state) {
			if (!arguments[$length]) {
				return getCurrentTrack().muted;
			}
			getCurrentTrack()[(state ? "" : "un") + $mute]();
		};
		mumbl[$duration] = function () {
			return (getCurrentTrack().durationEstimate / 1000) || 0;
		};
		mumbl[$add_track] = function (uri) {
			if (arguments[$length] > 2) { // more than one file specified
				var args = slice(arguments),
				len = args[$length],
				file,
				i = 0;
				for (; i < len; i += 2) {
					file = args.slice(i, i + 2);
					// file[0] = file URI
					// file[1] = file media type
					if (player.canPlayMIME(file[1])) {
						uri = file[0];
						break;
					}
				}
			}
			player.createSound(new SM2SoundOpts(uri));
			playlistLen = playlist.push(mumblNS + uri);
		};
		mumbl[$remove_track] = function (index) {
			sounds[playlist[index]].destruct();
			playlist.splice(index, 1);
			playlistLen = playlist[$length];
			removeFromPlayed(index);
		};
		mumbl[$clear] = function () {
			var i = playlistLen;
			while (i--) {
				mumbl[$remove_track](i);
			}
			currentTrackId = FALSE;
		};
	}()));
	
	return mumbl;
}(self));
