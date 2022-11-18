// importing packages
const express = require('express');
const admin = require('firebase-admin');
const bcrypt = require('bcrypt');
const path = require('path');

// firebase admin setup
let serviceAccount = require("./terminamos-proyecto-firebase-adminsdk-iq9g6-d299dd7bb0");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
}); 
let db = admin.firestore();
// admin.initializeApp({
//   credential: admin.credential.cert(serviceAccount)
// });


// // aws config
// const aws = require('aws-sdk');
// const dotenv = require('dotenv');

// dotenv.config();

// // aws parameters
// const region = "region";
// const bucketName = "bucket name";
// const accessKeyId = process.env.AWS_ACCESS_KEY;
// const secretAccessKey = process.env.AWS_SECRET_KEY;

// aws.config.update({
//     region, 
//     accessKeyId, 
//     secretAccessKey
// })

// // init s3
// const s3 = new aws.S3();

// // generate image upload link
// async function generateUrl(){
//     let date = new Date();
//     let id = parseInt(Math.random() * 10000000000);

//     const imageName = `${id}${date.getTime()}.jpg`;

//     const params = ({
//         Bucket: bucketName,
//         Key: imageName,
//         Expires: 300, //300 ms
//         ContentType: 'image/jpeg'
//     })
//     const uploadUrl = await s3.getSignedUrlPromise('putObject', params);
//     return uploadUrl;
// }

// declare static path
let staticPath = path.join(__dirname, "../entregafinal");

//intializing express.js
const app = express();

//middlewares
app.use(express.static(staticPath));
app.use(express.json());

//routes
//home route
app.get("/", (req, res) => {
    res.sendFile(path.join(staticPath, "../index.html"));
})

//signup route
app.get('../signup.html', (req, res) => {
    res.sendFile(path.join(staticPath, "../signup.html"));
})

app.post('../signup.html', (req, res) => {
    let { name, email, password, number, tac, notification } = req.body;

    // form validations
    if(name.length < 3){
        return res.json({'alert': 'el nombre debe tener 3 letras'});
    } else if(!email.length){
        return res.json({'alert': 'Ingresa tu mail'});
    } else if(!password.length < 8){
        return res.json({'alert': 'la contraseña debe tener 8 letras'});
    } else if(!number.length){
        return res.json({'alert': 'Ingrese su número telefónico'});
    } else if(!Number(number) || number.length < 10){
        return res.json({'alert': 'número inválido, por favor ingrese uno válido'});
    } else if(!tac){
        return res.json({'alert': 'debes aceptar nuestros términos y condiciones'});
    } 
    // almacenar usuario en db
    db.collection('users').doc(email).get()
    .then(user => {
        if(user.exists){
            return res.json({'alert': 'El email ya existe'});
        } else{
            // cifrar la contraseña antes de almacenarla.
            bcrypt.genSalt(10, (err, salt) => {
                bcrypt.hash(password, salt, (err, hash) => {
                    req.body.password = hash;
                    db.collection('users').doc(email).set(req.body)
                    .then(data => {
                        res.json({
                            name: req.body.name,
                            email: req.body.email,
                            seller: req.body.seller,
                        })
                    })
                })
            })
        }
    })
})

// login route
app.get('../login.html', (req, res) => {
    res.sendFile(path.join(staticPath, "../login.html"));
})

app.post('../login.html', (req, res) => {
    let { email, password } = req.body;

    if(!email.length || !password.length){
        return res.json({'alert': 'llenar todas las entradas'})
    }

    db.collection('users').doc(email).get()
    .then(user => {
        if(!user.exists){ // si el correo electrónico no existe
            return res.json({'alert': 'el correo electrónico de inicio de sesión no existe'})
        } else{
            bcrypt.compare(password, user.data().password, (err, result) => {
                if(result){
                    let data = user.data();
                    return res.json({
                        name: data.name,
                        email: data.email,
                        seller: data.seller,
                    })
                } else{
                    return res.json({'alert': 'La conceseña es incorrecta'});
                }
            })
        }
    })
})

// venta route
app.get('../seller.html', (req, res) => {
    res.sendFile(path.join(staticPath, "../seller.html"));
})

app.post('/seller', (req, res) => {
    let { name, about, address, number, tac, legit, email } = req.body;
    if(!name.length || !address.length || !about.length || number.length < 10 || !Number(number)){
        return res.json({'alert':'alguna información no es válida'});
    } else if(!tac || !legit){
        return res.json({'alert': 'debes aceptar nuestros términos y condiciones'})
    } else{
        // actualice el estado de vendedor de los usuarios aquí.
        db.collection('sellers').doc(email).set(req.body)
        .then(data => {
            db.collecti_on('users').doc(email).update({
                seller: true
            }).then(data => {
                res.json(true);
            })
        })
    }
})

// Agregar producto
app.get('/add-product', (req, res) => {
    res.sendFile(path.join(staticPath, "../addProduct.html"));
})

app.get('/add-product/:id', (req, res) => {
    res.sendFile(path.join(staticPath, "../addProduct.html"));
})

// obtener el enlace de carga
app.get('/s3url', (req, res) => {
    generateUrl().then(url => res.json(url));
})

