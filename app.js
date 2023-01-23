const config = require('config');
const https = require('https')
const axios = require('axios');
const instanceAxios = axios.create({
    httpsAgent: new https.Agent({ rejectUnauthorized: false })
});
const express = require('express')
const expressLayouts = require('express-ejs-layouts')
const port = config.get('server.port');
const host = config.get('server.host');
const app = express()
const {body, validationResult} = require('express-validator');
const { Console } = require('console');
const _EXTERNAL_URL = config.get('externaApi.url');

//Configure Client 
app.use(express.urlencoded({extended:true}))
app.use(express.json())
app.use(expressLayouts)
app.set('layout', './layouts/full-width')
app.set('view engine', 'ejs')

// Static Files
app.use(express.static("public/images"));
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))


async function postDataToApi(dataContact) {
    let config = {
        method: 'post',
        url: _EXTERNAL_URL,
        headers: { 
          'accept': '*/*', 
          'Content-Type': 'application/json'
        },
        data : dataContact
      };
      
      await instanceAxios(config)
      .then(function (response) {
        console.log(JSON.stringify(response.data));
      })
      .catch(function (error) {
        console.log(error);
      });            
  }
async function getDataToApi() {
    let dataFound='No data'
    let config = {
        method: 'get',
        url: _EXTERNAL_URL,
        headers: { 
          'accept': '*/*', 
          'Content-Type': 'application/json'
        }
      };
      
      await instanceAxios(config)
      .then(function (response) {        
        dataFound=response.data;  
        console.log('Valores obtenidos Get:'+ JSON.stringify(response.data));        
      })
      .catch(function (error) {
        console.log('Method Get has Error:'+ error);        
      });
      return dataFound;                  
  }

// Routes
app.get('/', (req, res)=>{
    res.render('home',{ title: 'Home Client Process'})
})

app.post('/registrar', [
    body('user', 'Ingrese un Usuario valido')
        .exists()
        .isLength({min:4}),
    body('name', 'Ingrese un nombre y apellido completo')
        .exists()
        .isLength({min:10}),
    body('role', 'Ingrese el cargo del usuario')
        .exists()
        .isLength({min:5}),
    body('cellphone', 'Ingrese el Teléfono de contacto del usuario')
        .exists()
        .isMobilePhone(),
    body('email', 'Ingrese un E-mail válido')
        .exists()
        .isEmail(),
    body('contacttype', 'Establezca el tipo de Contacto')        
        .exists()
        .isLength({min:5}),
], async (req, res)=>{
    //validación propia    
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
        console.log(req.body)
        const valores = req.body
        const validaciones = errors.array()
        res.render('index', {validaciones:validaciones, valores: valores, title: 'Home Page Client Process'})
    }else{
        let contact={
            userInf : req.body.user,
            nameInf : req.body.name,
            titleInf : req.body.role,
            cellphoneInf :req.body.cellphone,
            emailInf :req.body.email,
            contactTypeInf :req.body.contacttype
        } 
        console.log(contact);
        await postDataToApi(contact)         
        res.render('contacts',{title: 'Exist Clients'})
    }
})

app.get('/new', (req, res)=>{    
    res.render('index',{ title: 'Add Client Process'})
})

app.get('/contacts', (req, res)=>{    
    res.render('contacts',{title: 'Exist Clients'})
})

app.get('/feedTBL', async (req, res)=>{       
    var data =await getDataToApi() ;
    console.log('Call to Function feedTBL...'+data)
    res.send(data);
})

app.get('/about', (req, res)=>{       
    res.render('about',{title: 'About This'})
})

// Listen on Port 3000
app.listen(port,host, (err)=>{
    if (err) {
        console.log(err);
        process.exit(1);
    }
    console.log('Test Development Intcomex: SERVER UP en http://'+host+':'+port)//'localhost:3000')
})