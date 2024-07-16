const controllerCommand = require('./controllerCommands');
const middlewareCommand = require('./middlewareCommands');
const projectCommands = require('./projectCommands');

const commands = {
    "controller": controllerCommand,
    "middleware": middlewareCommand,
    "init": projectCommands.initializeProject,
    "run": projectCommands.runProject
};

function executeCommand(cmdType, cmd, cmdInputs){
    if(! cmdType in commands){
        console.log("Command not found. Here are the available commands");
        for (const key in commands) {
            console.log(`:${key} | `);
        }

        return;
    }

    commands[cmdType](cmd, cmdInputs);
}

module.exports = executeCommand;