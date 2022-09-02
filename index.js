const express = require('express')
const app = express()
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion } = require('mongodb');
require('dotenv').config(); 
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.cxka9cm.mongodb.net/?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });


async function run() {
  try {
    await client.connect();
    const slotCollections = client.db('logisticSoft').collection('slots');
    const bookingCollections = client.db('logisticSoft').collection('bookings'); 

    //Getting all available slots that is not booked yet
    app.get('/slots', async (req, res) => {
      const date = req.query.date;
      const allSlots = await slotCollections.find({}).toArray();
      const allBookings = await bookingCollections.find({ date: date }).toArray();
      const bookedSlot = allBookings.map(aB => aB.slot)
      const existingSlot = allSlots.filter(aS => !bookedSlot.includes(aS.slot)) 
      res.send(existingSlot);
    })

    //Getting all booked bookings
    app.get('/bookings', async(req, res) =>{
      const bookings = await bookingCollections.find({}).toArray();
      res.send(bookings)
    })



    //Booking api
    app.post('/booking', async (req, res) => {
      const booking = req.body;
      const query = { name: booking.name, slot: booking.slot, date: booking.formattedDate }
      const exists = await bookingCollections.findOne(query);
      if (exists) {
        return res.send({ success: false, booking: exists })
      }
      const result = await bookingCollections.insertOne(booking);
      res.send({ success: true, result })
    }) 
  }
  finally {

  }

}

run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello World!')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})