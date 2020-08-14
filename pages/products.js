import Layout from "../components/Layout";
import Product from "../components/Product";
import client from "../components/ApolloClient";
import PRODUCTS_AND_CATEGORIES_QUERY from "../queries/product-and-categories";

const Products = (props) => {
  const { products, productCategories } = props;
  // console.log(client);

  return (
    <Layout>
      <h2 className="mt-5 text-center">Products</h2>
      <div className="product-container row">
        {products.length
          ? products.map((product) => (
              <Product key={product.id} product={product} />
            ))
          : ""}
      </div>
    </Layout>
  );
};

Products.getInitialProps = async () => {
  // console.log("client", client);
  const result = await client.query({
    query: PRODUCTS_AND_CATEGORIES_QUERY,
  });
  // console.log("result", result);
  return {
    productCategories: result.data.productCategories.nodes,
    products: result.data.products.nodes,
  };
};

export default Products;
