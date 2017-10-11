var builder = require('botbuilder');
var restify = require('restify');

var server = restify.createServer();

/** @var JSON menuItems */
var menuItems = {
    "Se faire saluer" : {
        item: "greetings"
    },
    "Faire une réservation" : {
        item: "reservation" 
    }
};

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
var bot = new builder.UniversalBot(connector, [
    (session) => {
        session.send('Welcome to Hotel ESGI.');
        session.beginDialog('showMenu');
    }, 
    (session, response) => {
        session.beginDialog('showMenu');
    }
]);

// Affichage du menu
bot.dialog('showMenu', [
    (session, args) => {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Cette option est inexistante, veuillez réessayer");
        } else {
            builder.Prompts.choice(session, "Votre option:", menuItems);        
        }
    },
    (session, results) => {
        if (!results.response) {
            return;
        }
        var indexResult = results.response.entity;
        var dialogKey = menuItems[indexResult].item;
        if (!menuItems[indexResult] || typeof menuItems[indexResult]  === "undefined") {
            session.replaceDialog('showMenu', { reprompt: true });
        } else {
            session.beginDialog(dialogKey);        
        }
    }
]).triggerAction({
    matches: /^(help)$/i
});

// Init les triggers d'évènements
bot.dialog('help', function (session, args, next) {
    console.log('help');
});
bot.dialog('reload', function (session, args, next) {
    console.log('reload');
});
bot.dialog('back', function (session, args, next) {
    console.log('back');
});

// Partie salutations
bot.dialog('greetings', [
    (session) => {
        session.beginDialog('askName');
    },
    (session, results) => {
        session.endDialog(`Bien le bonjour ${results.response} !`);
    }
]);
bot.dialog('askName', [
    (session) => {
        builder.Prompts.text(session, 'Quel votre prénom mon brave ?');
    },
    (session, results) => {    
        session.endDialogWithResult(results);
    }
]);
// Partie réservation
bot.dialog('reservation', [
    function (session) {
        session.beginDialog('buildUserData');
    },
    function (session, results) {
        session.endDialog( `Bonjour ${results.name}, \n\n
        vous avez effectué une réservation pour le ${results.date} et pour ${results.person} personnes.
        \n
        Nous resterons en contact avec vous grâce à votre n° de téléphone : ${results.phone}
        `);
    }
])
.reloadAction('startOver', 'Ok, starting over.', {
    matches: /^start over$/i
})
.triggerAction({
    matches: /^back$/i,
    onSelectAction: (session, args, next) => {
        console.log('back');
    }
});

bot.dialog('buildUserData', [ 
    (session) => {
        session.beginDialog('askDate');
    },
    (session) => {
        session.beginDialog('askDeliveryName');
    },
    (session) => {
        session.beginDialog('askMobilePhone');
    },
    (session) => {
        session.beginDialog('askNbReservations');
    },
    (session) => {
        session.endDialogWithResult(session.userData);
    }
]);
bot.dialog('askDate', [
    (session) => {
        builder.Prompts.text(session, 'A quelle date souhaitez-vous faire la réservation?');
    },
    (session, results) => {    
        session.userData.date = results.response;
        session.endDialog('Merci');
    }
]);
bot.dialog('askDeliveryName', [
    (session) => {
        builder.Prompts.text(session, 'A quel nom?');
    },
    (session, results) => {    
        session.userData.name = results.response;
        session.endDialog('Merci');
    }
])
bot.dialog('askMobilePhone', [
    (session, args) => {
        if (args && args.reprompt) {
            builder.Prompts.text(session, "Le numéro de téléphone n'est pas valide");
        } else {
            builder.Prompts.text(session, 'Quel est votre numéro?');
        }
    }, 
    (session, results) => {
        var matched = results.response.match(/\d+/g);
        var number = matched ? matched.join('') : '';
        if (number.length === 10 || number.length === 11) {
            session.userData.phone = results.response;
            session.endDialog('Merci');
        } else {
            session.replaceDialog('askMobilePhone', { reprompt: true });
        }
    }
]);
bot.dialog('askNbReservations', [
    (session) => {
        builder.Prompts.text(session, 'Nb de personnes?');
    },
    (session, results) => {    
        session.userData.person = results.response;
        session.endDialog("Ok");
    }
]);