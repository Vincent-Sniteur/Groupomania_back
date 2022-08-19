// Import dotenv config for port security
require('dotenv').config()

// Require the http module
const http = require('http')

// Importation app express
const app = require('./app')


// Return the port
const normalizePort = val => {
    const port = parseInt(val, 10)
  
    if (isNaN(port)) {
      return val
    }
    if (port >= 0) {
      return port
    }
    return false
  }

// Define port if there is a port in environment and store in Express.
const port = normalizePort(process.env.PORT ||'3000')
app.set('port', port)
  

// Error management
const errorHandler = error => {
    if (error.syscall !== 'listen') {
      throw error
    }
    const address = server.address()
    const bind = typeof address === 'string' ? 'pipe ' + address : 'port: ' + port
    switch (error.code) {
      case 'EACCES':
        console.error(bind + ' requires elevated privileges.')
        process.exit(1)
        break
      case 'EADDRINUSE':
        console.error(bind + ' is already in use.')
        process.exit(1)
        break
      default:
        throw error
    }
  }

// Create server and listen on provided port
const server = http.createServer(app)


server.on('error', errorHandler)
server.on('listening', () => {
  const address = server.address()
  const bind = typeof address === 'string' ? 'pipe ' + address : 'port ' + port
  console.log('Server listen on ' + bind)
})


// Log server & listening port
server.listen(port)