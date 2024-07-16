const fs = require('fs-extra');
const readline = require('readline');
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

async function createController(name){
    if(name == undefined){
        console.log("Please provide a name for the Controller");
        return;
    }

    const content = ControllerTemplate(name);

    // Create a fil with a controller sub class with the specified name
    try{
        await fs.writeFile(`controllers/${name}.php`, content, 'utf8');
        await includeControllerInKernel(name);

        console.log(chalk.greenBright('Controller created!'));
    }catch(err){
        console.error(err);
        console.log("Please make sure to only use Mo-Ask inside of a MOTIONS PHP project");
    }  
}

async function includeControllerInKernel(name){
    const filePath = "bootstrap/kernel.php";
    const tempFilePath = "bootstrap/cfile.tmp";
    // Read the file contents
    const includeCommand = `include_once('./controllers/${name}.php');`;
    
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: fs.createWriteStream(tempFilePath),
        terminal: false
    });

    rl.on('line', (line) => {
        if (line.includes('Controller imports end')) {
            rl.output.write('\t' + includeCommand + '\n');
            rl.output.write(line + '\n');

        } else {
            rl.output.write(line + '\n');
        }
    });

    await new Promise((resolve) => rl.on('close', resolve));

    // Replace the original file with the modified temp file
    await fs.move(tempFilePath, filePath, { overwrite: true });
}

async function removeControllerInKernel(name){
    const filePath = "bootstrap/kernel.php";
    const tempFilePath = "bootstrap/cfile.tmp";
    // Read the file contents
    const includeCommand = `include_once('./controllers/${name}.php');`;
    
    const rl = readline.createInterface({
        input: fs.createReadStream(filePath),
        output: fs.createWriteStream(tempFilePath),
        terminal: false
    });

    rl.on('line', (line) => {
        if (! line.includes(includeCommand)) {
            rl.output.write(line + '\n');
        }
    });

    await new Promise((resolve) => rl.on('close', resolve));

    // Replace the original file with the modified temp file
    await fs.move(tempFilePath, filePath, { overwrite: true });
}

async function removeController(name){
    if(name == undefined){
        console.log("Please provide a Controller name to remove");
        return;
    }

    try{
        await fs.unlink(`controllers/${name}.php`);
        await removeControllerInKernel(name);

        console.log(chalk.greenBright('Controller removed!'));
    }catch(err){
        console.error(err);
        console.log("Please make sure to only use Mo-Ask inside of a MOTIONS PHP project"); 
    }
}

module.exports = start;