const Footer = () => (
  <footer className="footer">
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
          className="footer-link fa fa-github"
          target="_blank"
        ></a>
      </li>
      <li>
        <a href="https://joelpek.github.io/" target="_blank">
          <i className="footer-link fas fa-info"></i>
        </a>
      </li>
      <li>
        <a
          href="https://linkedin.com/in/joelpekari/"
          className="footer-link fa fa-linkedin"
          target="_blank"
        ></a>
      </li>
    </ul>
    <ul className="footer-links2">
      <li>
        <a href="/t-and-c">
          <i className="footer-link fas fa-file-contract"></i>
          <p className="footer-links2-text">
            Terms and Conditions
          </p>
        </a>
      </li>
      <li>
        <a href="/privacy-policy">
          <i className="footer-link fas fa-user-shield"></i>
          <p className="footer-links2-text">
            Privacy Policy
          </p>
        </a>
      </li>
    </ul>
  </footer>
);

export default Footer;
