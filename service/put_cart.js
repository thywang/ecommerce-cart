const AWS = require("aws-sdk"),
  { DynamoDBDocument } = require("@aws-sdk/lib-dynamodb"),
  { DynamoDB } = require("@aws-sdk/client-dynamodb");

AWS.config.update({
  region: "us-east-2",
});

const util = require("../utils/util");
const getCartItemService = require("../utils/get_cart_item");

const dynamodb = DynamoDBDocument.from(new DynamoDB());
const cartTable = "ecommerce_cart";

/**
 * Add new item to cart.
 *
 */
async function putCart(cart_id, product) {
  const product_id = product.id;
  const quantity = product.quantity;
  if (!product_id || !quantity) {
    return util.buildResponse(401, {
      message: "Product ID and quantity are required",
    });
  }

  const dynamoCartItem = await getCartItemService.getCartItem(
    cart_id,
    product_id
  );
  if (dynamoCartItem && dynamoCartItem.product_id) {
    return util.buildResponse(401, {
      message:
        "Product already exist in cart. Please choose a different product",
    });
  }

  const item = {
    cart_id: cart_id,
    product_id: product_id,
    quantity: quantity,
    expiration_time: cart_id.startsWith("user#")
      ? util.generateTTL(7) // 7 days expiration time if authed user
      : util.generateTTL(), // 1 day expiration time if guest
  };

  // save product to cart in db
  const saveCartItemResponse = await saveCartItem(item);
  if (!saveCartItemResponse) {
    return util.buildResponse(503, {
      message: "Server Error. Please try again later",
    });
  }

  return util.buildResponse(200, {
    cart_id: cart_id,
    product_id: product_id,
    quantity: quantity,
  });
}

async function saveCartItem(item) {
  const params = {
    TableName: cartTable,
    Item: item,
  };

  return await dynamodb.put(params).then(
    () => {
      return true;
    },
    (error) => {
      console.error("There is an error saving cart item: ", error);
    }
  );
}

module.exports.putCart = putCart;
