const fastify = require("fastify")({
    logger: true
})
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
fastify.register(require("fastify-mongodb"), {
    forceClose: true,
    url: 'mongodb://92.53.102.254:27017/s-shop',
})

//                                                    Работа с пользовтелями
fastify.post('/create-user', async function (req, res) {
    try {
        const users = this.mongo.db.collection('users')
        const login = req.body.login
        const candidate = await users.findOne({login: login})
        if (candidate) {
            return (res.send({error: 'Пользователь с таким login уже существует'}))
        }
        const password = req.body.password
        if (password.length < 8) {
            return (res.send({error: 'Длина пароля должна быть не меньше 8 пользователей'}))
        }
        const hash_password = await bcrypt.hash(password, 5)
        const user = await users.insert({login: login, password: hash_password})
        console.log(user)
        res.send(user)
    } catch (e) {
        res.send(e)
    }
})

fastify.post('/login', async function (req, res) {
    try {
        const login = req.body.login
        const password = req.body.password

        const user = await this.mongo.db.collection('users').findOne({login: login})
        if (!user) {
            return (res.status(401).send({error: 'Неверный логин'}))
        }
        if (await bcrypt.compare(password, user.password) === false) {
            return (res.status(401).send({error: "Неверный пароль"}))
        }
        const token = jwt.sign({login: login}, 'secretKey')
        res.send({token: token})
    } catch (e) {
        res.send(e)
    }
})

fastify.get('/get-users/:login', async function (req, res) {
    if (req.params.login) {
        try {
            const login = req.params.login
            const user = await this.mongo.db.collection('users').findOne({login: login})
            if (!user) {
                return (res.send({message: 'Пользователя с таким login не существует'}))
            }
            res.send(user)
        } catch (e) {
            res.send(e)
        }
    } else {
        try {
            const users = await this.mongo.db.collection('users').find().toArray()
            res.send(users)
        } catch (e) {
            res.send(e)
        }
    }


})

// Работа с товарами
fastify.post('/create-shoe', async function (req, res) {
    try {
        const name = req.body.name
        const price = req.body.price
        const category = req.body.category
        const shoes = await this.mongo.db.collection('shoes')

        const shoe = await shoes.insert({
            name: name,
            price: price,
            category: category
        })
        console.log(shoe)
        res.send(shoe)
    } catch (e) {
        res.send(e)
    }
})

fastify.get('/get-shoes/:category', async function (req, res) {
    if (req.params.category) {
        try {
            const category = req.params.category
            const shoes = await this.mongo.db.collection('shoes').find({category: category}).toArray()
            res.send(shoes)
        }catch (e) {
            res.send(e)
        }

    } else {
        try {
            const shoes = await this.mongo.db.collection('shoes').find().toArray()
            res.send(shoes)
        } catch (e) {
            res.send(e)
        }
    }
})


fastify.listen(3000, (err) => {
    if (err) throw err
})