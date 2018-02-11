var ytdl = require('ytdl-core');
var fs = require('fs');
var ffmpeg = require('fluent-ffmpeg');
var lame = require('lame');
var Speaker = require('speaker');
var SoundPlayer = require('soundplayer');
var fs = require('fs');
var watson = require('watson-developer-cloud');
var YouTube = require('youtube-node');

var youTube = new YouTube();
var player = new SoundPlayer();
var lastEntity;
var stream;
var musicaTocando = false;

youTube.setKey('AIzaSyC5NNONZMPnkrdvvCWJ9ordrYcybEK16mo');

//Brainstorm IOT 3
var text_to_speech = new watson.TextToSpeechV1({
    username: '30ccabff-00cc-404a-a60a-5e11fe375001',
    password: 'Iuf2vEYMNPp0'
});

module.exports.configMusica = function (input) {

    if (input['entities'].length > 0) {
        entity = input['entities'][0]['entity'];

        if (entity === "podeEscolher") {
            module.exports.tocarMusica("5Wiio4KoGe8");
        }

        lastEntity = entity;
        return;
    }

    if (lastEntity === "naoPodeEscolher") {
        text = input['context']['musica'];
        delete input['context']['musica'];

        youTube.search(text, 5, function (error, result) {
            if (error) {
                console.log(error);
            }
            else {
                //console.log(JSON.stringify(result, null, 2));
                var id = result['items'][0]['id']['videoId'];
                module.exports.tocarMusica(id);
                lastEntity = "";
            }
        });
    }
}

module.exports.speak = function (message) {
    console.log(message);
    var params = {
        text: message,
        voice: 'pt-BR_IsabelaVoice', // Optional voice
        accept: 'audio/wav'
    };

    text_to_speech
        .synthesize(params, function (err, audio) {
            if (err) {
                console.log(err);
                return;
            }
            text_to_speech.repairWavHeader(audio);
            fs.writeFileSync('audio.wav', audio);

            player.sound('audio.wav', function () {
                //console.log("Skynet esta falando");
            });
        });
}

module.exports.tocarMusica = function (id) {
    var url = 'http://youtube.com/watch?v=' + id;

    var dl = ytdl(url, {
        filter: function (format) {
            return format.container === 'mp4';
        }
    });
    stream = ffmpeg(dl).format('mp3').pipe(new lame.Decoder())
        .on('format', function (format) {
            this.pipe(new Speaker(format));
            musicaTocando = true;
        });
}

module.exports.pararMusica = function () {
    if (musicaTocando) {
        stream.end();
        musicaTocando = false;
    }
}

