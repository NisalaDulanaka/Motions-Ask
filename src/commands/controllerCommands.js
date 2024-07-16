const fs = require('fs');
const ControllerTemplate = require('../templates/ControllerTemplates');

const commands = {
    "make": createController,
    "remove": removeController
}

function start(command, commandInputs){
    if(! Object.hasOwn(commands, command)){
        console.log("Unrecognized command for controller\nHere are the available commands");

        let commandsString = "";
        for (const key in commands) {
            commandsString += `controller:${key} | `;
        }

        console.log(commandsString);
        return;
    }

    commands[command](commandInputs[1]);
}

function createController(name){
    if(name == undefined){
        console.log("Please provide a name for the Controller");
        return;
    }

    const content = ControllerTemplate(name);

    // Create a fil with a controller sub class with the specified name
    fs.writeFile(`controllers/${name}.php`, content, 'utf8', (err) => {
        if (err) {
          console.error(err);
          console.log("Please make sure to only use Mo-Ask inside of a MOTIONS PHP project");
          return;
        }
        console.log('Controller created!');
    });      
}

function removeController(name){
    if(name == undefined){
        console.log("Please provide a Controller name to remove");
        return;
    }

    fs.unlink(`controllers/${name}.php`, (err) => {
        if (err) {
          console.error(err);
          console.log("Please make sure to only use Mo-Ask inside of a MOTIONS PHP project");
          return;
        }
        console.log('Controller removed!');
    });
}

module.exports = start;