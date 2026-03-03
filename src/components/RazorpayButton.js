import React from 'react';
import axois from 'axios';
import CONFIG from '../Config';

const RazorpayButton = ({ amount, onSuccess }) => {

  const handlePayment = async () => {
    const { data: order } = await axois.post(
      `${CONFIG.API_BASE_URL}/create-order`,
      { amount }
    );

    const options = {
      key: 'rzp_test_SJW3w5LvLSeHtK',
      amount: order.amount,
      currency: order.currency,
      name: 'Bus Ride',
      description: 'Wallet Recharge',
      order_id: order.id,
      handler: async function (response) {
        await axois.post(
          `${CONFIG.API_BASE_URL}/verify-payment`,
          response
        );
        // alert("Payment Sucessfully");
        if (onSuccess) {
          onSuccess(response);   // <-- send response to Home
        }
        // setPaymentMessage("Payment Successfully Completed ✅");
      },

      // theme: {
      //   color: "#dc3545"
      // }
      theme: {
        color: "#3399cc",
      },
    };
    const rzp = new window.Razorpay(options);
    rzp.open();
  };

  return (
    <>

      <button type="button" class="btn btn-success" onClick={handlePayment}>
        Pay ₹{amount}
      </button>

    </>
  );
};

export default RazorpayButton