// Agregar producto
app.post('../add-product.html', (req, res) => {
    let { name, shortDes, des, images, sizes, actualPrice, discount, sellPrice, stock, tags, tac, email, draft, id } = req.body;

    // validacion
    if(!draft){
        if(!name.length){
            return res.json({'alert': 'ingrese el nombre del producto '});
        } else if(shortDes.length > 100 || shortDes.length < 10){
            return res.json({'alert': 'la breve descripción debe tener entre 10 y 100 letras '});
        } else if(!des.length){
            return res.json({'alert': 'ingrese una descripción detallada sobre el producto'});
        } else if(!images.length){
            return res.json({'alert': 'sube al menos una imagen de producto'})
        } else if(!sizes.length){ 
            return res.json({'alert': 'seleccione al menos un tamaño '});
        } else if(!actualPrice.length || !discount.length || !sellPrice.length){
            return res.json({'alert': 'debes agregar precios'});
        } else if(stock < 20){
            return res.json({'alert': 'debe tener al menos 20 artículos en stock'});
        } else if(!tags.length){
            return res.json({'alert': 'ingrese algunas etiquetas para ayudar a clasificar su producto en la búsqueda '});
        } else if(!tac){
            return res.json({'alert': 'debes aceptar nuestros términos y condiciones'});
        } 
    }

    // agregar prodcutos
    let docName = id == undefined ? `${name.toLowerCase()}-${Math.floor(Math.random() * 5000)}` : id;
    db.collection('products').doc(docName).set(req.body)
    .then(data => {
        res.json({'product': name});
    })
    .catch(err => {
        return res.json({'alert': 'Ocurrio un error, intente otra vez'});
    })
})

// Obetener productos
app.post('/get-products', (req, res) => {
    let { email, id, tag } = req.body;

    if(id){
        docRef = db.collection('products').doc(id)
    } else if(tag){
        docRef = db.collection('products').where('tags', 'array-contains', tag)
    } else{
        docRef = db.collection('products').where('email', '==', email)
    }

    docRef.get()
    .then(products => {
        if(products.empty){
            return res.json('no products');
        }
        let productArr = [];
        if(id){
            return res.json(products.data());
        } else{
            products.forEach(item => {
                let data = item.data();
                data.id = item.id;
                productArr.push(data);
            })
            res.json(productArr)
        }
    })
})

app.post('/delete-product', (req, res) => {
    let { id } = req.body;
    
    db.collection('products').doc(id).delete()
    .then(data => {
        res.json('success');
    }).catch(err => {
        res.json('err');
    })
})

// página del producto
app.get('../products/:id', (req, res) => {
    res.sendFile(path.join(staticPath, "../product.html"));
})

app.get('../search/:key', (req, res) => {
    res.sendFile(path.join(staticPath, "../search.html"));
})

app.get('../cart.html', (req, res) => {
    res.sendFile(path.join(staticPath, "../cart.html"));
})

app.get('../checkout.html', (req, res) => {
    res.sendFile(path.join(staticPath, "../checkout.html"));
})

app.post('/order', (req, res) => {
    const { order, email, add } = req.body;

    let transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: process.env.EMAIL,
            pass: process.env.PASSWORD
        }
    })

    const mailOption = {
        from: 'sender email',
        to: email,
        subject: 'Most : Realizar pedido',
        html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
            <meta charset="UTF-8">
            <meta http-equiv="X-UA-Compatible" content="IE=edge">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            <title>documento</title>

            <style>
                body{
                    min-height: 90vh;
                    background: #f5f5f5;
                    font-family: sans-serif;
                    display: flex;
                    justify-content: center;
                    align-items: center;
                }
                .heading{
                    text-align: center;
                    font-size: 40px;
                    width: 50%;
                    display: block;
                    line-height: 50px;
                    margin: 30px auto 60px;
                    text-transform: capitalize;
                }
                .heading span{
                    font-weight: 300;
                }
                .btn{
                    width: 200px;
                    height: 50px;
                    border-radius: 5px;
                    background: #3f3f3f;
                    color: #fff;
                    display: block;
                    margin: auto;
                    font-size: 18px;
                    text-transform: capitalize;
                }
            </style>

        </head>
        <body>
            
            <div>
                <h1 class="heading">dear ${email.split('@')[0]}, <span>su pedido se ha realizado correctamente</span></h1>
                <button class="btn">comprobar estado </button>
            </div>

        </body>
        </html>
        `
    }

    let docName = email + Math.floor(Math.random() * 123719287419824);
    db.collection('order').doc(docName).set(req.body)
    .then(data => {

        transporter.sendMail(mailOption, (err, info) => {
            if(err){
                res.json({'alert': '¡ay! parece que ocurrió algún error. Intentar otra vez'})
            } else{
                res.json({'alert': 'tu pedido esta hecho'});
            }
        })

    })
})

// 404 route
app.get('../404', (req, res) => {
    res.sendFile(path.join(staticPath, "../404.html"));
})

app.use((req, res) => {
    res.redirect('../404.html');
})

app.listen(5500, () => {
    console.log('listening on port 5500.......');
})