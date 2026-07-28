#!/usr/bin/env node

// Adapted from https://github.com/hashicorp/next-remote-watch
// A copy of next-remote-watch with an additional ws reload emitter.
// The app listens to the event and triggers a client-side router refresh
// see components/ClientReload.js

const chalk = require('chalk')
const chokidar = require('chokidar')
const http = require('http')
const SocketIO = require('socket.io')
const express = require('express')
const spawn = require('child_process').spawn
const next = require('next')
const path = require('path')
const { parse } = require('url')

const pkg = require('../package.json')

const defaultWatchEvent = 'change'
const args = process.argv.slice(2)
const program = {
  args: [],
  root: undefined,
  script: false,
  command: false,
  event: defaultWatchEvent,
  polling: false,
}

for (let index = 0; index < args.length; index += 1) {
  const arg = args[index]

  if (arg === '-r' || arg === '--root') {
    program.root = args[index + 1]
    index += 1
  } else if (arg === '-s' || arg === '--script') {
    program.script = args[index + 1] || false
    index += 1
  } else if (arg === '-c' || arg === '--command') {
    program.command = args[index + 1] || false
    index += 1
  } else if (arg === '-e' || arg === '--event') {
    program.event = args[index + 1] || defaultWatchEvent
    index += 1
  } else if (arg === '-p' || arg === '--polling') {
    program.polling = true
  } else if (arg === '-h' || arg === '--help') {
    console.log('Usage: node ./scripts/next-remote-watch.js [options] [watch paths...]')
    console.log('  -r, --root [dir]        root directory of your nextjs app')
    console.log(
      '  -s, --script [path]     path to the script you want to trigger on a watcher event'
    )
    console.log('  -c, --command [cmd]     command to execute on a watcher event')
    console.log('  -e, --event [name]      name of event to watch')
    console.log('  -p, --polling           use polling for the watcher')
    process.exit(0)
  } else {
    program.args.push(arg)
  }
}

const shell = process.env.SHELL
const app = next({ dev: true, dir: program.root || process.cwd() })
const port = parseInt(process.env.PORT, 10) || 3000
const handle = app.getRequestHandler()

function sendHotReloadEvent(eventName) {
  try {
    if (app.server?.hotReloader?.send) {
      app.server.hotReloader.send(eventName)
    }
  } catch (error) {
    console.warn(`Hot reload event skipped: ${error.message}`)
  }
}

app.prepare().then(() => {
  // if directories are provided, watch them for changes and trigger reload
  if (program.args.length > 0) {
    chokidar
      .watch(program.args, { usePolling: Boolean(program.polling) })
      .on(
        program.event || defaultWatchEvent,
        async (filePathContext, eventContext = defaultWatchEvent) => {
          // Emit changes via socketio
          io.sockets.emit('reload', filePathContext)
          sendHotReloadEvent('building')

          if (program.command) {
            // Use spawn here so that we can pipe stdio from the command without buffering
            spawn(
              shell,
              [
                '-c',
                program.command
                  .replace(/\{event\}/gi, filePathContext)
                  .replace(/\{path\}/gi, eventContext),
              ],
              {
                stdio: 'inherit',
              }
            )
          }

          if (program.script) {
            try {
              // find the path of your --script script
              const scriptPath = path.join(process.cwd(), program.script.toString())

              // require your --script script
              const executeFile = require(scriptPath)

              // run the exported function from your --script script
              executeFile(filePathContext, eventContext)
            } catch (e) {
              console.error('Remote script failed')
              console.error(e)
              return e
            }
          }

          sendHotReloadEvent('reloadPage')
        }
      )
  }

  // create an express server
  const expressApp = express()
  const server = http.createServer(expressApp)

  // watch files with socketIO
  const io = SocketIO(server)

  // special handling for mdx reload route
  const reloadRoute = express.Router()
  reloadRoute.use(express.json())
  reloadRoute.all('/', (req, res) => {
    // log message if present
    const msg = req.body.message
    const color = req.body.color
    msg && console.log(color ? chalk[color](msg) : msg)

    // reload the nextjs app
    sendHotReloadEvent('building')
    sendHotReloadEvent('reloadPage')
    res.end('Reload initiated')
  })

  expressApp.use('/__next_reload', reloadRoute)

  // handle all other routes with next.js
  expressApp.all('*', (req, res) => handle(req, res, parse(req.url, true)))

  // fire it up
  server.listen(port, (err) => {
    if (err) throw err
    console.log(`> Ready on http://localhost:${port}`)
  })
})
