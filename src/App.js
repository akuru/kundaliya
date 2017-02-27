import React, { Component } from 'react';
import * as firebase from 'firebase';
import Modal from 'boron/OutlineModal';
import Dropzone from 'react-dropzone';
import uuid from 'uuid/v4';
import ProgressButton from 'react-progress-button';
import notie from 'notie';
import _ from 'lodash';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      user: null,
      droppedFiles: [],
      uploading: '',
      error: 'Something went wrong! Please try again.',
      images: [],
      fileMeta: {}
    };

    this.googleSignIn = this.googleSignIn.bind(this);
    this.hideErrorBox = this.hideErrorBox.bind(this);
    this.onDrop = this.onDrop.bind(this);
    this.renderFilePreviews = this.renderFilePreviews.bind(this);
    this.clearDrop = this.clearDrop.bind(this);
    this.uploadFiles = this.uploadFiles.bind(this);
    this.signOut = this.signOut.bind(this);
    this.facebookSignIn = this.facebookSignIn.bind(this);
    this.githubSignIn = this.githubSignIn.bind(this);
    this.updateFileTitle = this.updateFileTitle.bind(this);
    this.updateFileDescription = this.updateFileDescription.bind(this);
  }

  componentDidMount() {
    // const config = {
    //   apiKey: 'AIzaSyCHJ_1he6bthXCTMU6r6pXPmcULyqtMFDU',
    //   authDomain: 'kundaliya-test.firebaseapp.com',
    //   databaseURL: 'https://kundaliya-test.firebaseio.com',
    //   storageBucket: 'kundaliya-test.appspot.com',
    //   messagingSenderId: '599295915329'
    // };
    const config = {
      apiKey: 'AIzaSyA87qw3ZxOIPssAos11at-nV9e4g0Yr_68',
      authDomain: 'kundaliya-7cee6.firebaseapp.com',
      databaseURL: 'https://kundaliya-7cee6.firebaseio.com',
      storageBucket: 'kundaliya-7cee6.appspot.com',
      messagingSenderId: '813031245764'
    };
    firebase.initializeApp(config);

    const fetchImages = () => {
      firebase.database().ref('uploads/').on('value', (fetchedData) => {
        const images = fetchedData.val();

        this.setState({
          images
        });

        const $ = window.$;

        $('#gallery').justifiedGallery({
          rowHeight: 140
        });
      });
    };

    fetchImages();

    window.setInterval(() => {
      fetchImages();
    }, 60000);
  }

  hideErrorBox() {
    this.refs.errorBox.hide();

    this.setState({
      error: 'Something went wrong! Please try again.'
    });
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
    }).catch((error) => {
      if (error && error.message) {
        this.setState({
          error: error.message
        });
      }

      this.refs.errorBox.show();
    });
  }

  facebookSignIn() {
    const provider = new firebase.auth.FacebookAuthProvider();

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
    }).catch((error) => {
      if (error && error.message) {
        this.setState({
          error: error.message
        });
      }

      this.refs.errorBox.show();
    });
  }

  githubSignIn() {
    const provider = new firebase.auth.GithubAuthProvider();

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
    }).catch((error) => {
      if (error && error.message) {
        this.setState({
          error: error.message
        });
      }

      this.refs.errorBox.show();
    });
  }

  signOut() {
    firebase.auth().signOut().then(() => {
      notie.alert(1, 'Successfully Signed Out!', 5);

      this.setState({
        user: null,
        droppedFiles: [],
        uploading: ''
      });
    }, () => {
      this.refs.errorBox.show();
    });
  }

  onDrop(acceptedFiles) {
    const { droppedFiles } = this.state;

    acceptedFiles.forEach((file) => {
      const fileExist = droppedFiles.find(droppedFile => droppedFile.name === file.name);

      if (!fileExist) {
        droppedFiles.push(file);
      }
    });

    this.setState({
      droppedFiles: _.uniq(droppedFiles)
    });
  }

  renderFilePreviews() {
    const { droppedFiles } = this.state;

    return droppedFiles.map((file, index) =>
      <div
        className="file-preview"
        key={index}
      >
        <div className="file-preview-box">
          <img
            src={file.preview}
            alt={file.name}
          />
          <span>{file.name}</span>
        </div>
        <div className="file-details">
          <div className="file-form">
            <input
              type="text"
              placeholder="Title"
              onChange={event => this.updateFileTitle(file.name, event.target.value)}
            />
            <textarea
              placeholder="Description"
              cols="20"
              rows="3"
              onChange={event => this.updateFileDescription(file.name, event.target.value)}
            />
          </div>

        </div>
      </div>
    );
  }

  clearDrop() {
    this.setState({
      droppedFiles: []
    });
  }

  uploadFiles() {
    const { droppedFiles, user, fileMeta } = this.state;

    if (droppedFiles.length !== 0) {
      this.setState({
        uploading: 'loading'
      });

      const storageRef = firebase.storage().ref();


      droppedFiles.forEach((file) => {
        const fileName = `${user.uid}-${uuid()}`;

        const fileRef = storageRef.child(fileName);

        fileRef.put(file).then((snapshot) => {
          this.setState({
            uploading: '',
            droppedFiles: []
          });


          if (snapshot.a) {
            const database = firebase.database();

            const fileData = {
              userId: user.uid,
              userName: user.name,
              fileName,
              filePath: snapshot.a.fullPath,
              downloadURLs: snapshot.a.downloadURLs,
              downloadURL: snapshot.a.downloadURLs[0],
              title: '',
              description: ''
            };

            const currentFileMeta = fileMeta[file.name];

            if (currentFileMeta && currentFileMeta.title) {
              fileData.title = currentFileMeta.title;
            }

            if (currentFileMeta && currentFileMeta.description) {
              fileData.description = currentFileMeta.description;
            }

            database.ref(`uploads/${fileName}`).set(fileData);

            notie.alert(1, 'Files uploaded successfully!', 5);
          } else {
            this.refs.errorBox.show();
          }
        });
      });
    }
  }

  updateFileTitle(fileName, value) {
    const { fileMeta } = this.state;

    const existingMeta = fileMeta[fileName];

    fileMeta[fileName] = {
      ...existingMeta,
      title: value
    };

    this.setState({
      fileMeta
    });
  }

  updateFileDescription(fileName, value) {
    const { fileMeta } = this.state;

    const existingMeta = fileMeta[fileName];

    fileMeta[fileName] = {
      ...existingMeta,
      description: value
    };

    this.setState({
      fileMeta
    });
  }

  render() {
    const { user, droppedFiles, uploading, error, images } = this.state;

    const imagesArray = _.values(images);

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

              <button
                className="signin-btn facebook"
                onClick={this.facebookSignIn}
              >
                <i className="fa fa-facebook" aria-hidden="true" />
                Sign in with Facebook
              </button>

              <button
                className="signin-btn github"
                onClick={this.githubSignIn}
              >
                <i className="fa fa-github-alt" aria-hidden="true" />
                Sign in with GitHub
              </button>
            </div>
          }

          {user &&
            <div className="dropzone-container">
              <Dropzone
                onDrop={this.onDrop}
                className="dropzone"
                activeClassName="dropzone-active"
                accept="image/*"
              >
                <p>Try dropping some files here, or click to select files to upload.</p>
              </Dropzone>
              <br />
              {(droppedFiles.length !== 0) &&
                this.renderFilePreviews()
              }
              <br />
              <div className="drop-actions">
                <ProgressButton
                  onClick={this.uploadFiles}
                  state={uploading}
                  className="upload"
                >
                  Upload
                </ProgressButton>
                <button className="clear" onClick={this.clearDrop}>Clear</button>
              </div>
              <div className="session-actions">
                <button className="logout" onClick={this.signOut}>Logout</button>
              </div>
            </div>
          }

          {imagesArray.length !== 0 &&
            <div className="gallery">
              <br />
              <div id="gallery">
                {imagesArray.map((image, index) =>
                  <a
                    key={index}
                    href={image.downloadURL}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="image"
                    data-lightbox="gallery"
                    data-title={`${image.title}${image.title && ' '}By ${image.userName}. ` +
                    `${image.description}`}
                  >
                    <img
                      src={image.downloadURL}
                      alt={`${image.title}${image.title && ' '}By ${image.userName}. ` +
                      `${image.description}`}
                    />
                  </a>)}
              </div>
            </div>
          }
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
            <p>{error}</p>
            <button
              onClick={this.hideErrorBox}
            >Ok</button>
          </div>
        </Modal>

        <footer>
          <div className="credits">
            <i className="fa fa-terminal" aria-hidden="true" />
            &nbsp;
            <i className="fa fa-heart" aria-hidden="true" />
            &nbsp;Developed by&nbsp;
            <a
              target="_blank"
              rel="noopener noreferrer"
              href="http://leafycode.com/"
            >LeafyCode</a>
            &nbsp;for the Akuru Collective
          </div>
        </footer>
      </div>
    );
  }
}

export default App;
