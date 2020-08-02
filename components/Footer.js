const Footer = () => (
  <div className="footer">
    <div className="footer-text">
      <p>© ePro Consulting 2020</p>
      <p className="text-gray">Made with 💙 and ☕️ in Finland.</p>
      <span className="text-gray"></span>
    </div>
    <ul className="footer-links1">
      {/* <li><a href="https://www.facebook.com/" className="fa fa-facebook" target="_blank"></a></li> */}
      {/* <li><a href="https://twitter.com/" className="fa fa-twitter" target="_blank"></a></li> */}
      {/* <li><a href="https://youtube.com/" className="fa fa-youtube" target="_blank"></a></li> */}
      {/* <li><a href="https://www.instagram.com//" className="fa fa-instagram" target="_blank"></a></li> */}
      <li>
        <a
          href="https://github.com/joelpek/"
          className="fa fa-github"
          target="_blank"
        ></a>
      </li>
      <li>
        <a href="https://joelpek.github.io/" target="_blank">
          <i className="fas fa-info"></i>
        </a>
      </li>
      <li>
        <a
          href="https://linkedin.com/in/joelpekari/"
          className="fa fa-linkedin"
          target="_blank"
        ></a>
      </li>
    </ul>
    <ul className="footer-links2">
      <li>
        <a href="/t-and-c">
          <i className="fas fa-file-contract"></i>
          Terms and Conditions
        </a>
      </li>
      <li>
        <a href="/privacy-policy">
          <i className="fas fa-user-shield"></i>
          Privacy Policy
        </a>
      </li>
    </ul>
  </div>
);

export default Footer;
