module.exports = function (application) {
    application.post('/api/conversation', function (req, res) {
        application.app.controllers.index.conversation(application, req, res);
    });

    application.post('/api/reconhecimento', function (req, res) {
        application.app.controllers.index.reconhecimento(application, req, res);
    });
}