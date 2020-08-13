const withCSS = require("@zeit/next-css");
module.exports = withCSS();
module.exports = {
  webpack: (config, { isServer }) => {
    // Fixes npm packages that depend on `fs` module
    if (!isServer) {
      config.node = {
        fs: "empty",
        net: "empty",
      };
    }
    // module.exports = {
    //   externals: ["express"],
    //   module: {
    //     noParse: function (content) {
    //       return /express/.test(content);
    //     },
    //   },
    // };

    return config;
  },
};
