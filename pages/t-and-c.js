import Layout from "../components/Layout";
import client from "../components/ApolloClient";
import GET_PAGES from "../queries/get-pages";

const TandC = (props) => {
  const { pages } = props;
  console.log(pages);
  
  let content
  pages.forEach((e) => {
    if (e.pageId === 627) content = e.content;
  });
  console.log(content);

  return (
    <Layout>
      <div className="mt-5 text-center">
        <h2>Terms and Conditions</h2>
      </div>
      <div
        className="content"
        dangerouslySetInnerHTML={{
          __html: content,
        }}
      ></div>
    </Layout>
  );
};

TandC.getInitialProps = async function () {
  const res = await client.query({
    query: GET_PAGES,
  });

  return {
    pages: res.data.pages.nodes,
  };
};

export default TandC;
