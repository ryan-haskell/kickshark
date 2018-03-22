const path = require('path')
const fs = require('fs')
const express = require('express')
const morgan = require('morgan')
const bodyParser = require('body-parser')

const getFolders = (dir) => ({
  base: dir,
  api: path.join(dir, 'api'),
  pages: path.join(dir, 'pages'),
  public: path.join(dir, 'public')
})

const attempt = (thingToAttempt) =>
  new Promise((resolve, reject) => {
    try {
      const result = thingToAttempt()
      resolve(result)
    } catch (err) {
      const reason = undefined
      reject(reason)
    }
  })

const apiRouter = ({ api }) => (req, res, next) =>
  attempt(() => require(path.join(api, req.url)))
    .then(handler => handler(req))
    .then(data => res.json(data))
    .catch(reason => next(reason))

const apiNotFoundRouter = (req, res, next) =>
  res.status(404).json({
    message: 'API route not found.'
  })

const apiErrorRouter = (err, req, res, next) => {
  console.error('ERROR', err)
  res.status(500).json({
    message: typeof err === 'string'
      ? err
      : 'Something went wrong.'
  })
}

const getAllFilesInFolder = (dir) => {
  let results = []

  fs.readdirSync(dir).forEach((file) => {
    file = path.join(dir, file)
    var stat = fs.statSync(file)

    if (stat && stat.isDirectory()) {
      results = results.concat(getAllFilesInFolder(file))
    } else {
      results.push(file)
    }
  })

  return results
}

const getRelativePath = (dir, file) =>
  file.substring(dir.length)
    .split('index.pug').join('')
    .split('.pug').join('')

const getFilepathForData = ({ api, pages }, file) =>
  path.join(api, 'pages', getRelativePath(pages, file))

const getData = ({ api, pages }, file, req) =>
  attempt(() => require(getFilepathForData({ api, pages }, file)))
    .then(handler => handler(req))

const toRoute = (dir, file) =>
  getRelativePath(dir, file)
    .split('/_').join('/:')

const setupPageRoutes = (app, { base, api, pages }, pugOptions) =>
  getAllFilesInFolder(pages)
    .map(file => ({
      route: toRoute(pages, file),
      file
    }))
    .map(({ file, route }) => {
      app.get(route, (req, res, next) => {
        getData({ api, pages }, file, req)
          .catch(reason => {
            if (reason === undefined) {
              console.warn('KICKSHARK - WARN No api endpoint for:', req.url)
              return {}
            } else {
              return Promise.reject(reason)
            }
          })
          .then(data => res.render(file, {
            ...data,
            ...pugOptions
          }))
          .catch(reason => next(reason))
      })
      return { file, route }
    })

const getPathWithRoute = (pages, route) =>
  pages.map(page => page.route === route
    ? page.file
    : undefined
  ).filter(a => a)[0]

const notFoundRouter = ({ pages, pugOptions }) => (req, res, next) => {
  const page = getPathWithRoute(pages, '/404')
  return page !== undefined
    ? res.render(page, pugOptions)
    : res.status(404).json('page not found')
}

const errorRouter = ({ pages, pugOptions }) => (err, req, res, next) => {
  console.error('KICKSHARK - ERROR', err)
  const page = getPathWithRoute(pages, '/500')
  return page !== undefined
    ? res.render(page, pugOptions)
    : res.status(500).json(err)
}

const start = ({
  dir = __dirname,
  port = (process.env.PORT || 3000),
  name = 'Kickshark',
  pug
} = {}) => {
  const folders = getFolders(dir)
  const app = express()
  const pugOptions = pug || {
    basedir: folders.base,
    pretty: process.env.NODE_ENV !== 'production'
  }

  // Set pug stuff
  app.set('view engine', 'pug')

  // Log requests
  app.use(morgan('tiny'))

  // Support POST request body
  app.use(bodyParser.json())

  // Serve static assets
  app.use('/public', express.static(folders.public))

  // Handle API routes
  app.use('/api', apiRouter(folders))
  app.use('/api', apiNotFoundRouter)
  app.use('/api', apiErrorRouter)

  // Handle pages
  // app.use(pageRouter(folders))
  const pages = setupPageRoutes(app, folders, pugOptions)

  // Handle 404 & 500 errors
  app.use(notFoundRouter({ pages, pugOptions }))
  app.use(errorRouter({ pages, pugOptions }))

  // Start server
  app.listen(port, () =>
    console.info(`\n${name} ready at: http://localhost:${port}\n`)
  )
}

module.exports = {
  start
}
