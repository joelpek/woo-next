import Layout from "../components/Layout";
import ParentCategoriesBlock from "../components/category/category-block/ParentCategoriesBlock";
import PRODUCTS_AND_CATEGORIES_QUERY from "../queries/product-and-categories";
import client from "../components/ApolloClient";

const Index = (props) => {
  const { productCategories } = props;

  return (
    <Layout>
      <div className="basic-text mt-5 text-center">
        <h3>IT insight on demand</h3>
        <b>Welcome to ePro.dev!</b>
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
  // console.log(result);

  return {
    productCategories: result.data.productCategories.nodes,
    products: result.data.products.nodes,
  };
};

export default Index;
