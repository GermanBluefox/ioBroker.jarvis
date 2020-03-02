'use strict';
const adapterName = require('./io-package.json').common.name;
const utils = require('@iobroker/adapter-core'); // Get common adapter utils


/*
 * internal libraries
 */
const Library = require('./lib/library.js');


/*
 * variables initiation
 */
let adapter;
let library;
let unloaded;
let NOTIFICATIONS = {};


/*
 * ADAPTER
 *
 */
function startAdapter(options)
{
	options = options || {};
	adapter = new utils.Adapter({ ...options, name: adapterName });

	/*
	 * ADAPTER READY
	 *
	 */
	adapter.on('ready', function()
	{
		unloaded = false;
		library = new Library(adapter);

		// Check Node.js Version
		let version = parseInt(process.version.substr(1, process.version.indexOf('.')-1));
		if (version <= 6)
			return library.terminate('This Adapter is not compatible with your Node.js Version ' + process.version + ' (must be >= Node.js v7).', true);

		// all ok
		library.set(Library.CONNECTION, true);

		// listen for new notifications to add
		adapter.subscribeStates('addNotification');
	});

	/*
	 * STATE CHANGE
	 *
	 */
	adapter.on('stateChange', function(id, state)
	{
		adapter.log.debug('State ' + id + ' has changed: ' + JSON.stringify(state));

	});

	/*
	 * HANDLE MESSAGES
	 *
	 */
	adapter.on('message', function(msg)
	{
		adapter.log.debug('Message: ' + JSON.stringify(msg));

	});

	/*
	 * ADAPTER UNLOAD
	 *
	 */
	adapter.on('unload', function(callback)
	{
		try
		{
			adapter.log.info('Adapter stopped und unloaded.');

			unloaded = true;
			library.resetStates();

			callback();
		}
		catch(e)
		{
			callback();
		}
	});

	return adapter;
};


/*
 * COMPACT MODE
 * If started as allInOne/compact mode => return function to create instance
 *
 */
if (module && module.parent)
	module.exports = startAdapter;
else
	startAdapter(); // or start the instance directly
