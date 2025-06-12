"use client";
import styles from "../../app/page.module.css";
import { useEffect, useState, useMemo } from "react";
import { useCart } from "../../app/context/CartContext";
import { useAuth } from "../../app/context/AuthContext";
import { useRouter } from "next/navigation";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import { api } from "../../app/utils/api";
import { toast } from "react-toastify";

const stripePromise = loadStripe(
  process.env.NODE_ENV === "development"
    ? process.env.NEXT_PUBLIC_STRIPE_TEST_KEY
    : process.env.NEXT_PUBLIC_STRIPE_LIVE_KEY
);


function CheckoutForm({ clientSecret, userRewards, setUserRewards, redeemReward, cart, user }) {
  const { clearCart } = useCart();
  const router = useRouter();
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
  if (!stripe || !elements) return;

  setLoading(true);
  const { error, paymentIntent } = await stripe.confirmPayment({
    elements,
    confirmParams: {
      return_url: window.location.origin,
    },
    redirect: "if_required",
  });

  if (error) {
    toast.error(`Payment failed: ${error.message}`);
  } else if (paymentIntent?.status === "succeeded") {
    try {
      const token = localStorage.getItem("token");

      const { data: savedOrder } = await api.post(
        "/api/orders/new",
        {
          user: user?._id || "Guest",
          customer: user?.name || "Guest",
          items: cart.map((item) => {
            const opts = item.customOptions?.map((opt) => opt.name).join(", ");
            return `${item.quantity}x ${item.name}${opts ? ` (${opts})` : ""}`;
          }),
        },
        {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        }
      );

      toast.success("Payment successful!");
      clearCart();

      router.push(`/order/${savedOrder._id}`);

    } catch (error) {
      console.error("Order emit/save error:", error);
      toast.err("Payment succeeded, but order processing failed.");
    }
  }

  setLoading(false);
};

  return (
    <div className={styles.vertContainer} style={{maxWidth: "90%", alignItems: "stretch"}}>
      <PaymentElement />
      <button
        className={styles.btns}
        onClick={handlePayment}
        disabled={loading || !stripe || !elements}
      >
        {loading ? "Processing..." : "Pay Now"}
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  const { cart } = useCart();
  const { user } = useAuth();
  const router = useRouter();

  const [clientSecret, setClientSecret] = useState("");
  const [userRewards, setUserRewards] = useState(0);
  const [redeemReward, setRedeemReward] = useState(false);

  const subtotal = cart.reduce((acc, item) => acc + item.totalPrice, 0);
  const amountInCents = Math.round(subtotal * 100);

  const description = useMemo(() => {
  return cart
    .map((item) => {
      const options = item.customOptions?.length
        ? ` (Options: ${item.customOptions.map((opt) => opt.name).join(", ")})`
        : "";
      return `${item.quantity}x ${item.name}${options}`;
    })
    .join(", ");
}, [cart]);

  useEffect(() => {
  if (!description) return;
  const createPaymentIntent = async () => {
    const token = localStorage.getItem("token");

    if (amountInCents < 50) {
  alert("Total amount must be at least $0.50 USD.");
  return;
}

    const headers = token
      ? { Authorization: `Bearer ${token}` }
      : {};

    try {
      const { data } = await api.post(
      "/api/stripe/create-payment-intent",
      {
        amount: amountInCents,
        connectedAccountId: "acct_1QuR72JJQIShDhAu",
        description,
        redeemReward,
        customerDetails: {
          name: user?.name || "Guest",
          email: user?.email || "guest@email.com",
        },
      },
      { headers }
    );

      setClientSecret(data.clientSecret);
      // setUserRewards(data.rewards);
    } catch (err) {
      console.error("Error creating payment intent:", err);
      alert("Failed to create payment intent.");
    }
  };

  createPaymentIntent();
}, [amountInCents, description, redeemReward]);

  return (
    <div className={styles.page}>
      <h1 className={styles.heading}>Checkout - ${subtotal.toFixed(2)}</h1>
      {/* <p className={styles.rewardsText}>Your Reward Points: {userRewards}</p> */}

      {userRewards >= 10 && (
        <div className={styles.switchRow}>
          <label htmlFor="rewards" className={styles.btns}>Redeem 10 points for a free drink?</label>
          <input
            id="rewards"
            type="checkbox"
            checked={redeemReward}
            onChange={(e) => setRedeemReward(e.target.checked)}
          />
        </div>
      )}

      {clientSecret && (
        <Elements stripe={stripePromise} options={{ clientSecret }}>
          <CheckoutForm
            clientSecret={clientSecret}
            userRewards={userRewards}
            setUserRewards={setUserRewards}
            redeemReward={redeemReward}
            cart={cart}
            user={user}
          />
        </Elements>
      )}
    </div>
  );
}