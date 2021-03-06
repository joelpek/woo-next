import { useState } from "react";
import { v4 } from "uuid";
import { getUpdatedItems } from "../../../functions";
import Link from "next/link";

const CartItem = ({
  item,
  products,
  updateCartProcessing,
  handleRemoveProductClick,
  updateCart,
}) => {
  const [productCount, setProductCount] = useState(item.qty);

  /*
   * When user changes the qty from product input update the cart in localStorage
   * Also update the cart in global context
   *
   * @param {Object} event event
   *
   * @return {void}
   */
  const handleQtyChange = (event, cartKey) => {
    if (process.browser) {
      event.stopPropagation();

      // If the previous update cart mutation request is still processing, then return.
      if (updateCartProcessing) {
        return;
      }

      // If the user tries to delete the count of product, set that to 1 by default ( This will not allow him to reduce it less than zero )
      const newQty = event.target.value ? parseInt(event.target.value) : 1;

      // Set the new qty in state.
      setProductCount(newQty);

      if (products.length) {
        const updatedItems = getUpdatedItems(products, newQty, cartKey);

        updateCart({
          variables: {
            input: {
              clientMutationId: v4(),
              items: updatedItems,
            },
          },
        });
      }
    }
  };
  //   /*console.log((item);*/
  return (
    <tr className="woo-next-cart-item" key={item.productId}>
      <th className="woo-next-cart-element woo-next-cart-el-close cart-rmv">
        {/* Remove item */}
        <span
          className="woo-next-cart-close-icon"
          onClick={(event) =>
            handleRemoveProductClick(event, item.cartKey, products)
          }
        >
          <i className="fa fa-times-circle" />
        </span>
      </th>
      <td className="woo-next-cart-element cart-img">
        <Link
          as={`/product/${item.slug}-${item.productId}`}
          href={`/product/?slug=${item.slug}-${item.productId}`}
        >
          <a className="cartItemImgLink">
            {/* ePro Consulting */}
            <img
              width="64"
              src={item.image.sourceUrl}
              srcSet={item.image.srcSet}
              alt={item.image.title}
            />
          </a>
        </Link>
      </td>
      <td className="woo-next-cart-element">
        <Link
          as={`/product/${item.slug}-${item.productId}`}
          href={`/product/?slug=${item.slug}-${item.productId}`}
        >
          <a>{item.name}</a>
        </Link>
      </td>
      <td className="woo-next-cart-element cart-price">{item.subtotal}</td>

      {/* Qty Input */}
      <td className="woo-next-cart-element woo-next-cart-qty cart-qty">
        {/* @TODO Need to update this with graphQL query */}
        <input
          type="number"
          min="1"
          size="1"
          data-cart-key={item.cartKey}
          className={`woo-next-cart-qty-input form-control ${
            updateCartProcessing ? "woo-next-cart-disabled" : ""
          } `}
          value={productCount}
          onChange={(event) => handleQtyChange(event, item.cartKey)}
        />
        {updateCartProcessing ? (
          <img
            className="woo-next-cart-item-spinner"
            src="/cart-spinner.gif"
            alt="spinner"
          />
        ) : (
          ""
        )}
      </td>
      <td className="woo-next-cart-element">
        {item.totalPlustax}
      </td>
    </tr>
  );
};

export default CartItem;
