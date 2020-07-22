# node-proxy-settings-manager

Allows you to manage proxy settings according to your os.

**Currently supported:**

- Linux
  - Gnome
- Windows

## Install

```bash
npm i proxy-settings-manager
```

## Use

```js
const proxy = require('proxy-settings-manager');

const proxyUrl = 'http://locahost:5050';

await proxy.setHttp(proxyUrl);
await proxy.setHttps(proxyUrl);
```

*Depending on your platform you may need to logout before changes take place*

## Methods

### setHttp(url) : Promise

Set the http proxy url to use.

### setHttps(url) : Promise

Set the https proxy url to use.

### remove() : Promise

Remove the currently defined http and https proxies.