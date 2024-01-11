const AWS = require("aws-sdk"),
  { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb"),
  { DynamoDB } = require("@aws-sdk/client-dynamodb");

AWS.config.update({
  region: "us-east-2",
});

const util = require("../utils/util");

const dynamodb = DynamoDBDocument.from(new DynamoDB());
const cartTable = "ecommerce_cart";

/**
 * Get all items in cart.
 *
 */
async function getCart(cart_id) {
  if (!cart_id) {
    return util.buildResponse(401, {
      message: "Cart ID is required",
    });
  }

  const dynamoCartItems = await queryCart(cart_id);
  if (!dynamoCartItems) {
    return util.buildResponse(403, {
      message: "Cart " + cart_id + " does not exist",
    });
  }

  const response = {
    cart_id: cart_id,
    items: dynamoCartItems,
  };

  return util.buildResponse(200, response);
}

async function queryCart(cart_id) {
  const params = {
    TableName: cartTable,
    KeyConditionExpression: "cart_id = :cart_id",
    ExpressionAttributeValues: {
      ":cart_id": cart_id,
    },
  };

  return await dynamodb.query(params).then(
    (response) => {
      //console.log("Success", response.Items);
      return response.Items;
    },
    (error) => {
      console.error("There is an error getting cart: ", error);
    }
  );
}

module.exports = { getCart, queryCart };
