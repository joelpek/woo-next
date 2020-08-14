import Head from "next/head";
import Header from "./Header";
import Footer from "./Footer";

const Layout = (props) => {
  return (
          <div>
            <Head>
              <title>ePro.dev - IT insight on demand</title>
              <link
                rel="stylesheet"
                href="https://stackpath.bootstrapcdn.com/font-awesome/4.7.0/css/font-awesome.min.css"
              />
              <script defer src="https://kit.fontawesome.com/2b94fa3acb.js" crossOrigin="anonymous"></script>
              <link
                rel="stylesheet"
                href="https://bootswatch.com/4/spacelab/bootstrap.min.css"
              />
              <link
                rel="apple-touch-icon"
                sizes="180x180"
                href="/apple-touch-icon.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="32x32"
                href="/favicon-32x32.png"
              />
              <link
                rel="icon"
                type="image/png"
                sizes="16x16"
                href="/favicon-16x16.png"
              />
              <link rel="manifest" href="/site.webmanifest" />
              <link href="https://fonts.googleapis.com/css?family=Ubuntu" rel="stylesheet"></link>
              <meta name="msapplication-config" content="/browserconfig.xml" />
              <meta name="msapplication-TileColor" content="#ffffff" />
              <meta name="theme-color" content="#ffffff" />
            </Head>
            <div id="page-container">
              <div id="content-wrap">
                <Header />
                {props.children}
              </div>
              <div className="footer-wrap">
                <Footer />
              </div>
            </div>
          </div>
  );
};

export default Layout;
