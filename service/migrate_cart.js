const AWS = require("aws-sdk");

AWS.config.update({
  region: "us-east-2",
});

const util = require("../utils/util");
const getCartService = require("./get_cart");

// const dynamodb = DynamoDBDocument.from(new DynamoDB());
const dynamodb = new AWS.DynamoDB.DocumentClient();
const cartTable = "ecommerce_cart";

/**
 * Migrate all items in cart of old_cart_id to new cart of new_cart_id
 *
 */
async function migrateCart(old_cart_id, new_cart_id) {
  if (!old_cart_id || !new_cart_id) {
    return util.buildResponse(401, {
      message: "Old cart ID and new cart ID are required",
    });
  }

  const dynamoCartItems = await getCartService.queryCart(old_cart_id);
  const ttl = util.generateTTL(7); // 7 days because authed cart now

  if (dynamoCartItems && dynamoCartItems.length > 0) {
    const batchCalls = util.chunks(dynamoCartItems, 25).map(async (chunk) => {
      const deleteRequests = chunk.map((item) => {
        return {
          PutRequest: {
            Item: {
              cart_id: new_cart_id,
              product_id: item.product_id,
              quantity: item.quantity,
              expiration_time: ttl,
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

  console.log("Batch migrate successful! Beginning delete...");

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
  console.log("Batch delete successful!");

  return util.buildResponse(200, {
    cart_id: new_cart_id,
  });
}

module.exports.migrateCart = migrateCart;
