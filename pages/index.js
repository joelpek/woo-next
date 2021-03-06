import Layout from "../components/Layout";
import Product from "../components/Product";
import client from "../components/ApolloClient";
import ParentCategoriesBlock from "../components/category/category-block/ParentCategoriesBlock";
import PRODUCTS_AND_CATEGORIES_QUERY from "../queries/product-and-categories";

const Index = (props) => {
  const { products, productCategories } = props;

  return (
    <Layout>
      <div className="basic-text mt-5 text-center">
        <h3>IT insight on demand</h3>
        <b>Welcome to ePro Consulting.</b>
      </div>
      <div className="mt-5 text-center">
        <h2>Categories</h2>
        <ParentCategoriesBlock productCategories={productCategories} />
      </div>
    </Layout>
  );
};

Index.getInitialProps = async () => {
  const result = await client.query({
    query: PRODUCTS_AND_CATEGORIES_QUERY,
  });

  return {
    productCategories: result.data.productCategories.nodes,
    products: result.data.products.nodes,
  };
};

export default Index;
