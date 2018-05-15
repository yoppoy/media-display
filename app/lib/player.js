window.addEventListener(
    'DOMContentLoaded',
    init
);

function init() {
    document.querySelector('#prog').value = 0;
    document.querySelector('#volRange').value = document.querySelector('#videoContainer').volume;
    bindEvents();
}

var playlist = {index: 0, video: []};

function bindEvents() {
    var video = document.querySelector('#videoContainer');
    var progBar = document.querySelector('#prog');
    var dropArea = document.querySelector('#dropArea');

    video.addEventListener(
        'timeupdate',
        showProgress
    );

    video.addEventListener(
        'play',
        playing
    );

    video.addEventListener(
        'ended',
        ended
    );

    video.addEventListener(
        'pause',
        paused
    );

    video.addEventListener(
        'error',
        function (e) {
            videoError('Video Error');
        }
    );

    video.addEventListener(
        'stalled',
        function (e) {
            videoError('Video Stalled');
        }
    );

    dropArea.addEventListener(
        'dragleave',
        makeUnDroppable
    );

    dropArea.addEventListener(
        'dragenter',
        makeDroppable
    );

    dropArea.addEventListener(
        'dragover',
        makeDroppable
    );

    dropArea.addEventListener(
        'drop',
        loadVideo
    );

    document.querySelector('#playerContainer').addEventListener(
        'click',
        playerClicked
    );

    document.querySelector('#chooseVideo').addEventListener(
        'change',
        loadVideo
    );

    document.querySelector('#volRange').addEventListener(
        'change',
        adjustVolume
    );

    document.querySelector('#enterLink').addEventListener(
        'change',
        loadVideo
    );

    window.addEventListener(
        'keyup',
        function (e) {
            switch (e.keyCode) {
                case 13 : //enter
                case 32 : //space
                    togglePlay();
                    break;
            }
        }
    );
}


function getTime(ms) {

    var date = new Date(ms);
    var time = [];

    time.push(date.getUTCHours());
    time.push(date.getUTCMinutes());
    time.push(date.getUTCSeconds());

    return time.join(':');
}

function adjustVolume(e) {
    var video = document.querySelector('#videoContainer');
    video.volume = e.target.value;
}

function showProgress() {
    var video = document.querySelector('#videoContainer');
    var progBar = document.querySelector('#prog');
    var count = document.querySelector('#count');
    if (video.duration != 0 && video.currentTime != 0)
        progBar.value = (video.currentTime / video.duration);
    else
        progBar.value = 0;
    count.innerHTML = getTime(video.currentTime * 1000) +
        '/' +
        getTime(video.duration * 1000);
}

function togglePlay() {
    console.log("toggling");
    document.querySelector('.play:not(.hide),.pause:not(.hide)').click();
}

function toggleScreen() {
    document.querySelector('.fullscreen:not(.hide),.smallscreen:not(.hide)').click();
}

function playing(e) {
    var player = document.querySelector('#playerContainer');

    document.querySelector('#play').classList.add('hide');
    document.querySelector('#pause').classList.remove('hide');
    player.classList.remove('paused');

    hideFileArea();
}

function fullscreened(e) {
    var player = document.querySelector('#playerContainer');
    player.classList.add('fullscreened');
    player.webkitRequestFullscreen();

}


function smallscreened(e) {
    var player = document.querySelector('#playerContainer');
    player.classList.remove('fullscreened');
    document.webkitExitFullscreen();
}


function hideFileArea() {
    var dropArea = document.querySelector('#dropArea');
    dropArea.classList.add('hidden');

    setTimeout(
        function () {
            var dropArea = document.querySelector('#dropArea');
            dropArea.classList.add('hide');
        },
        500
    );
}

function showFileArea() {
    var dropArea = document.querySelector('#dropArea');
    dropArea.classList.remove('hide');

    setTimeout(
        function () {
            var dropArea = document.querySelector('#dropArea');
            dropArea.classList.remove('hidden');
        },
        10
    );
}

function paused(e) {
    var player = document.querySelector('#playerContainer');

    document.querySelector('#pause').classList.add('hide');
    document.querySelector('#play').classList.remove('hide');
    player.classList.add('paused');
    //showFileArea();
}

