import Layout from "../components/Layout";
import client from "../components/ApolloClient";
import ParentCategoriesBlock from "../components/category/category-block/ParentCategoriesBlock";
import GET_CATEGORIES_QUERY from "../queries/get-categories";

const Categories = (props) => {
  const { productCategories } = props;
  return (
    <Layout>
      {/*Categories*/}
      <h2>Categories</h2>
      <ParentCategoriesBlock productCategories={productCategories} />
    </Layout>
  );
};

Categories.getInitialProps = async () => {
  const result = await client({query: GET_CATEGORIES_QUERY});
  return {
    productCategories: result.data.productCategories.nodes,
  };
};

export default Categories;
