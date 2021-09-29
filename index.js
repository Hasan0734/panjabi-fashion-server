const express = require("express");
const app = express();
const { MongoClient } = require("mongodb");
const ObjectID = require('mongodb').ObjectID
const cors = require("cors");
const bodyParser = require("body-parser");
const port = process.env.PORT || 5000;
require('dotenv').config()
app.use(cors());
app.use(bodyParser.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@volunteer.mhxeg.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  console.log('connection err', err);
  const productCollection = client.db("panjabi").collection("products");
  const orderCollection = client.db("panjabi").collection("checkouts");

    app.get('/products', (req, res) =>{
        productCollection.find({})
        .toArray((err, products) => {
            res.send(products)
        })
    })

    app.get('/product/:id', (req, res) => {
      const id = ObjectID(req.params.id);
      productCollection.findOne({'_id': id})
      .then(result => {
        res.send(result)
      })
    })

    app.get('/orders', (req, res)=> {
      orderCollection.find({email: req.query.email})
      .toArray((err, order) => {
        res.send(order)
      })
    })

      
    app.post('/checkoutProduct', (req, res) => {
      const checkoutProduct = req.body
      orderCollection.insertOne(checkoutProduct)
      .then(result => {
        res.send(result.insertedCount > 0)
      })

    })

    app.post('/addProduct', (req, res) => {
        const newProduct = req.body;
        productCollection.insertOne(newProduct)
        .then(result => {
            res.send(result.insertedCount > 0)
        })
    })

    app.patch('/updateProduct/:id', (req, res) => {
      const id = ObjectID(req.params.id);
      productCollection.findOneAndUpdate({_id: id},
      {
        $set:{name: req.body.name, price: req.body.price, quantity: req.body.quantity}
      })
      .then(result=> {
        res.send(result.modifiedCount > 0)
      })
    })

    app.delete('/delete-order/:id', (req, res) => {
      const id = ObjectID(req.params.id)
    
      orderCollection.findOneAndDelete({_id: id})
      .then(result => {
        
        res.send(!!result.value)})
    })

    app.delete('/delete/:id', (req, res) => {
      const id = ObjectID(req.params.id)
  
      productCollection.findOneAndDelete({_id: id})
      .then(documents => {
        
        res.send(!!documents.value)
      })
    })
  //   client.close();
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.listen(port);
