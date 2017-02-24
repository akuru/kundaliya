import React, { Component } from 'react';
import * as firebase from 'firebase';
import Modal from 'boron/OutlineModal';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null
    };

    this.googleSignIn = this.googleSignIn.bind(this);
    this.hideError = this.hideError.bind(this);
  }

  componentDidMount() {
    const config = {
      apiKey: 'AIzaSyCHJ_1he6bthXCTMU6r6pXPmcULyqtMFDU',
      authDomain: 'kundaliya-test.firebaseapp.com',
      databaseURL: 'https://kundaliya-test.firebaseio.com',
      storageBucket: 'kundaliya-test.appspot.com',
      messagingSenderId: '599295915329'
    };
    firebase.initializeApp(config);
  }

  hideError() {
    this.refs.errorBox.hide();
  }

  googleSignIn() {
    const provider = new firebase.auth.GoogleAuthProvider();

    firebase.auth().signInWithPopup(provider).then((result) => {
      const user = result.user;

      this.setState({
        user: {
          uid: user.uid,
          avatar: user.photoURL,
          name: user.displayName,
          email: user.email
        }
      });
    }).catch(() => {
      this.refs.errorBox.show();
    });
  }

  render() {
    const { user } = this.state;

    return (
      <div className="App">
        <div className="main-content">
          <h1 className="app-title">කුණ්ඩලිය / Kundaliya</h1>
          <div className="kunadliya-description">
            විරාම ලක්‍ෂණය කුණ්ඩලිය නමිවේ. මෙය යෙදෙන්නේ කිසියම් ශබ්දයක් සංකේතවත් කිරීමට නොවන
            බැවින් සිංහල හෝඩියට අනුව අකුරක්වත් පිල්ලක් වත් නොවේ. වාක්‍යයක් හෝ ඡේදයක් හෝ අවසන්
            වන බව හඟවනු වස් මෙම කුණ්ඩලිය යෙදෙයි. කුණ්ඩලිය, සිංහල භාෂාවට අනන්‍ය විරාම ලක්‍ෂණයකි
          </div>
          <h2 className="kunadliya">෴</h2>
          <div className="app-description">
            <span className="app-description-text">
              Make your Own Kundaliya: Share your version of Sinhala Kundaliya
            </span>
          </div>

          <br />

          {!user &&
            <div className="signin-container">
              <div className="signin-text">
                <span>Please sign in first...</span>
              </div>

              <button
                className="signin-btn google"
                onClick={this.googleSignIn}
              >
                <i className="fa fa-google" aria-hidden="true" />
                Sign in with Google
              </button>

              <button className="signin-btn facebook">
                <i className="fa fa-facebook" aria-hidden="true" />
                Sign in with Facebook
              </button>

              <button className="signin-btn github">
                <i className="fa fa-github-alt" aria-hidden="true" />
                Sign in with GitHub
              </button>
            </div>
          }


          {/* <button
            onClick={() => {
              const provider = new firebase.auth.GoogleAuthProvider();

              firebase.auth().signInWithPopup(provider).then((result) => {
                const token = result.credential.accessToken;
                const user = result.user;
                console.log('d', result);
              }).catch((error) => {
                const errorCode = error.code;
                const errorMessage = error.message;
                const email = error.email;
                const credential = error.credential;
                console.log('d', error);
              });
            }}
          >G SignIn</button> */}
        </div>

        <Modal
          ref="errorBox"
          keyboard={this.callback}
          modalStyle={{
            backgroundColor: 'transparent'
          }}
        >
          <div className="error-box">
            <h4>Oops!</h4>
            <p>Something went wrong! Please try again.</p>
            <button
              onClick={this.hideError}
            >Ok</button>
          </div>
        </Modal>
      </div>
    );
  }
}

export default App;
