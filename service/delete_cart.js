const AWS = require("aws-sdk"),
  { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb"),
  { DynamoDB } = require("@aws-sdk/client-dynamodb");

AWS.config.update({
  region: "us-east-2",
});

const util = require("../utils/util");
const getCartService = require("./get_cart");

const dynamodb = new AWS.DynamoDB.DocumentClient();
const cartTable = "ecommerce_cart";

/**
 * Delete all items in cart.
 *
 */
async function deleteCart(cart_id) {
  const dynamoCartItems = await getCartService.queryCart(cart_id);

  if (dynamoCartItems && dynamoCartItems.length > 0) {
    const batchCalls = util.chunks(dynamoCartItems, 25).map(async (chunk) => {
      const deleteRequests = chunk.map((item) => {
        return {
          DeleteRequest: {
            Key: {
              cart_id: item.cart_id,
              product_id: item.product_id,
            },
          },
        };
      });

      const batchWriteParams = {
        RequestItems: {
          [cartTable]: deleteRequests,
        },
      };
      await dynamodb.batchWrite(batchWriteParams).promise();
    });

    await Promise.all(batchCalls);
  }

  return util.buildResponse(200, {
    cart_id: cart_id,
  });
}

/**
 * Delete a specified item in cart.
 *
 */
async function deleteCartItem(cart_id, product_id) {
  const params = {
    TableName: cartTable,
    Key: {
      cart_id: cart_id,
      product_id: product_id,
    },
  };

  // delete product from cart in db
  await dynamodb
    .delete(params, function (err, data) {
      if (err) {
        console.log("Error deleting item", err);
        return util.buildResponse(503, {
          message: "Server Error. Please try again later",
        });
      } else {
        console.log("Success deleting item", data);
      }
    })
    .promise();

  return util.buildResponse(200, {
    cart_id: cart_id,
    product_id: product_id,
  });
}

module.exports = { deleteCart, deleteCartItem };
