/* eslint-disable */
import React from 'react';
import '../../css/bootstrap.min.css'
import '../../css/style.min.css'
import '../../css/mdb.min.css'
import '../../css/dopeStyle.css'
import Container from 'react-bootstrap/Container'
import Modal from 'react-bootstrap/Modal'
import Form from 'react-bootstrap/Form'
import db from "../../firebase";

const auth = db.auth();
// const changeClubURL = 'https://us-central1-libwalk-721c2.cloudfunctions.net/changeClub'
// const localChangeClub = (e) => {
// 	const{email, password} = e.target.elements;
// 	return fetch( changeClubURL, {mode: 'cors', method: 'POST', body: {"email": email, "password": password}})
// 		.then((resp) => resp.json());
// };

/**
 * This class shows the page for the administrator to edit and manage their org, as well as send out announcements. *
 */
class AdminLogin extends React.Component {

    /**
     * Constructor, called when app is run.
     *
     * @param props parent properties.
     */
    constructor(props) {
        super(props);
        this.state = {
            adminId: "",
            login: true
        };
        this.handleLoginWithEmail = this.handleLoginWithEmail.bind(this);
        this.registerTime = this.registerTime.bind(this);
    }

    /**
     * Handles the login for the administrator, using their google email.
     * @param e email to register with.
     * @return {Promise<void>}
     */
    async handleLoginWithEmail(e) {
        try {
            e.preventDefault();
            db.auth()
                .signInWithEmailAndPassword(e.target[0].value, e.target[1].value)
                .then(() => {
                    console.log("success")
                })
                .catch(function (error) {
                    let error_code = error.code;
                    let error_msg = error.message;
                    if (error_code === 'auth/wrong-password') {
                        alert("Wrong password");
                    } else {
                        alert(error_msg);
                    }
                });
            auth.onAuthStateChanged((user) => {
                if (user && user.providerData[0].providerId === "password") {
                    this.setState({adminId: user.uid});
                    db.firestore().collection("Clubs").doc(user.uid).get()
                        .then((doc) => {
                            if (doc.exists) {
                                this.props.history.push('/admin_home');
                            } else {
                                this.registerTime();
                            }
                        });
                }
            });
        } catch (error) {
            alert(error);
        }
    };

    /**
     * Re-routes the user to the home page after a user has logged in.
     */
    view_switch_user_login = () => {
        this.props.history.push('/login');
    };

    /**
     * Changes the state to reflect that the user has registered, but not logged in.
     */
    registerTime = () => {
        this.setState({login: false})
    };

    /**
     * Changes the state to reflect that a user has logged in.
     */
    loginTime = () => {
        this.setState({login: true})
    };


    render() {
        return (
            <div className='mt-5 pt-5'>
                <Modal.Dialog style={{display: this.state.login ? 'block' : 'none'}}>
                    <Modal.Header>
                        <Modal.Title>Sign In</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Container id="numberOneContainerNA">
                            <Form className="text-center p-5" onSubmit={this.handleLoginWithEmail}>
                                {/* Email */}
                                <Form.Control type="email" id="defaultLoginFormEmail" className="form-control mb-4"
                                              placeholder="E-mail"/>
                                {/* Password */}
                                <Form.Control type="password" id="defaultLoginFormPassword"
                                              className="form-control mb-4"
                                              placeholder="Password"/>
                                <div className="d-flex justify-content-around">
                                    <div>
                                        {/* Forgot password */}
                                        <a href={'#'}>Forgot password?</a>
                                    </div>
                                </div>
                                {/* Sign in button */}
                                <button className="btn btn-info btn-block my-4" type="submit">Sign in
                                </button>
                                {/* Register */}
                                <p>Not a member?
                                    <a href={'#'} onClick={this.registerTime} style={{color: "#4169E1"}}> Register</a>
                                </p>
                                <p>Logging in as a student?
                                    <a href={'#'} onClick={this.view_switch_user_login}
                                       style={{color: "#4169E1"}}> Student Log
                                        In</a>
                                </p>
                            </Form>
                        </Container>
                    </Modal.Body>
                </Modal.Dialog>

                <Modal.Dialog style={{display: this.state.login ? 'none' : 'block'}}>
                    <Modal.Header closeButton>
                        <Modal.Title>Register</Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Container id="numberOneContainerNA">
                            <Form className="text-center p-5">
                                {/* Name */}
                                <Form.Control type="name" className="form-control mb-4"
                                              placeholder="Name"/>
                                {/* Email */}
                                <Form.Control type="email" id="defaultLoginFormEmail" className="form-control mb-4"
                                              placeholder="E-mail"/>
                                {/* Major */}
                                <Form.Control type="major" className="form-control mb-4"
                                              placeholder="Major"/>
                                {/* Year */}
                                <Form.Control type="year" className="form-control mb-4"
                                              placeholder="Year"/>
                                {/* Password */}
                                <Form.Control type="password" id="defaultLoginFormPassword"
                                              className="form-control mb-4"
                                              placeholder="Password"/>

                                {/* Sign in button */}
                                <button className="btn btn-info btn-block my-4" type="submit">Create Account</button>
                                {/* Register */}
                                <p>Already registered?
                                    <a onClick={this.loginTime} href={'#'}> Login</a>
                                </p>
                            </Form>
                        </Container>
                    </Modal.Body>
                </Modal.Dialog>
            </div>);


    }
}

export default AdminLogin;
