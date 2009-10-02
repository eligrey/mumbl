module("mumbl " + mumbl.version);

if (mumbl.player !== mumbl.players.UNSUPPORTED) {

//soundManager.onready(function(){

var playlist = [
    "Cryogenic%20Unrest",
    "Disturbed%20Orbit",
    "SOS%20Distress",
    "Ghosts%20in%20HyperSpace",
    "Binary%20Lovers"
],
continueTests;
playlist.location = "../demo/music/%40F1LT3R%20-%20";

test("playlist management", function () {
    expect(5);
    equals( mumbl.length(), 0, "mumbl.length" );
    
    mumbl.addTrack( // add a single track
      playlist.location + playlist[0] + ".ogg", "audio/ogg",
      playlist.location + playlist[0] + ".mp3", "audio/mpeg"
    );
    
    equals( mumbl.length(), 1, "mumbl.addTrack" );
    
    mumbl.clear();
    
    equals( mumbl.length(), 0, "mumbl.clear" );
    
    var TrackItemList = [];
    for (var i = 1; i < playlist.length; i++) {
        TrackItemList.push([
          playlist.location + playlist[i] + ".ogg", "audio/ogg",
          playlist.location + playlist[i] + ".mp3", "audio/mpeg"
        ]);
    }
    mumbl.addTracks.apply(mumbl, TrackItemList);
    
    equals( mumbl.length(), 4, "mumbl.addTracks" );
    
    mumbl.removeTrack(3);
    
    equals( mumbl.length(), 3, "mumbl.removeTrack" );
    
    mumbl.onCanPlayThroughTrack = test2;
    mumbl.track(0);
});

function test2 () {
    mumbl.onCanPlayThroughTrack = null;
    test("playing music", function () {
        expect(8);
        
        mumbl.play();
        
        ok( confirm("Press OK if you hear music playing.\nIf you are using " +
                   "Google Chrome, you may only hear it for a moment."), "mumbl.play" );
        equals( mumbl.playing(), true, "after playing: mumbl.playing" );
        equals( mumbl.paused(), false, "after playing: mumbl.paused" );
        equals( mumbl.stopped(), false, "after playing: mumbl.stopped" );
        
        mumbl.pause();
        
        ok( confirm("Press OK if you don't hear music playing now."), "mumbl.pause" );
        equals( mumbl.paused(), true, "after pausing: mumbl.paused" );
        equals( mumbl.paused(), true, "after pausing: mumbl.paused" );
        equals( mumbl.stopped(), false, "after pausing: mumbl.stopped" );
        
        mumbl.onCanPlayThroughTrack = test3;
        mumbl.track(0);
    });
}

function test3 () {
    mumbl.onCanPlayThroughTrack = null;
    test("duration and position", function () {
        
        if (mumbl.player !== mumbl.players.SONGBIRD) {
          expect(2);
          mumbl.position(10);
          stop();
          setTimeout(function () { // currentTime takes a moment to update in Firefox
             start();
             equals( Math.floor(mumbl.position()), 10, "mumbl.position" );
             mumbl.track(0);
          }, 50);
        } else {
          expect(1);
        }
        
        equals( Math.floor(mumbl.duration()), 163, "mumbl.duration" );
        
        mumbl.onTrackLoad = test4;
    })
}

function test4 () { // this test is N/A for Songbird
    mumbl.onTrackLoad = null;
    test("looping and shuffling", function () {
        expect(1);
        stop();
        var container = document.body,
        loopingWorks = document.createElement("button"),
        loopingDoesntWork = document.createElement("button");
        loopingWorks.innerHTML = "Looping works";
        loopingDoesntWork.innerHTML = "Looping doesn't work";
        loopingWorks.onclick = function () {
            container.removeChild(loopingWorks);
            container.removeChild(loopingDoesntWork);
            mumbl.destruct();
            start();
            ok(true, "looping");
        };
        loopingDoesntWork.onclick = function () {
            container.removeChild(loopingWorks);
            container.removeChild(loopingDoesntWork);
            mumbl.destruct();
            start();
            ok(false, "looping");
        };
        container.appendChild(loopingWorks);
        container.appendChild(loopingDoesntWork);
        
        mumbl.position(155);
        mumbl.play();
        mumbl.loop(1);
        
        // TODO: shuffling test
    })
}


//});

} else {
	test("browser support", function () {
		ok(false, "Unsupported browser");
	});
}
