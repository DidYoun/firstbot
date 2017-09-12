var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();

const WAITING = "doheavywork"
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
    var message = session.message;
    // Calcul la taille du message de l'utilisateur
    session.send(`Oké ça fonctionne !! Longueur du message : ${message.text.length}`);
    // Action spécifique si on tape "doheavywork" 
    if (message.text === WAITING) {
        session.sendTyping();
        setTimeout(() => {
            session.send("Patience mon ami, patience");
        }, 10000);
    } 
    // Evenement quand l'utilisateur tape sur le clavier
    bot.on('typing', (message) => {
        session.send(`Haha, t'es en train d'écrire`);
    });
});

// Welcome message
bot.on('conversationUpdate', function (message) {
    // Si la conversation ne contient aucune personnes
    if (!message.membersAdded) {
        return;
    }
    // Boucle sur chaque personne de la conf
    message.membersAdded.forEach(function (identity) {
        // Si le membre est le bot
        if (identity.id === message.address.bot.id) {
            // Build a message to send
            let msg = new builder.Message().address(message.address);
            msg.text('Welcome !!!');
            bot.send(msg); 
        }
    });
});


// WaterfallStep --> Position dans le dialogue