## slack-user-presence-notifier

[![npm version](https://badge.fury.io/js/slack-user-presence-notifier.svg)](https://badge.fury.io/js/slack-user-presence-notifier)

Display desktop notifications when a user goes online/offline

<img src="https://cl.ly/hGKP/Screen%20Shot%202016-08-25%20at%2011.13.54%20PM.png" width="400">

<img src="https://cl.ly/hFuR/Screen%20Shot%202016-08-25%20at%2011.16.23%20PM.png" width="400">

<img src="https://cl.ly/hGTy/Screen%20Shot%202016-08-25%20at%2011.19.02%20PM.png" width="400">

## Install

```
npm install -g slack-user-presence-notifier
```

## Usage

You will need a token per slack team, grab one from here: https://api.slack.com/docs/oauth-test-tokens

Then type:

```
slack-user-presence-notifier --token YOUR_SLACK_TEST_TOKEN
```

Full arguments list:

```
--me     : Send notification when your presence changes (could be useful when network goes off/on).
--token  : Set your per team slack token, information on how to get a token
           can be found here (https://api.slack.com/docs/oauth-test-tokens).

--help   : to show this information.
```

## License

MIT
