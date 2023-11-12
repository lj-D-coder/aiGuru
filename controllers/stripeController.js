import Stripe from 'stripe';


const stripeSecretKey = 'sk_test_51O6q3HSGRvfrT0Ugw6VFgioRF58VYlHVAEREy1EiasxpW2KhlaSgJmcOUOtqO8X8g3Ic4Osi6D7yXWiwpLaNpSdh00OAcKxCim';
const stripe = Stripe(stripeSecretKey);


// This is your Stripe CLI webhook secret for testing your endpoint locally.
const endpointSecret = "whsec_6b4c83d190252c824f4aeb3d6b6873f8fe2da3ba530ade7abe1cd2ebf9d70b52";

export const stripeHook = (request, response) => {
    const sig = request.headers['stripe-signature'];
    console.log(request);

  let event;

  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.async_payment_failed':
      const checkoutSessionAsyncPaymentFailed = event.data.object;
      // Then define and call a function to handle the event checkout.session.async_payment_failed
      break;
    case 'checkout.session.async_payment_succeeded':
      const checkoutSessionAsyncPaymentSucceeded = event.data.object;
      // Then define and call a function to handle the event checkout.session.async_payment_succeeded
      break;
    case 'checkout.session.completed':
      const checkoutSessionCompleted = event.data.object;
      // Then define and call a function to handle the event checkout.session.completed
      break;
    case 'checkout.session.expired':
      const checkoutSessionExpired = event.data.object;
      // Then define and call a function to handle the event checkout.session.expired
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
};
