#! /usr/bin/env node

var { RTMClient, WebClient } = require('@slack/client');
var MemoryDataStore = require('@slack/client').MemoryDataStore;

var RTM_EVENTS = require('@slack/client').RTM_EVENTS;
var CLIENT_EVENTS = require('@slack/client').CLIENT_EVENTS;

var notifier = require('node-notifier');
var path = require('path');
var moment = require('moment');
var chalk = require('chalk');
var minimist = require('minimist');
var XMLHttpRequest = require("xmlhttprequest").XMLHttpRequest;

var argv = minimist(process.argv.slice(2));

var CONFIG = {
  SHOW_ME: false,
  SHOW_CUST: false,
  TOKEN: '',
  MY_USERNAME: null,
  CUSTOM_USER: null,
};

if (argv.help || argv.h || argv.usage) {
  const usage = `
  --me     : Send notification when your presence changes (could be useful when network goes off/on).
  --token  : Set your per team slack token, information on how to get a token
             can be found here (https://api.slack.com/docs/oauth-test-tokens).
  --cust   : Custom user name
  
  --help   : to show this information.
  `;
  console.log(usage);
}

if (argv.token && argv.token !== '') {
  CONFIG.TOKEN = argv.token;
}

if (argv.me) {
  CONFIG.SHOW_ME = true;
}

if(argv.cust) {
  CONFIG.CUSTOM_USER = argv.cust;
  CONFIG.SHOW_CUST = true;
  console.info('Custom User: ' + argv.cust);
}

function getUsers(token) {
  var xmlHttp = new XMLHttpRequest();
  xmlHttp.open("GET", "https://slack.com/api/users.list?token=" + token + "&limit=1000", false);
  xmlHttp.send(null);
  var users = JSON.parse(xmlHttp.responseText);

  console.log(users.members.length + " users found");
  return users;
}

function createRTM(token) {
  var rtm = new RTMClient(token);//, { logLevel: 'error', dataStore: new MemoryDataStore() });
  var web = new WebClient(token);
  rtm.start();

  web.users.list().then((res) => {
    var users = res;
    var userIds = users.members.map(user => user.id);
    var userMap = users.members.reduce(function (map, user) {
      map[user.id] = user;
      return map;
    }, {});
    //console.log(users);
    //console.log(users.members.length + " users found");

    //var userIds = users.members.map(user => user.id);
    //console.log(users);
    rtm.subscribePresence(userIds);

    rtm.on('authenticated', function (rtmStartData) {
      CONFIG.MY_USERNAME = rtmStartData.self.name;
      console.info('- ', chalk.blue(moment().format('LLLL'), ' Logged in as', CONFIG.MY_USERNAME, '\n\n'));
    });

    rtm.on('presence_change', function (data) {
      //console.log(data);
      var status = {'active': 'online', 'away': 'offline'};
      var user = userMap[data.user];// = rtm.dataStore.getUserById(data.user);

      if (user.name === CONFIG.MY_USERNAME && CONFIG.SHOW_ME) {
        user.name = 'You';
      }

      var activity = {presence: data.presence, username: user.name};
      var notification = {
        'title': 'Slack',
        'message': activity.username[0].toUpperCase() + activity.username.substr(1) + ' just went ' + status[activity.presence],
        'sound': true,
        'icon': path.join(__dirname, 'slack.png'),
      };

      var log = `{ ${chalk.bold.green('user')}: '${activity.username}', ${chalk.bold.green('presence')}: '${activity.presence}' }`;
      var time;

      if (activity.presence === 'away') {
        time = moment().subtract(30, 'minutes');
      } else {
        time = moment();
      }

      if (!CONFIG.SHOW_CUST) {
        if (activity.username !== CONFIG.MY_USERNAME || activity.username === CONFIG.MY_USERNAME && CONFIG.SHOW_ME) {
          notifier.notify(notification);
        }

        console.info('- ', chalk.blue(time.format('LLLL')), chalk.bold(' PRESENCE_CHANGE:'), log);
      } else if (activity.username === CONFIG.CUSTOM_USER) {
        notifier.notify(notification);

        console.info('- ', chalk.blue(time.format('LLLL')), chalk.bold(' PRESENCE_CHANGE:'), log);
      }
    });
  });
}

// Invoke this function with a token for each slack team
// Grab the token from here : https://api.slack.com/docs/oauth-test-tokens
if (!CONFIG.TOKEN || CONFIG.TOKEN === '') {
  console.log('Error: Missing token');
  process.exit();
};

createRTM(CONFIG.TOKEN);
