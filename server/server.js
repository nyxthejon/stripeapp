import express from 'express';
import stripe from 'stripe';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const stripeClient = stripe(process.env.STRIPE_SECRET_KEY);

app.use(cors());
app.use(express.json());

const DEPOSIT_AMOUNTS = {
  20: 2000,   // Amount in cents
  40: 4000,
  100: 10000
};

app.post('/create-checkout-session', async (req, res) => {
  const { amount } = req.body;
  const cents = DEPOSIT_AMOUNTS[amount];

  if (!cents) {
    return res.status(400).json({ error: 'Invalid amount' });
  }

  try {
    const session = await stripeClient.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',
      success_url: 'http://localhost:3000/success',
      cancel_url: 'http://localhost:3000/cancel',
      line_items: [{
        price_data: {
          currency: 'eur',
          product_data: {
            name: `Deposit €${amount}`
          },
          unit_amount: cents
        },
        quantity: 1
      }]
    });

    res.json({ sessionUrl: session.url });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

app.get('/balance', async (req, res) => {
    try {
      const balance = await stripeClient.balance.retrieve();
      res.json(balance);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });