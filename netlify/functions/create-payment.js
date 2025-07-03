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
    const body = JSON.parse(event.body);
    const request = new checkoutNodeJssdk.orders.OrdersCreateRequest();
    
    request.prefer("return=representation");
    request.requestBody({
      intent: "CAPTURE",
      purchase_units: [{
        amount: {
          currency_code: "USD",
          value: body.total.toFixed(2),
          breakdown: {
            item_total: {
              currency_code: "USD",
              value: body.total.toFixed(2)
            }
          }
        },
        items: body.items.map(item => ({
          name: item.name,
          unit_amount: {
            currency_code: "USD",
            value: item.price.toFixed(2)
          },
          quantity: item.quantity.toString(),
          sku: item.name.substring(0, 127)
        }))
      }]
    });

    const order = await client().execute(request);
    
    return {
      statusCode: 200,
      body: JSON.stringify({ id: order.result.id })
    };
  } catch (err) {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: err.message })
    };
  }
};
