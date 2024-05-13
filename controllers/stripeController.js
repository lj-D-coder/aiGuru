import stripePackage from "stripe";
import dotenv from "dotenv";
import { errorHandler } from "../utils/error.js";
import { Users } from "../models/usersModel.js";
import { SubscriberModel } from "../models/subscribersModel.js";
dotenv.config();

const tokenizerValue = process.env.TOKEN_MULTIPLIER;
const stripe = stripePackage(process.env.STRIPE_KEY);
const YOUR_DOMAIN = process.env.YOUR_DOMAIN;
export const checkout = async (req, res, next) => {
  let userId = req.body.userId;
  const getUser = await Users.findById(userId);
  
  if (!getUser) { return next(errorHandler(404, "User not found!")) };
  const customerId = getUser.stripeCusId;

  const prices = await stripe.prices.list({
    lookup_keys: [req.body.lookup_key],
    expand: ["data.product"],
  });

  const session = await stripe.checkout.sessions.create({
    customer: customerId,
    billing_address_collection: "auto",
    line_items: [
      {
        price: prices.data[0].id,
        // For metered billing, do not pass quantity
        quantity: 1,
      },
    ],
    mode: "subscription",
    success_url: `${YOUR_DOMAIN}/success.html?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${YOUR_DOMAIN}/cancel.html`,
  });

  //saving payment session in database
  // const updatedData = {
  //   userId: getUser._id,
  //   stripeCusId: customerId,
  //   session_id: session.id,
  // };
  
  // const initializeSub = await SubscriberModel.updateOne(
  //   { stripeCusId: customerId },
  //   {
  //     $set: updatedData,
  //     $set: {
  //       "subscription_info.id": "0",
  //       "subscription_info.status": "Free",
  //       "subscription_info.interval": "0",
  //       "subscription_info.expiryAt": "0",
  //     },
  //     $inc: { "subscription_info.token": 0 }
  //   },
  //   { upsert: true }
  // );
  
  console.log("Subscription Process initiated");
  res.redirect(303, session.url);
};

export const createSession = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    const findUser = await Users.findById(userId);
    if (!findUser){ return next(errorHandler(404, "User not found!"))};
    const customerId = findUser.stripeCusId;
    const portalSession = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${YOUR_DOMAIN}/success.html`,
  });
    //res.redirect(303, portalSession.url);
    return res.status(200).json({ success: true, manageUrl: portalSession.url });
    
  } catch (error) {
    console.log(error);
  }
};


export const stripeWebhook = async (request, response) => {
  // This is your Stripe CLI webhook secret for testing your endpoint locally.
  const endpointSecret = process.env.STRIPE_WEBHOOK_KEY;
  const sig = request.headers["stripe-signature"];

  let event;
  try {
    event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
  } catch (err) {
    response.status(400).send(`Webhook Error: ${err.message}`);
    return;
  }

  // Handle the event
  switch (event.type) {
    case "checkout.session.async_payment_failed":
      const checkoutSessionAsyncPaymentFailed = event.data.object;
      console.log("checkoutSessionAsyncPaymentFailed");
      console.log(checkoutSessionAsyncPaymentFailed);
      // Then define and call a function to handle the event checkout.session.async_payment_failed
      customer;
      break;
    case "checkout.session.completed":
      const checkoutSessionCompleted = event.data.object;
      console.log("checkoutSessionCompleted");
      console.log(checkoutSessionCompleted);
      // Then define and call a function to handle the event checkout.session.completed
      break;
    case "checkout.session.expired":
      const checkoutSessionExpired = event.data.object;
      console.log("checkoutSessionExpired");
      console.log(checkoutSessionExpired);
      // Then define and call a function to handle the event checkout.session.expired
      break;

    //case
    case "customer.subscription.created":
      const customer = event.data.object;
      // const updatedData = {
      //   stripeCusId: customer.customer,
      //   subscription_info: {
      //     id: customer.items.data[0]["subscription"],
      //     status: customer.status,
      //     token: tokenizerValue,
      //     interval: customer.items.data[0]["plan"]["interval"],
      //     expiryAt: customer.current_period_end,
      //   },
      // };
      // const subscr_Info = await SubscriberModel.updateOne(
      //   { stripeCusId: customer.customer },
      //   updatedData,
      //   { upsert: true }
      // );
      console.log("====================Webhook subscription Created====================");
      console.log(customer)
      console.log("====================Webhook subscription Created====================");
      break;

    case "customer.subscription.deleted":
      const customerSubscriptionDeleted = event.data.object;
      console.log("customerSubscriptionDeleted");
      console.log(customerSubscriptionDeleted);


      const updatedData = {
        stripeCusId: customer.customer,
        subscription_info: {
          id: "0",
          status: "free",
          token: 0,
          interval: "0",
          expiryAt: "0",
        },
      };
      const resetToFree = await SubscriberModel.updateOne(
        { stripeCusId: customer.customer },
        updatedData,
        { upsert: true }
      );  
      
      // Then define and call a function to handle the event customer.subscription.deleted
      break;
    
    case "customer.subscription.paused":
      const customerSubscriptionPaused = event.data.object;
      console.log("customerSubscriptionPaused");
      // Then define and call a function to handle the event customer.subscription.paused
      break;
    case "customer.subscription.resumed":
      const customerSubscriptionResumed = event.data.object;
      console.log("customerSubscriptionResumed");
      // Then define and call a function to handle the event customer.subscription.resumed
      break;
    case "customer.subscription.trial_will_end":
      const customerSubscriptionTrialWillEnd = event.data.object;
      console.log("customerSubscriptionTrialWillEnd");
      // Then define and call a function to handle the event customer.subscription.trial_will_end
      break;
    
      case "subscription_schedule.completed":
        const customerSubscriptionCompleted = event.data.object;
        console.log("customerSubscriptionCompleted");
        // Then define and call a function to handle the event customer.subscription.trial_will_end
        break;
      
    
    case "customer.subscription.updated":
      
      
      const customerSubscriptionUpdated = event.data.object;
      const subs_update = {
        stripeCusId: customerSubscriptionUpdated.customer,
        subscription_info: {
          id: customerSubscriptionUpdated.items.data[0]["subscription"],
          status: customerSubscriptionUpdated.status,
          token: customerSubscriptionUpdated.items.data[0]["plan"]["amount"] * tokenizerValue,
          interval: customerSubscriptionUpdated.items.data[0]["plan"]["interval"],
          expiryAt: customerSubscriptionUpdated.current_period_end,
        },
      };
      const updateInfo = await SubscriberModel.updateOne(
        { stripeCusId: customerSubscriptionUpdated.customer },
        subs_update,
        { upsert: true }
      );
      console.log("====================Webhook subscription updated====================");
      console.log(customerSubscriptionUpdated);
      console.log("====================Webhook subscription updated====================");
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  response.send();
};
