#!/usr/bin/env node

/**
 * motions-ask
 * The command line tool of Motions PHP
 *
 * @author Nisala Develigoda <null>
 */

const init = require('./utils/init');
const meow = require('meow');
const chalk = require('chalk');
const executeCommand = require('./src/commands/commands');

const cli = meow(`
    Usage
      $ mo-ask <command> [options]

    Commands
      ${chalk.yellow('help')}          Show help
      ${chalk.yellow('<cmdType>')}      Execute a command type

    Options
      ${chalk.blue('--clear, -c')}   Clear the console
      ${chalk.blue('--debug, -d')}   Enable debug mode

    Examples
      $ mo-ask help
      $ mo-ask myCommandType:myCommand
`, {
    flags: {
        clear: {
            type: 'boolean',
            alias: 'c'
        },
        debug: {
            type: 'boolean',
            alias: 'd'
        }
    }
});

const input = cli.input;
const flags = cli.flags;
const { clear, debug } = flags;

(async () => {
	
	if(input.length <= 0 || input.includes(`help`)) {
		init({ clear });
		input.includes(`help`) && cli.showHelp(0);
		return;
	}

	const commandString = input[0];
	const result = commandString.match(/(?<cmdType>[a-zA-Z]+)(:(?<cmd>[a-zA-Z]+))?/);

	if(result == null) return;
	let {groups : {cmdType, cmd}} = result;
	cmd = cmd || input[1];

	if(cmdType === undefined) return;

	executeCommand(cmdType, cmd, input);
})();