function ended(e) {
    nextVideo();
}

function makeDroppable(e) {
    e.preventDefault();
    e.target.classList.add('droppableArea');
};

function makeUnDroppable(e) {
    e.preventDefault();
    e.target.classList.remove('droppableArea');
};

function loadVideo(e) {
    e.preventDefault();
    var files = [];
    if (e.dataTransfer) {
        files = e.dataTransfer.files;
    } else if (e.target.files) {
        files = e.target.files;
    } else {
        files = [
            {
                type: 'video',
                path: e.target.value
            }
        ];
    }

    //@ToDo handle playlist
    /*for (var i = 0; i < files.length; i++) {
        console.log(files[i]);
        if (files[i].type.indexOf('video') > -1) {
            var video = document.querySelector('video');
            video.src = files[i].path;
            setTimeout(
                function () {
                    document.querySelector('.dropArea').classList.remove('droppableArea');
                    document.querySelector('.play:not(.hide),.pause:not(.hide)').click();
                },
                250
            );
        }
    };*/
    for (var i = 0; i < files.length; i++) {
        playlist.video.push(files[i]);
    }
    document.querySelector('.dropArea').classList.remove('droppableArea');
    playVideo(playlist.video[playlist.index]);
};

function nextVideo() {
    var player = document.querySelector('#playerContainer');
    var video = document.querySelector('#videoContainer');

    video.pause();
    playlist.index = (playlist.index < playlist.video.length) ? playlist.index + 1 : playlist.index;
    if (playlist.index < playlist.video.length) {
        playVideo(playlist.video[playlist.index]);
    }
    else {
        console.log("-> Displaying <-");
        document.querySelector('#play').classList.remove('hide');
        document.querySelector('#pause').classList.add('hide');
        player.classList.add('paused');
        showFileArea();
    }
}

function previousVideo() {
    var video = document.querySelector('#videoContainer');

    video.pause();
    console.log(playlist.index);
    if (playlist.index > 0)
        playlist.index--;
    console.log("--> " + playlist.index);
    if (playlist.index < playlist.video.length)
        playVideo(playlist.video[playlist.index]);
}

function playVideo(file) {
    var video = document.querySelector('video');

    console.log("Playing : ");
    console.log(file);
    video.src = file.path;
    video.load();
    document.querySelector('.play,.pause').click();
}

function videoError(message) {
    var err = document.querySelector('#error');
    err.querySelector('h1').innerHTML = message;
    err.classList.remove('hide')

    setTimeout(
        function () {
            document.querySelector('#error').classList.remove('hidden');
        },
        10
    );
}

function closeError() {
    document.querySelector('#error').classList.add('hidden');
    setTimeout(
        function () {
            document.querySelector('#error').classList.add('hide');
        },
        300
    );
}

function playerClicked(e) {
    if (!e.target.id || e.target.id == 'controlContainer' || e.target.id == 'dropArea') {
        return;
    }

    var video = document.querySelector('#videoContainer');
    var player = document.querySelector('#playerContainer');

    switch (e.target.id) {
        case 'video' :
            togglePlay();
            break;
        case 'play' :
            console.log("PLAYING VIDEO");
            if (!video.videoWidth) {
                console.log("UNSTABLE ERROR");
                //videoError('Error Playing Video');
                //return;
            }
            video.play();
            break;
        case 'pause' :
            video.pause();
            break;
        case 'volume' :
            document.querySelector('#volRange').classList.toggle('hidden');
            break;
        case 'mute' :
            video.muted = (video.muted) ? false : true;
            player.classList.toggle('muted');
            break;
        case 'volRange' :
            //do nothing for now
            break;
        case 'fullscreen' :
            fullscreened();
            break;
        case 'smallscreen' :
            smallscreened();
            break;
        case 'prog' :
            video.currentTime = ((e.offsetX) / e.target.offsetWidth) * video.duration;
            break;
        case 'close' :
            window.close();
            break;
        case 'fileChooser' :
            document.querySelector('#chooseVideo').click();
            break;
        case 'enterLink' :
            //do nothing for now
            break;
        case 'error' :
        case 'errorMessage' :
            closeError();
            break;
        default :
            console.log('stop half assing shit.');
    }
}

