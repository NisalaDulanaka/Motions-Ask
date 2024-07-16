const chalk = require('chalk');
const fs = require('fs');
const util = require('node:util');
const path = require('path');
const { spawn } = require('child_process');
const exec = util.promisify(require('node:child_process').exec);

async function initializeProject(projectName, input) {
    if (!projectName) {
        console.log("Please provide a project name");
        return;
    }
    const { default: ora } = await import('ora');
    const spinner = ora({
        text: "Initializing the project",
        color: "green"
    }).start();

    try{
        await createProject(projectName);
    }catch(error){
        spinner.stop();
        console.log(error);
        process.exit(1);
    }
    
    spinner.stop();
    console.log(`\n${chalk.green('Project initialized')}.\n\nRun \ncd ${projectName} \n\nthen \nmo-ask run to start the project`);
}

// Function to copy a file
const copyFile = (src, dest) => {
    fs.copyFileSync(src, dest);
};

// Function to copy a directory recursively
const copyDirectory = (src, dest) => {
    if (!fs.existsSync(dest)) {
        fs.mkdirSync(dest);
    }
    const entries = fs.readdirSync(src, { withFileTypes: true });
    entries.forEach(entry => {
        const srcPath = path.join(src, entry.name);
        const destPath = path.join(dest, entry.name);

        if (entry.isDirectory()) {
            copyDirectory(srcPath, destPath);
        } else {
            copyFile(srcPath, destPath);
        }
    });
};

// Function to create a new project
const createProject = async (projectName) => {
    const templateDir = path.resolve(__dirname, '../project_template');
    const projectDir = path.resolve(process.cwd(), projectName);

    if (fs.existsSync(projectDir)) {
        throw new Error(`Directory ${projectName} already exists.`);
    }

    copyDirectory(templateDir, projectDir);

    // Change directory to the new project
    process.chdir(projectDir);

    // Install dependencies
    try {
        const { stdout, stderr } = await exec('composer install');
        console.log('[output]:', stdout);
        console.log('[warning]:', chalk.yellow(stderr));
    } catch (error) {
        throw new Error(`Error installing dependencies: ${error.message}`);
    }
};

async function runProject(){
    const {executionProcess, host} = createProjectExecutionProcess();

    process.stdin.resume();
    process.stdin.setEncoding('utf-8');

    //Wait for the user to press enter
    console.log(`\nServer is running on (${chalk.yellow(`http://${host}`)})\nPress enter to stop the server.`);
    await new Promise(resolve => process.stdin.once('data', resolve));

    executionProcess.kill();
    process.stdin.destroy();
}

function createProjectExecutionProcess(){
    const host = 'localhost:3000';
    const process = spawn('php',['-S', host]);
    let firstOutPut = true;

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        if(firstOutPut){ firstOutPut = false; return; }

        console.log(chalk.green(data));
    });

    process.on('close', (code) => {
        console.log(`Server stopped${code? ' with the status ' + code: ''}`);
    });

    return {
        executionProcess : process,
        host
    };
}

module.exports = {
    initializeProject,
    runProject
}