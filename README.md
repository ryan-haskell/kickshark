# Kickshark
> Create frontend templates with Express and Pug.


### Try it out

1. Install `kickshark` as a dependency:

```
npm install -S kickshark
```

2. Create an `app.js` in your project:

```js
const kickshark = require('kickshark')

kickshark.start({
  name: 'Your Project',
  dir: __dirname
})
```

3. Run `node app.js` and check out `http://localhost:3000`

---

### Project Overview
> Check out a full example in the `example/` folder!

To get up and running, just create the following folder structure:

Folder | Description
--- | ---
`api/` | All API endpoints, with auto-generated routes.
`layouts/` | Where to put any layout files.
`mixins/` | Where to put any pug mixins.
`pages/` | All your pages.
`public/` | Static content for `/public` requests.

For `api/` and `pages/`, we use the [NuxtJS route naming convention](https://nuxtjs.org/guide/routing) to __automatically generate__ your express routes.

If you follow this convention, your pages and API endpoints will already be hooked up for you!

---

### Documentation

#### `kickshark.start(config)`

__Parameters__

- `config.dir` - The root directory of your project (Default: `__dirname`)

- `config.name` - Display name (Default: `"Kickshark"`)

- `config.port` - Port to run the server on (Default: `process.env.PORT || 3000`)

- `config.pug` - [Options](https://pugjs.org/api/reference.html#options) for Pug (Default: `{ basedir: config.dir, pretty: process.env.NODE_ENV !== 'production' }`)

__Example__

```js
const kickshark = require('kickshark')

kickshark.start({
  dir: __dirname,
  name: 'My Site',
  port: 5000
})
```
