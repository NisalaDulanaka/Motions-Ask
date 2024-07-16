const chalk = require('chalk');
const fs = require('fs');
const fsExtra = require('fs-extra');
const axios = require('axios');
const unzipper = require('unzipper');
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

    try {
        await createProject(projectName);
    } catch (error) {
        spinner.stop();
        console.log(error);
        process.exit(1);
    }

    spinner.stop();
    console.log(`\n${chalk.green('Project initialized')}.\n\nRun \ncd ${projectName} \n\nthen \nmo-ask run to start the project`);
}

// Function to copy a file
const copyFiles = async (src, dest) => {
    await fsExtra.copy(src, dest);
};

const downloadRepo = async () => {
    const url = 'https://github.com/NisalaDulanaka/Motions-PHP/archive/refs/heads/main.zip'; // Replace with your GitHub repository URL
    const outputPath = path.resolve(__dirname, 'repo.zip');

    const response = await axios({
        url,
        method: 'GET',
        responseType: 'stream'
    });

    response.data.pipe(fs.createWriteStream(outputPath));

    return new Promise((resolve, reject) => {
        response.data.on('end', () => {
            resolve(outputPath);
        });

        response.data.on('error', reject);
    });
};

const extractZip = async (zipPath, extractTo) => {
    await fs.createReadStream(zipPath)
        .pipe(unzipper.Extract({ path: extractTo }))
        .promise();
};

// Function to create a new project
const createProject = async (projectName) => {
    const templateDir = path.resolve(__dirname, '../project_template');
    const projectDir = path.resolve(process.cwd(), projectName);

    if (fs.existsSync(projectDir)) {
        throw new Error(`Directory ${projectName} already exists.`);
    }

    //download the repo
    const zipPath = await downloadRepo();

    const extractTo = path.resolve(__dirname, 'temp'); // Temporary folder for extraction
    await extractZip(zipPath, extractTo);

    const src = path.resolve(extractTo, 'Motions-PHP-main'); // Adjust this path based on the repository structure
    await copyFiles(src, projectDir);

    // Clean up
    fsExtra.removeSync(zipPath);
    fsExtra.removeSync(extractTo);

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

async function runProject() {
    const { executionProcess, host } = createProjectExecutionProcess();

    process.stdin.resume();
    process.stdin.setEncoding('utf-8');

    //Wait for the user to press enter
    console.log(`\nServer is running on (${chalk.yellow(`http://${host}`)})\nPress enter to stop the server.`);
    await new Promise(resolve => process.stdin.once('data', resolve));

    executionProcess.kill();
    process.stdin.destroy();
}

function createProjectExecutionProcess() {
    const host = 'localhost:3000';
    const process = spawn('php', ['-S', host]);
    let firstOutPut = true;

    process.stdout.on('data', (data) => {
        console.log(`stdout: ${data}`);
    });

    process.stderr.on('data', (data) => {
        if (firstOutPut) { firstOutPut = false; return; }

        console.log(chalk.green(data));
    });

    process.on('close', (code) => {
        console.log(`Server stopped${code ? ' with the status ' + code : ''}`);
    });

    return {
        executionProcess: process,
        host
    };
}

module.exports = {
    initializeProject,
    runProject
}