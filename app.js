var builder = require('botbuilder');
var restify = require('restify');

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
var bot = new builder.UniversalBot(connector, (session) => {
    session.send(`Oké ça fonctionne !! Longueur du message : ${session.message.text.length}`);

    bot.on('typing', (message) => {
        session.send(`Haha, t'es en train d'écrire`);
    });
});

// Send welcome when conversation with bot is started, by initiating the root dialog
bot.on('conversationUpdate', function (message) {
    if (!message.membersAdded) {
        return;
    }
    message.membersAdded.forEach(function (identity) {
        if (identity.id === message.address.bot.id) {
            // Build a message to send
            let msg = new builder.Message().address(message.address);
            msg.text('Welcome !!!');
            bot.send(msg); 
        }
    });

    console.log(message.text);
});


// WaterfallStep --> Position dans le dialogue