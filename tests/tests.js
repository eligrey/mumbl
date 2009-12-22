var isSB = mumbl.playerIs("Songbird");

if (!mumbl.playerIs("unsupported")) {

mumbl.onready(function () {
var continueOn = function (event) {
	var observer = function (event) {
		mumbl.removeListener(event, arguments.callee);
		start();
	};
	mumbl.addListener(event, observer);
},
playlist = [
	"Cryogenic%20Unrest",
	"Disturbed%20Orbit",
	"SOS%20Distress",
	"Ghosts%20in%20HyperSpace",
	"Binary%20Lovers"
],
properties = "version player players playerIs addListener removeListener destruct onready INTEGRATED length playing paused stopped next previous togglePause shuffle addTracks duration _interface play pause stop clear addTrack removeTrack tracks loop mute track position volume".split(" ");
playlist.location = "../demo/music/%40F1LT3R%20-%20";

if (mumbl.playerIs("SoundManager2")) {
	setTimeout(function () {
		start(); // no idea why this is needed
		// TODO: figure out why I have to start() when using SM2
	}, 500);
}

test("core", function () {
	expect(1);
	var i = properties.length,
	desc = "missing properties: [", missing = [];
	while (i--) {
		if (!(properties[i] in mumbl)) {
			missing.push(properties[i]);
		}
	}
	ok(!missing.length, desc + missing.join(", ") + "]");
});
asyncTest("playlist management", function () {
	expect(8);
	
	equals( mumbl.length(), 0, "mumbl.length" );
	
	mumbl.addTrack( // add a single track
		playlist.location + playlist[0] + ".ogg", "audio/ogg; codecs=vorbis",
		playlist.location + playlist[0] + ".mp3", "audio/mpeg"
	);
	
	equals( mumbl.length(), 1, "mumbl.addTrack" );
	
	mumbl.clear();
	
	equals( mumbl.length(), 0, "mumbl.clear" );
	
	var TrackItemList = [];
	for (var i = 1; i < playlist.length; i++) {
		TrackItemList.push([
			playlist.location + playlist[i] + ".ogg", "audio/ogg; codecs=vorbis",
			playlist.location + playlist[i] + ".mp3", "audio/mpeg"
		]);
	}
	mumbl.addTracks.apply(mumbl, TrackItemList);
	
	equals( mumbl.length(), 4, "mumbl.addTracks" );
	
	mumbl.removeTrack(3);
	
	equals( mumbl.length(), 3, "mumbl.removeTrack" );
	
	mumbl.track(0);
	equals( mumbl.track(), 0, "mumbl.track" );
	
	mumbl.next();
	setTimeout(function() {
		equals( mumbl.track(), 1, "mumbl.next" );
		mumbl.previous();
		setTimeout(function() {
			equals( mumbl.track(), 0, "mumbl.previous" );
			start();
		}, 100);
	}, 100);
});

asyncTest("playing music", function () {
	expect(isSB ? 11 : 14);
	
	mumbl.play();
	
	ok( confirm("Press OK if you hear music playing (it may take a moment to start, give it some time)"), "mumbl.play" );
	equals( mumbl.playing(), true, "after playing: mumbl.playing" );
	equals( mumbl.paused(), false, "after playing: mumbl.paused" );
	equals( mumbl.stopped(), false, "after playing: mumbl.stopped" );
	
	mumbl.pause();
	
	ok( confirm("Press OK if you don't hear music playing now."), "mumbl.pause" );
	equals( mumbl.paused(), true, "after pausing: mumbl.paused" );
	equals( mumbl.paused(), true, "after pausing: mumbl.paused" );
	equals( mumbl.stopped(), false, "after pausing: mumbl.stopped" );
	
	mumbl.stop();
	
	equals( mumbl.playing(), false, "after stopping: mumbl.playing" );
	equals( mumbl.stopped(), true, "after stopping: mumbl.stopped" );
	equals( mumbl.paused(), true, "after stopping: mumbl.paused" );
	
	if (!isSB) {
		equals( mumbl.volume(), 1, "mumbl.volume()" );
		mumbl.volume(0.5);
	
		equals( mumbl.volume(), 0.5, "mumbl.volume(0.5)" );
		
		mumbl.volume(0.8);
		mumbl.next();
		setTimeout(function () {
			equals( Math.floor(mumbl.volume() * 10), 8, "volume persistance" );
			mumbl.volume(1);
			start();
		}, 100);
	} else {
		continueOn("canplay");
		mumbl.track(0);
	}
});

if (!isSB) {
asyncTest("shuffle", function () {
	expect(2);

	mumbl.shuffle(true);
	equals( mumbl.shuffle(), true, "shuffle on" );

	mumbl.shuffle(false);
	equals( mumbl.shuffle(), false, "shuffle off" );

	continueOn("load");
	mumbl.track(0);
});
asyncTest("looping", function () {
	expect(2);
	var container = document.getElementById("wait-message"),
	message = container.appendChild(document.createTextNode("Please wait for the looping test to finish..."));
	
	mumbl.play();
	setTimeout(function () { // can't call position right away in chrome
		mumbl.position(155);
		mumbl.loop(1);
		equals( mumbl.loop(), 1, "mumbl.loop" );
		setTimeout(function () {
			ok(mumbl.position() < 155, "looping");
			container.removeChild(message);
			start();
		}, 11000);
	}, 100);
})
}

asyncTest("duration and position", function () {
	expect(2 - isSB);
	if (!isSB) {
		mumbl.position(10);
		setTimeout(function () { // Firefox takes a moment to update currentTime
			var pos = Math.floor(mumbl.position());
			ok( pos > 8 && pos < 15, "mumbl.position (if this fails, reload the test suite and try again, slowly)" );
			start();
		}, 500);
	}
	var duration = Math.floor(mumbl.duration());
	ok( duration === 156 || duration === 163, "mumbl.duration" );
	
	if (isSB) {
		start();
	}
})

test("destruct", function () {
	expect(1);
	mumbl.destruct();
	equals(typeof window.mumbl, "undefined", "mumbl.destruct");
});

}, window);

} else {
	test("player support", function () {
			ok(false, "No supported audio player interface was detected");
	});
}
