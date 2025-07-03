const checkoutNodeJssdk = require('@paypal/checkout-server-sdk');

function environment() {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_CLIENT_SECRET;
  
  return new checkoutNodeJssdk.core.SandboxEnvironment(clientId, clientSecret);
}

function client() {
  return new checkoutNodeJssdk.core.PayPalHttpClient(environment());
}

exports.handler = async (event) => {
  try {
    const { orderID } = JSON.parse(event.body);
    const request = new checkoutNodeJssdk.orders.OrdersCaptureRequest(orderID);
    request.requestBody({});
    
    const response = await client().execute(request);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ 
        success: true,
        transactionId: response.result.id
      })
    };
  } catch (err) {
    return {
      statusCode: 400,
      body: JSON.stringify({ 
        success: false,
        error: err.message
      })
    };
  }
};
