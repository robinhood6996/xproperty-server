const express = require('express');
const app = express();
require('dotenv').config();
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;
const port = process.env.PORT || 6010;

//middleware
app.use(cors());
app.use(express.json());

//MongoDB Configuration
const { MongoClient } = require('mongodb');
const { ObjectID } = require('bson');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@cluster0.m62xz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

//Main Funciton 
async function run() {
    try {
        await client.connect();
        const database = client.db("xproperty");
        const propertiesCollection = database.collection("properties");
        const queryCollection = database.collection("queries");
        const reviewCollection = database.collection("reviews");
        const usersCollection = database.collection("users");

        //Add property in Database API
        app.post('/property', async (req, res) => {
            const property = req.body;
            const result = await propertiesCollection.insertOne(property);
            console.log(result);
            res.json(result)
        });

        //Place Order API
        app.post('/place-order', async (req, res) => {
            const requestQuery = req.body;
            const result = await queryCollection.insertOne(requestQuery);
            console.log(result);
            res.json(result);
        });
        app.put('/order-status/:id', async (req, res) => {
            const id = req.params.id;
            const data = req.body.status;
            const filter = { _id: ObjectId(id) };
            const updateDoc = {
                $set: {
                    status: data
                }
            };
            const result = await queryCollection.updateOne(filter, updateDoc);
            res.send(result);
        })

        //Get all orders API
        app.get('/orders', async (req, res) => {
            const email = req.query.email;
            const query = { email: email };
            const data = queryCollection.find(query);
            const result = await data.toArray();
            res.send(result);
        });
        //Get all orders API
        app.get('/all-orders', async (req, res) => {
            const query = {};
            const data = queryCollection.find(query);
            const result = await data.toArray();
            res.send(result);
        });

        //Delete order API 
        app.delete('/order/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await queryCollection.deleteOne(query);
            res.send(result);
        });

        //Add Review API
        app.post('/add-review', async (req, res) => {
            const review = req.body;
            const result = await reviewCollection.insertOne(review);
            // console.log(result);
            res.json(result);
        });

        //Get Reviews API
        app.get('/reviews', async (req, res) => {
            const query = {};
            const result = reviewCollection.find(query);
            const data = await result.toArray();
            res.send(data);
        })


        //Get all properties API
        app.get('/properties', async (req, res) => {
            const query = {};
            const data = propertiesCollection.find(query);
            const result = await data.toArray();
            res.send(result);
        });

        //Get Single Property API
        app.get('/property/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await propertiesCollection.findOne(query);
            res.send(result);
            console.log(result);
        })

        //Delete Property API For admin side
        app.delete('/properties/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectID(id) };
            const result = await propertiesCollection.deleteOne(query);
            res.send(result);
        });




        //admin check API
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            }
            res.json({ admin: isAdmin });

        })
        //Add user API
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            res.send(result);
        });

        //Google signin add user api
        app.put('/users', async (req, res) => {
            const user = req.body;
            console.log('Put', user);
            const filter = { email: user.email };
            const options = { upsert: true };
            const updateDoc = { $set: user };
            const result = await usersCollection.updateOne(filter, updateDoc, options);
            res.json(result);
        });

        //Make admin API
        app.put('/user/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });





    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Hello world')
});

//xproperty_admin
//No1u891MyLxdKv19
app.listen(port, () => {
    console.log(`Example app listening at http://localhost:${port}`)
})