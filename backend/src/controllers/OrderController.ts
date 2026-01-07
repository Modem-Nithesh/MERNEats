import { Request, Response } from "express";
import Stripe from "stripe";
import Restaurant, { MenuItemType } from "../models/restaurant";
import Order from "../models/order";
import User from "../models/user";

const STRIPE = new Stripe(process.env.STRIPE_API_KEY as string);
const FRONTEND_URL = process.env.FRONTEND_URL as string;

type CheckoutSessionRequest = {
  cartItems: {
    menuItemId: string;
    name: string;
    quantity: string;
  }[];
  deliveryDetails: {
    email: string;
    name: string;
    addressLine1: string;
    city: string;
  };
  restaurantId: string;
};

const createCheckoutSession = async (req: Request, res: Response) => {
  try {
    const checkoutSessionRequest: CheckoutSessionRequest = req.body;

    const restaurant = await Restaurant.findById(
      checkoutSessionRequest.restaurantId
    );

    if (!restaurant) {
      throw new Error("Restaurant not found");
    }

    // FIX 1: Find the real user in the database using the Auth0 ID
    const user = await User.findOne({ auth0Id: req.auth0Id });

    if (!user) {
      throw new Error("User not found");
    }

    const lineItems = createLineItems(
      checkoutSessionRequest,
      restaurant.menuItems
    );

    const calculateTotal = () => {
      const itemsTotal = lineItems.reduce((total, item) => {
        const price = item.price_data?.unit_amount || 0;
        const quantity = item.quantity || 0;

        return total + price * quantity;
      }, 0);
      return itemsTotal + restaurant.deliveryPrice;
    };

    const newOrder = new Order({
      restaurant: restaurant,
      user: user._id, // FIX 1: Use the Database ID (ObjectId), not Auth0 ID
      status: "placed",
      deliveryDetails: {
        name: checkoutSessionRequest.deliveryDetails.name,
        addressLine1: checkoutSessionRequest.deliveryDetails.addressLine1,
        city: checkoutSessionRequest.deliveryDetails.city,
        // FIX 2: If email is missing from frontend, use the one from the database
        email: checkoutSessionRequest.deliveryDetails.email || user.email,
      },
      cartItems: checkoutSessionRequest.cartItems,
      createdAt: new Date(),
      totalAmount: calculateTotal(),
    });

    const session = await createSession(
      lineItems,
      newOrder._id.toString(),
      restaurant.deliveryPrice,
      restaurant._id.toString()
    );

    if (!session.url) {
      return res.status(500).json({ message: "Error creating stripe session" });
    }

    // Save the order to DB
    await newOrder.save();

    res.json({ url: session.url });
  } catch (error: any) {
    console.log(error);
    res.status(500).json({ message: error.raw?.message || error.message });
  }
};

const createLineItems = (
  checkoutSessionRequest: CheckoutSessionRequest,
  menuItems: MenuItemType[]
) => {
  const lineItems = checkoutSessionRequest.cartItems.map((cartItem) => {
    const menuItem = menuItems.find(
      (item) => item._id.toString() === cartItem.menuItemId.toString()
    );

    if (!menuItem) {
      throw new Error(`Menu item not found: ${cartItem.menuItemId}`);
    }

    const line_item: Stripe.Checkout.SessionCreateParams.LineItem = {
      price_data: {
        currency: "gbp",
        unit_amount: menuItem.price,
        product_data: {
          name: menuItem.name,
        },
      },
      quantity: parseInt(cartItem.quantity),
    };

    return line_item;
  });

  return lineItems;
};

const createSession = async (
  lineItems: Stripe.Checkout.SessionCreateParams.LineItem[],
  orderId: string,
  deliveryPrice: number,
  restaurantId: string
) => {
  const sessionData = await STRIPE.checkout.sessions.create({
    line_items: lineItems,
    shipping_options: [
      {
        shipping_rate_data: {
          display_name: "Delivery",
          type: "fixed_amount",
          fixed_amount: {
            amount: deliveryPrice,
            currency: "gbp",
          },
        },
      },
    ],
    mode: "payment",
    metadata: {
      orderId,
      restaurantId,
    },
    success_url: `${FRONTEND_URL}/order-status?success=true`,
    cancel_url: `${FRONTEND_URL}/detail/${restaurantId}?cancelled=true`,
  });

  return sessionData;
};

const getMyOrders = async (req: Request, res: Response) => {
  try {
    // 1. Find the user in the DB
    const user = await User.findOne({ auth0Id: req.auth0Id });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // 2. Find all orders for this user
    const orders = await Order.find({ user: user._id })
      .populate("restaurant") // Retrieve full restaurant details
      .populate("user") // Retrieve full user details
      .sort({ createdAt: -1 }); // Newest first

    res.json(orders);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default {
  createCheckoutSession,
  getMyOrders,
};
