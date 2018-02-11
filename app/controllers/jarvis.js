var watson = require('watson-developer-cloud');
var SoundPlayer = require('soundplayer');
var ffmpeg = require('fluent-ffmpeg');
var YouTube = require('youtube-node');
var Speaker = require('speaker');
var request = require('request');
var ytdl = require('ytdl-core');
var lame = require('lame');
var utf8 = require('utf8');
var fs = require('fs');

var player = new SoundPlayer();
var youTube = new YouTube();
var musicaTocando = false;
var lastEntity;
var stream;

youTube.setKey('AIzaSyC5NNONZMPnkrdvvCWJ9ordrYcybEK16mo');

//Brainstorm IOT 4
var text_to_speech = new watson.TextToSpeechV1({
    username: 'dd2da816-cb53-4db9-b31b-b480961cfece',
    password: '5AYj58DVpWhB'
});

module.exports.searchWiki = function (input) {
    var query = input['input']['text'].split(" ");

    if(query.length > 3){

        var textQuery = "";
        for(var i = 3; i < query.length; i++){
            textQuery = textQuery.concat(query[i]) + " ";
        }
        console.log(textQuery);

        request('https://pt.wikipedia.org/w/api.php?action=opensearch&lang=pt-br&search=' +
            textQuery + '&limit=1&namespace=0&format=json', {json: true}, function (err, res, body) {
            if (err) {
                return console.log(err);
            }

            var result = body[2][0];
            if(result != undefined){
                module.exports.speak(result);
            } else {
                module.exports.speak(utf8.decode("N\xc3\xa3o consegui encontrar nada sobre " + textQuery));
            }
        });
    } else{
        module.exports.speak(utf8.decode("N\xc3\xa3o sou vidente. Seja mais claro na sua pesquisa"));
    }
};

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
};

module.exports.pararMusica = function () {
    if (musicaTocando) {
        stream.end();
        musicaTocando = false;
    }
};

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
};