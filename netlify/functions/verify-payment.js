const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  const isProduction = process.env.NODE_ENV === 'production';

  return isProduction
    ? new checkoutNodeJssdk.core.LiveEnvironment(clientId, clientSecret)
    : new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

exports.handler = async (event) => {
  try {
    const { orderID } = JSON.parse(event.body);
    if (!orderID) {
      return {
        statusCode: 400,
        body: JSON.stringify({ success: false, error: 'Missing orderID' }),
      };
    }

    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});

    const response = await client().execute(request);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        transactionId: response.result.id,
      }),
    };
  } catch (err) {
    console.error('Error capturing PayPal order:', err);
    return {
      statusCode: 500,
      body: JSON.stringify({ success: false, error: err.message }),
    };
  }
};
