/*
* mumbl JavaScript Library v0.0.3
* 2009-08-25
* By Elijah Grey, http://eligrey.com
*
* See README.md for help
*
* License: GNU GPL v3 and the X11/MIT license
*   See COPYING.md
*/

/*jslint white: true, browser: true, nomen: true, eqeqeq: true, strict: true, immed: true */

"use strict";

(this.mumbl || (function () {
    var
    // change these to change the API
    // syntax: $PROPERTY_NAME$ = "propertyName",
    
    // Fields:
    $PLAYER$          = "player",
    $INTERFACE$       = "_interface",

    // Methods:
    $PLAY$            = "play",
    $STOP$            = "stop",
    $PAUSE$           = "pause",
    $POSITION$        = "position",
    $VOLUME$          = "volume",
    $PLAYING$         = "playing",
    $STOPPED$         = "stopped",
    $PAUSED$          = "paused",
    $LOOP$            = "loop",
    $DURATION$        = "duration",
    $ADD_TRACK$       = "addTrack",
    $REMOVE_TRACK$    = "removeTrack",
    $ADD_TRACKS$      = "addTracks",
    $NEXT$            = "next",
    $PREVIOUS$        = "previous",
    $CLEAR$           = "clear",
    $TRACK$           = "track",
    $TRACKS$          = "tracks",
    $LENGTH$          = "length",
    $TOGGLE_PAUSE$    = "togglePause",
    $MUTE$            = "mute",
    $SHUFFLE$         = "shuffle",
    
    window             = this,
    players            = 3,
    
    mumbl              = {
        players: {
            UNSUPPORTED   : 0,
            HTML5_AUDIO   : 1,
            SONGBIRD      : 2,
            SOUNDMANAGER2 : 3,
            addPlayer     : function (id) { // use this to add custom players
                if (!(id in mumbl.players)) {
                    mumbl.players[id] = ++players;
                }
            }
        },
        destruct: function () {
            mumbl[$STOP$]();
            delete window.mumbl;
        }
    },
    
    True               = true,
    False              = false,
    
    doc                = document,
    audio_elem         = doc.createElement("audio"),
    
    trackIndex         = 0,
    looping            = 2, // 0 = no loop, 1 = loop track, 2 = loop playlist
    duration           = 0,
    volume             = 0,
    playlistLength     = 0,
    
    muted              = False,
    stopped            = True,
    paused             = True,
    shuffle            = False,
    
    player,
    
    createEventHandler    = function (prop) {
        return function () {
            if (typeof mumbl[prop] === "function") {
                mumbl[prop]();
            }
        };
    },
    
    // Event methods:
    
    onTrackChange             = createEventHandler("onTrackChange"),
    onTrackReady              = createEventHandler("onTrackReady"),
    onCanPlayTrack            = createEventHandler("onCanPlayTrack"),
    onCanPlayThroughTrack     = createEventHandler("onCanPlayThroughTrack"),
    onTrackLoad               = createEventHandler("onTrackLoad"),
    onExternalPlayStateChange = createEventHandler("onExternalPlayStateChange"),
    onExternalVolumeChange    = createEventHandler("onExternalVolumeChange"),
    onExternalMuteChange      = createEventHandler("onExternalMuteChange"),
    onExternalLoopingChange   = createEventHandler("onExternalLoopingChange"),
    onExternalShufflingChange = createEventHandler("onExternalShufflingChange"),
    
    
    all_track_handlers    = function () {
        onTrackChange();
        onTrackReady();
        onCanPlayTrack();
        onCanPlayThroughTrack();
        onTrackLoad();
    };
    
    // generic/default mumbl functions:
    mumbl[$PLAYER$]       = mumbl.players.UNSUPPORTED;
    
    mumbl[$PLAY$]         = function () {
        player.play();
        paused = False;
        stopped = False;
    };
    mumbl[$PAUSE$]        = function () {
        player.pause();
        paused = True;
        if (!stopped) {
            stopped = False;
        }
    };
    mumbl[$PAUSED$]       = function () {
        return paused;
    };
    mumbl[$NEXT$]         = function () {
        var item = mumbl[$TRACK$];
        if (item() + 1 < mumbl[$LENGTH$]()) {
            item(item() + 1);
        } else if (looping === 2) {
            item(0);
        }
    };
    mumbl[$PREVIOUS$]     = function () {
        var item = mumbl[$TRACK$];
        if (item() - 1 > - 1) {
            item(item() - 1);
        } else {
            item(mumbl[$LENGTH$]() - 1);
        }
    };
    mumbl[$TOGGLE_PAUSE$] = function () {
        if (paused) {
            mumbl[$PLAY$]();
        } else {
            mumbl[$PAUSE$]();
        }
    };
    mumbl[$ADD_TRACKS$]   = function () {
        var args = Array.prototype.slice.call(arguments),
        len = args.length,
        i = 0;
        for (; i < len; i++) {
            mumbl[$ADD_TRACK$].apply(mumbl, args[i]);
        }
    };
    mumbl[$DURATION$]     = function () {
        return duration;
    };
    
    // developer note: To remove last-created library: songbird.siteLibrary.remove(songbird.siteLibrary.getPlaylists().getNext())
    if (window.songbird) {
        player               = window.songbird;
        
        var currentTrack,
        notSettingVolume     = True,
        notChangingPlayState = True,
        notMuting            = True,
        notSettingShuffle    = True,
        notSettingLooping    = True,
        library              = player.siteLibrary,
        mediaList            = library.createSimpleMediaList("mumbl"),
        interfaceEventPrefix = "faceplate.",
        uriProp              = "http://purl.eligrey.com/mumbl/songbird#originURI",
        addListener          = function (topic, handler) {
            player.addListener(topic, {
                observe: handler
            });
        },
        absoluteURI          = function (uri) { // convert relative URIs to absolute for Songbird
            var protocol = location.protocol + "//";
            uri = uri.replace(/^\/\//, protocol); // handle "//example.com"
            if (/^[\w\-]+:/.test(uri)) {
                return uri;
            }
            if (uri.substr(0, 1) === "/") { // root uri
                return protocol + location.host + uri;
            } else { // remove everything after last slash
                return protocol + location.host + (location.pathname.replace(/([\s\S]*\/)[\s\S]*$/, "$1")) + uri;
            }
        };
        mediaList.clear(); // just in case it wasn't cleared previously (browser crash)
        
        mumbl[$PLAYER$]      = mumbl.players.SONGBIRD;    
        mumbl[$INTERFACE$]   = player;
        
        mumbl[$PLAY$]        = function () {
            if (paused) {
                notChangingPlayState = False;
                player.play();
                notChangingPlayState = True;
            }
            stopped = False;
        };
        mumbl[$PAUSE$]       = function () {
            notChangingPlayState = False;
            player.pause();
            notChangingPlayState = True;
        };
        mumbl[$ADD_TRACK$]   = function (uri) {
            // Songbird can play anything gstreamer can but has issues with seeking
            // OGG files, so prefer anything that doesn't match /^a(udio|pplication)\/ogg;?/i
            
            if (arguments.length > 2) { // more than one file specified
                var args = Array.prototype.slice.call(arguments),
                len = args.length,
                file,
                i = 0;
                
                for (; i < len; i += 2) {
                    file = args.slice(i, i + 2);
                    // file[0] = file URI
                    // file[1] = file media type
                    if (!!file[1] && !/^a(udio|pplication)\/ogg;?/i.test(file[1])) {
                        // found a non-OGG file
                        if (!!(uri = file[0])) {
                            break;
                        }
                    }
                }
            }
            uri = absoluteURI(uri);
            var mediaItem = library.createMediaItem(uri);
            mediaItem.setProperty(uriProp, uri);
            mediaList.add(mediaItem);
            
            playlistLength = mediaList.length;
        };
        mumbl[$STOP$]        = function () {
            player.stop();
            duration = 0;
            stopped = True;
            all_track_handlers();
        };
        mumbl[$MUTE$]        = function (state) {
            if (typeof state !== "boolean") {
                return muted;
            }
            notMuting = False;
            player.mute = muted = state;
            notMuting = True;
        };
        mumbl[$LOOP$]        = function (loopType) {
            if (isNaN(loopType)) {
                return looping;
            }
            // can't set it as of v1.4 but can in future
            notSettingLooping = False;
            player.repeat = loopType;
            notSettingLooping = True;
        };
        mumbl[$SHUFFLE$]        = function (shuffling) {
            if (isNaN(shuffling)) {
                return shuffle;
            }
            // can't set it as of v1.4 but can in future
            notSettingShuffle = False;
            player.shuffle = shuffling;
            notSettingShuffle = True;
        };
        mumbl[$TRACKS$]      = function () {
            // recreate playlist as a TrackItemList
            var items = [],
            len = playlistLength,
            i = 0;
            for (; i < len; i++) {
                items[i] = [[mediaList.getItemByIndex(i).getProperty(uriProp)]];
            }
            return items;
        };
        mumbl[$VOLUME$]      = function (newVolume) {
            if (isNaN(newVolume)) {
                return volume;
            }
            // can't set it as of v1.4 but can in future
            notSettingVolume = False;
            player.volume = newVolume * 255;
            notSettingVolume = True;
        };
        mumbl[$LENGTH$]      = function () {
            return playlistLength;
        };
        mumbl[$TRACK$]       = function (index) {
            if (isNaN(index)) {
                return trackIndex;
            }
            var wasPaused = paused;
            notChangingPlayState = False;
            player.playMediaList(mediaList, index);
            if (wasPaused) {
                mumbl[$PAUSE$]();
            }
            notChangingPlayState = True;
        };
        mumbl[$REMOVE_TRACK$] = function (index) {
            mediaList.removeByIndex(index);
            playlistLength = mediaList.length;
        };
        mumbl[$CLEAR$]       = function () {
            mumbl[$STOP$]();
            mediaList.clear();
            playlistLength = mediaList.length;
        };
        mumbl[$PLAYING$]     = function () {
            return player.playing;
        };
        mumbl[$POSITION$]    = function (seconds) {
            if (isNaN(seconds)) {
                return player.position / 1000;
            } else if (!mumbl[$STOPPED$]()) {
                if (seconds < 0) {
                    seconds = 0;
                }
                // can't set it as of v1.4 but can in future
                player.position = 1 + (seconds * 1000); // convert seconds to milliseconds
            }
        };
        mumbl[$STOPPED$]     = function () {
            return stopped;
        };
        
        addListener(interfaceEventPrefix + "volume", function () {
            volume = player.volume * 255;
            (notSettingVolume && onExternalVolumeChange());
        });
        
        addListener(interfaceEventPrefix + "mute", function () {
            muted = player.mute;
            (notMuting && onExternalMuteChange());
        });
        
        addListener(interfaceEventPrefix + "paused", function () {
            paused = player.paused;
            (notChangingPlayState && onExternalPlayStateChange());
        });
        
        addListener("playlist.repeat", function () {
            looping = player.repeat;
            (notSettingLooping && onExternalLoopingChange());
        });
        
        addListener("playlist.shuffle", function () {
            shuffle = player.shuffle;
            (notSettingShuffle && onExternalShufflingChange());
        });
        
        // http://src.songbirdnest.com/source/xref/client/components/remoteapi/src/sbRemotePlayer.cpp#216
        doc.addEventListener("trackchange", function (evt) {
            currentTrack = evt.item;
            trackIndex   = mediaList.indexOf(currentTrack);
            duration     = (parseInt(currentTrack.getProperty("http://songbirdnest.com/data/1.0#duration"), 10) / 1000000) || 0; // convert microseconds to seconds
            
            all_track_handlers();
        }, False);
        
        window.addEventListener("unload", function () {
            //doc.removeEventListener("trackchange", ontrackchange_handler, False);
            mediaList.clear();
            library.remove(mediaList);
        }, False);
    } else {
        // similar methods for HTML5 <audio> and SoundManager2
        var playlist = [];
        
        mumbl[$CLEAR$]       = function () {
            mumbl[$STOP$]();
            playlist = [];
            playlistLength = playlist.length;
        };
        mumbl[$ADD_TRACK$]    = function () {
            var args = Array.prototype.slice.call(arguments),
            len = args.length,
            files = [],
            i = 0;
            for (; i < len; i += 2) {
                files.push(args.slice(i, i + 2));
            }
            
            playlist.push(files);
            playlistLength = playlist.length;
        };
        mumbl[$REMOVE_TRACK$] = function (index) {
            playlist.splice(index, 1);
            playlistLength = playlist.length;
        };
        mumbl[$LENGTH$]     = function () {
            return playlistLength;
        };
        mumbl[$TRACKS$]     = function () {
            return playlist.slice(0);
        };
        if (typeof audio_elem.canPlayType === "function") {
            player            = audio_elem;
        
            var addEvent, remEvent,
            onended_handler = function () {
                var item = mumbl[$TRACK$];
                if (looping) {
                    if (looping === 1) {
                        mumbl[$POSITION$](0);
                        return;
                    } else if (looping === 2 && item() === mumbl[$LENGTH$]() - 1) {
                        item(0);
                        return;
                    }
                }
                if (item() < mumbl[$LENGTH$]() - 1) {
                    mumbl[$NEXT$]();
                }
            },
            onvolumechange_handler = function () {
                volume = player.volume;
            },
            onplaypause_handler = function () {
                paused = player.paused;
            },
            clearChildren = function () {
                var nodes = player.childNodes,
                len = nodes.length,
                i = 0;
                for (; i < len; i++) {
                    if (nodes.item(i) !== null) {
                        player.removeChild(nodes.item(i));
                    }
                }
                player.load();
            };
        
            if (player.addEventListener && player.removeEventListener) {
                addEvent = function (event, handler) {
                    player.addEventListener(event, handler, False);
                };
                remEvent = function (event, handler) {
                    player.removeEventListener(event, handler, False);
                };
            } else if (player.attachEvent && player.detachEvent) {
                // you never know, IE might actually implement the audio
                addEvent = function (event, handler) {
                    player.attachEvent("on" + event, handler);
                };
                remEvent = function (event, handler) {
                    player.detachEvent("on" + event, handler);
                };
            }
        
            mumbl[$PLAYER$]      = mumbl.players.HTML5_AUDIO;
            mumbl[$INTERFACE$]   = player;
            
            mumbl[$STOP$]        = function () {
                stopped = True;
                duration = 0;
                clearChildren();
                player.load();
                all_track_handlers();
            };
            mumbl[$LOOP$]     = function (state) {
                if (isNaN(state)) {
                    return looping;
                }
            
                if ((looping = state) && player.ended) {
                    onended_handler();
                }
            };
            mumbl[$MUTE$]        = function (state) {
                if (typeof state !== "boolean") {
                    return player.muted;
                }
                player.muted = muted = state;
            };
            mumbl[$TRACK$]     = function (index) {
                if (isNaN(index)) {
                    return trackIndex;
                }
            
                var items = playlist[index],
                len = items.length,
                source,
                i = 0;
            
                clearChildren();
            
                for (; i < len; i++) {
                    source = document.createElement("source");
                    source.setAttribute("src", items[i][0]);
                    if (items[i][1]) {
                        source.setAttribute("type", items[i][1]);
                    }
                    player.appendChild(source);
                }
                trackIndex = index;
                stopped = False;
                player.load();
                if (paused) {
                    player.pause();
                }
                onTrackChange();
            };
            mumbl[$POSITION$]    = function (seconds) {
                if (isNaN(seconds)) {
                    return player.currentTime;
                } else if (!mumbl[$STOPPED$]()) {
                    if (seconds < 1) {
                        seconds = (seconds < 0 ? 0 : seconds) + 0.01022; // fix negative position
                    }
                    try { // if it doesn't work try again in 50ms (Firefox doesn't update the currentTime right away)
                        player.currentTime = seconds;
                    } catch (ex) {
                        setTimeout(function () {
                            player.currentTime = seconds;
                        }, 50);
                    }
                }
            };
            mumbl[$VOLUME$]     = function (newVolume) {
                if (isNaN(newVolume)) {
                    return volume;
                }
                player.volume = newVolume;
            };
            mumbl[$PLAYING$]    = function () {
                return !paused;
            };
            mumbl[$STOPPED$]    = function () {
                return stopped;
            };
            
            doc.documentElement.appendChild(player);
            addEvent("pause", onplaypause_handler);
            addEvent("pause", onplaypause_handler);
            addEvent("loadedmetadata", function () {
                duration = player.duration;
                onTrackReady();
            });
            addEvent("volumechange", onvolumechange_handler);
            addEvent("load", onTrackLoad);
            addEvent("canplay", onCanPlayTrack);
            addEvent("canplaythrough", onCanPlayThroughTrack);
            addEvent("ended", onended_handler);
            
            onvolumechange_handler();
            onplaypause_handler();
            player.autoplay = True;
        } /*else if (window.soundManager) {
            // http://www.schillmania.com/projects/soundmanager2/doc/
            player = window.soundManager;
            mumbl[$PLAYER$]     = mumbl.players.SOUNDMANAGER2;
            mumbl[$INTERFACE$]  = player;
            // TODO: Implement SoundManager 2 support
        }*/
    }
    
    window.mumbl = mumbl;
}.call(this)));
