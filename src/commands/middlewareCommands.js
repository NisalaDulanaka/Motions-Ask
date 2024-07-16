const fs = require('fs');
const MiddlewareTemplate = require('../templates/MiddlewareTemplate');

const commands = {
    "make": createMiddleware,
    "remove": removeMiddleware
}

function start(command, commandInputs){
    if(! Object.hasOwn(commands, command)){
        console.log("Unrecognized command for middleware\nHere are the available commands");

        let commandsString = "";
        for (const key in commands) {
            commandsString += `middleware:${key} | `;
        }

        console.log(commandsString);
        return;
    }

    commands[command](commandInputs[1]);
}

function createMiddleware(name){
    if(name == undefined){
        console.log("Please provide a name for the Middleware");
        return;
    }

    const content = MiddlewareTemplate(name);

    // Create a fil with a controller sub class with the specified name
    fs.writeFile(`http/middleware/${name}.php`, content, 'utf8', (err) => {
        if (err) {
          console.error(err);
          console.log("Please make sure to only use Mo-Ask inside of a MOTIONS PHP project");
          return;
        }
        console.log('Middleware created!');
    });      
}

function removeMiddleware(name){
    if(name == undefined){
        console.log("Please provide a Middleware name to remove");
        return;
    }

    fs.unlink(`http/middleware/${name}.php`, (err) => {
        if (err) {
          console.error(err);
          console.log("Please make sure to only use Mo-Ask inside of a MOTIONS PHP project");
          return;
        }
        console.log('Middleware removed!');
    });
}

module.exports = start;