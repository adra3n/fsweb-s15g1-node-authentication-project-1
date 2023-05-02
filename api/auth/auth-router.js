// `checkUsernameFree`, `checkUsernameExists` ve `checkPasswordLength` gereklidir (require)
// `auth-middleware.js` deki middleware fonksiyonları. Bunlara burda ihtiyacınız var!

const router = require('express').Router()
const middleware = require('./auth-middleware')
const UsersModel = require('../users/users-model')
const bcrypt = require('bcryptjs')
/**
  1 [POST] /api/auth/register { "username": "sue", "password": "1234" }

  response:
  status: 201
  {
    "user_id": 2,
    "username": "sue"
  }

  response username alınmış:
  status: 422
  {
    "message": "Username kullaniliyor"
  }

  response şifre 3 ya da daha az karakterli:
  status: 422
  {
    "message": "Şifre 3 karakterden fazla olmalı"
  }
 */

router.post(
  '/register',
  middleware.usernameBostami,
  middleware.sifreGecerlimi,
  async (req, res, next) => {
    try {
      let user = {
        username: req.body.username,
        password: bcrypt.hashSync(req.body.password, 8),
      }
      const insertedUser = await UsersModel.ekle(user)
      res.status(201).json(insertedUser)
    } catch (error) {
      next(error)
    }
  }
)

/**
  2 [POST] /api/auth/login { "username": "sue", "password": "1234" }

  response:
  status: 200
  {
    "message": "Hoşgeldin sue!"
  }

  response geçersiz kriter:
  status: 401
  {
    "message": "Geçersiz kriter!"
  }
 */

router.post('/login', middleware.usernameVarmi, (req, res, next) => {
  try {
    req.session.user_id = req.currentUser.user_id
    res.status(200).json({ message: `Hoşgeldin ${req.currentUser.username}!` })
  } catch (error) {
    next(error)
  }
})

/**
  3 [GET] /api/auth/logout

  response giriş yapmış kullanıcılar için:
  status: 200
  {
    "message": "Çıkış yapildi"
  }

  response giriş yapmamış kullanıcılar için:
  status: 200
  {
    "message": "Oturum bulunamadı!"
  }
 */
router.get('/logout', (req, res, next) => {
  try {
    if (req.session.user_id > 0) {
      req.session.destroy((err) => {
        if (err) {
          res.status(500).json({ message: 'Logout hatası' })
        } else {
          res.json({ message: 'Çıkış yapildi' })
        }
      })
    } else {
      res.status(400).json({ message: 'Oturum bulunamadı!' })
    }
  } catch (error) {
    next(error)
  }
})
// Diğer modüllerde kullanılabilmesi için routerı "exports" nesnesine eklemeyi unutmayın.

module.exports = router
