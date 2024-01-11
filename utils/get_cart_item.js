const AWS = require("aws-sdk"),
      {
        DynamoDBDocument
      } = require("@aws-sdk/lib-dynamodb"),
      {
        DynamoDB
      } = require("@aws-sdk/client-dynamodb");

AWS.config.update({
  region: "us-east-2",
});

const dynamodb = DynamoDBDocument.from(new DynamoDB());
const cartTable = "ecommerce_cart";

/**
 * Get a specified item in cart.
 *
 */
async function getCartItem(cart_id, product_id) {
  const params = {
    TableName: cartTable,
    Key: {
      cart_id: cart_id,
      product_id: product_id,
    },
  };

  return await dynamodb
    .get(params)
    .then(
      (response) => {
        return response.Item;
      },
      (error) => {
        console.error("There is an error getting cart item: ", error);
      }
    );
}

module.exports.getCartItem = getCartItem;
