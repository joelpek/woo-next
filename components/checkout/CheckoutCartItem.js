import Link from "next/link";

const CheckoutCartItem = ({ item }) => {
  //   console.log(item)
  return (
    <tr className="woo-next-cart-item" key={item.productId}>
      <td className="woo-next-cart-element">
        <Link
          as={`/product/${item.slug}-${item.productId}`}
          href={`/product/?slug=${item.slug}-${item.productId}`}
        >
          <a aria-hidden className="coCartItemImgLink">
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
      <td className="woo-next-cart-element">{item.totalPrice}</td>
    </tr>
  );
};

export default CheckoutCartItem;
