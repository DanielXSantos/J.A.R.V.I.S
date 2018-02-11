var watson = require('watson-developer-cloud');

var conversation = new watson.ConversationV1({
    username: '15ae9deb-d52b-4c52-ab9b-f7512fbba51e',
    password: 'NsAQJhzffYzx',
    version_date: '2017-05-26'
});

var lastIntent;
var workspace_id = 'cc519ec6-2292-4ccc-bd9a-988d6248f5d1';
var context = {};

module.exports.reconhecimento = function (application, req, res) {
    var body = req.body;
    var name = body['name'];

    var text = "Olah " + name + ", eu sou a Skainet. Seja bem vindo";
    application.app.controllers.jarvis.speak(text);
    res.send('200 OK');
}

module.exports.conversation = function (application, req, res) {

    var body = req.body;
    var message = body['response'];
    console.log(message);

    if (!("conversation_id" in context)) {
        conversation.message({
            workspace_id: workspace_id,
            input: {'text': message}
        }, function (err, response) {
            if (err)
                console.log('error:', err);
            else {
                console.log(JSON.stringify(response, null, 2));
                process(response, application, req, res);
            }
        });
    }
    else {
        conversation.message({
            workspace_id: workspace_id,
            input: {'text': message},
            context: context
        }, function (err, response) {
            if (err)
                console.log('error:', err);
            else {
                console.log(JSON.stringify(response, null, 2));
                process(response, application, req, res);
            }
        });
    }
}

function process(input, application, req, res) {
    if(!("naoEntendi" in input['context']))
        context = input['context'];

    if(input['output']['text'].length > 0)
        application.app.controllers.jarvis.speak(input['output']['text'][0]);
    jarvis(input, application, req, res);

    res.json({'response': 'cool'});
}

function jarvis(input, application, req, res){
    if(input['intents'].length > 0 && input['intents'][0]['confidence'] < 0.7)
        input['intents'] = [];

    if (lastIntent === "tocarMusica") {
        if (input['intents'].length > 0 &&
            input['intents'][0]['intent'] === "pararMusica" &&
            input['context']['stop'] == true) {
            application.app.controllers.jarvis.pararMusica();
            return;
        }
        application.app.controllers.jarvis.configMusica(input);
    }

    if (input['intents'].length > 0){

        var intent = input['intents'][0]['intent'];

        if(intent === 'oQueE'){
            application.app.controllers.jarvis.searchWiki(input);
        }

        lastIntent = intent;
    }
}