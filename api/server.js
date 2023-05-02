const express = require('express')
const helmet = require('helmet')
const cors = require('cors')
const authRouter = require('./auth/auth-router')
const usersRouter = require('./users/users-router')
const session = require('express-session')
const sessionStore = require('connect-session-knex')
/**
  Kullanıcı oturumlarını desteklemek için `express-session` paketini kullanın!
  Kullanıcıların gizliliğini ihlal etmemek için, kullanıcılar giriş yapana kadar onlara cookie göndermeyin. 
  'saveUninitialized' öğesini false yaparak bunu sağlayabilirsiniz
  ve `req.session` nesnesini, kullanıcı giriş yapana kadar değiştirmeyin.

  Kimlik doğrulaması yapan kullanıcıların sunucuda kalıcı bir oturumu ve istemci tarafında bir cookiesi olmalıdır,
  Cookienin adı "cikolatacips" olmalıdır.

  Oturum memory'de tutulabilir (Production ortamı için uygun olmaz)
  veya "connect-session-knex" gibi bir oturum deposu kullanabilirsiniz.
 */

const server = express()

server.use(helmet())
server.use(express.json())
server.use(cors())

server.get('/', (req, res) => {
  res.json({ api: 'up' })
})

server.use('/api/auth', authRouter)
server.use('/api/users', usersRouter)

server.use(
  session({
    name: 'cikolatacips',
    secret: 'secret_cikolatacips',
    cookie: {
      maxAge: 1000 * 60 * 60,
      secure: false,
    },
    store: new sessionStore({
      knex: require('../data/db-config'),
      tableName: 'sessions',
      sidFieldName: 'sid',
      createTable: true,
      clearInterval: 1000 * 60 * 60,
    }),
    resave: false,
    saveUninitialized: false,
  })
)

server.use((err, req, res, next) => {
  // eslint-disable-line
  res.status(err.status || 500).json({
    message: err.message,
    stack: err.stack,
  })
})

module.exports = server
