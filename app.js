var builder = require('botbuilder');
var restify = require('restify');
var cognitiveServices = require('botbuilder-cognitiveservices');

var server = restify.createServer();

// Environnement serveur par défaut ou constante
// Init serveur
server.listen(process.env.port || 3978,  () => {
    console.log(`Le serveur : ${server.name} | et url : ${server.url}`);
});

// Init connector between bot and botbuilder
var connector = new builder.ChatConnector({
    appId : process.env.APP_ID,
    appPassword: process.env.APP_PASSWORD 
});

// Ouvre les endpoints
server.post('/api/messages', connector.listen());

// Init le bot
var bot = new builder.UniversalBot(connector);
var qnaMakerRecognizer = new cognitiveServices.QnAMakerRecognizer({
    knowledgeBaseId: '888d4565-a8be-4aff-be0d-087d82d3b04f',
    subscriptionKey: 'e99733a9436e4469968f53347333d670'
});
var qnaMakerDialog = new cognitiveServices.QnAMakerDialog({
    recognizers: [qnaMakerRecognizer],
    qnaThreshold: 0.4,
    defaultMessage: 'Allez prendre un verre'
});
// Initialisation de LUIS
var luisEndpoint =
'https://westus.api.cognitive.microsoft.com/luis/v2.0/apps/35aa771f-ce0f-47b4-aa6f-dab385a8e620?subscription-key=7079e6989b494df4988560a8470cc3a9&spellCheck=true&verbose=true&timezoneOffset=0'
var luisRecognizer = new builder.LuisRecognizer(luisEndpoint)
bot.recognizer(luisRecognizer)
// Développement du bot
bot.dialog('/', qnaMakerDialog);
bot.dialog('HomePilot', function (session, args, next) {
    var intent = args.intent
    var DEFAULT_OBJECT = {
      entity: 'Not found',
      score: 0
    }
    var device = builder.EntityRecognizer.findEntity(intent.entities, 'HomeAutomation.Device') || DEFAULT_OBJECT
    var operation = builder.EntityRecognizer.findEntity(intent.entities, 'HomeAutomation.Operation') || DEFAULT_OBJECT
    var room = builder.EntityRecognizer.findEntity(intent.entities, 'HomeAutomation.Room') || DEFAULT_OBJECT
    var data = `
      Main intent : ${intent.intent} \n
      Device : ${device.entity} ${device.score}
      Operation : ${operation.entity} ${operation.score}
      Room : ${room.entity} ${room.score}`;

    session.endDialog(data);
});
bot.triggerAction({
  matches: 'HomeAutomation.TurnOn'
});