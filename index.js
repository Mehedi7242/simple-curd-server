const express = require('express');
const cors = require('cors');
require('dotenv').config();
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const port = process.env.PORT || 5000;
const app = express();
//middle ware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB}:${process.env.PASSWORD}@cluster0.pzup6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect()

    const database = client.db('usersDB')
    const userCollection = database.collection('users')
    const vegetableProductsCollection = database.collection('products'); 

    app.get('/users', async(req, res)=>{
      const cursor = userCollection.find()
      const result = await cursor.toArray();
      res.send(result);
    })

    app.post('/users',async(req, res)=>{
        const user = req.body
        // console.log('new user' ,user)
        const result = await userCollection.insertOne(user)
        res.send(result)
    })


    // Get all vegetable products
    app.get('/products', async (req, res) => {
      const cursor = vegetableProductsCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });


    app.post('/products', async (req, res) => {
      const product = req.body;
      // console.log('Received Product:', product);
    
      if (!product.name || !product.price || !product.category) {
        return res.status(400).json({ success: false, message: 'Product data is incomplete' });
      }
    
      try {
        // Insert the product into the vegetableProductsCollection
        const result = await vegetableProductsCollection.insertOne(product);
        console.log('Inserted Product:', result);
        res.status(200).json({ success: true, message: 'Product added successfully!' });
      } catch (error) {
        // console.error('Error inserting product:', error);
        res.status(500).json({ success: false, message: 'Error adding product' });
      }
    });

    app.delete('/products/:id', async (req, res) => {
      const productId = req.params.id;
    
      try {
        // Delete the product from the vegetableProductsCollection
        const result = await vegetableProductsCollection.deleteOne({ _id: new ObjectId(productId) });
    
        if (result.deletedCount === 1) {
          res.status(200).json({ success: true, message: 'Product deleted successfully!' });
        } else {
          res.status(404).json({ success: false, message: 'Product not found' });
        }
      } catch (error) {
        // console.error('Error deleting product:', error);
        res.status(500).json({ success: false, message: 'Error deleting product' });
      }
    });





    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    // console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.log);


app.get('/',(req, res)=>{
    res.send('simple CURD is running')
})
app.listen(port,()=>{
    console.log(`simple crud is running on port :${port}`)
})