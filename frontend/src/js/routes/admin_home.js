import React from 'react'
import NavBar from "../navbar";
import {getClubs} from "../cloud";
import {createAnnouncements, changeClub, getClub, getEvent, changeEvent, changeTag, getTag} from "../cloud";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
import Button from "react-bootstrap/Button";
import EachEvent from "./eachEvent"
import db from "../../firebase.js";
import Container from "react-bootstrap/Container";
import Row from "react-bootstrap/Row";
import Col from "react-bootstrap/Col";
import Card from "react-bootstrap/Card";
import ListGroup from "react-bootstrap/ListGroup";
import ListGroupItem from "react-bootstrap/ListGroupItem";


/**
 * Component responsible for creating the Admin Home Page.
 */
class AdminHome extends React.Component {
    // class and overridden methods
    constructor(props) {
        super(props);

        this.state = {
            editInfo: false,
            editTag: false,
            editEvent: false,
            createEvent: false,
            createAnn: false,
            org_id: "",
            tag: "",
            org: {
                clubReference: '',
                clubName: '',
                contactEmail: '',
                description: '',
                pictureURL: '',
                tags: [],
                pageURL: '',
                announcements: [],
                emailList: []
            },
            event: {
                eventReference: '',
                description: '',
                eventName: '',
                location: '',
                pictureURL: '',
                rsvpForm: '',
                time: ''
            },
            tagInfo: {
                clubs: [],
                tagID: ''
            },
            announcement: {
                annDetail: '',
                time: '',
                annReference: ''
            }
        };

        this.closeInfo = this.closeInfo.bind(this);
        this.closeTag = this.closeTag.bind(this);
        this.closeEvent = this.closeEvent.bind(this);
        this.closeAnn = this.closeAnn.bind(this);
        this.handleCreateAnn = this.handleCreateAnn.bind(this);
        this.handleEditInfo = this.handleEditInfo.bind(this);
        this.handleEditTag = this.handleEditTag.bind(this);
        this.handleEditEvent = this.handleEditEvent.bind(this);
        this.editHandleClub = this.editHandleClub.bind(this);
        this.editHandleTag = this.editHandleTag.bind(this);
        this.editHandleEditEvent = this.editHandleEditEvent.bind(this);
        this.editHandleCreateEvent = this.editHandleCreateEvent.bind(this);
        this.handleLogOut = this.handleLogOut.bind(this);
        this.editHandleCreateAnn = this.editHandleCreateAnn.bind(this);
    };

    /**
     * Set-up function that is called when the user is first directed to the
     * admin home page
     */
    componentDidMount() {
        // This code will get the admin's information to display on the page and store it in state
        db.auth().onAuthStateChanged(firebaseUser => {
            if (firebaseUser && firebaseUser.providerData[0].providerId === "password") {
                this.setState({
                    org_id: firebaseUser.uid
                });
                getClub(firebaseUser.uid).then(clubInfo => {
                    if (clubInfo === undefined) {
                        this.setState({
                            clubReference: 'Failure getClub()',
                            clubName: 'Failure getClub()',
                            contactEmail: 'Failure getClub()',
                            description: 'Failure getClub()',
                            pictureURL: 'Failure getClub()',
                            tags: 'Failure getClub()',
                            pageURL: 'Failure getClub()',
                            emailList: 'Failure getClub()',
                            announcements: 'Failure getClub()'

                        })

                    } else {
                        this.setState({
                            org: clubInfo
                        })

                    }

                })
            }
        });

        // This code will fetch events for the admin based on the event id
        getEvent('event_id_00').then(eventInfo => {
            if (typeof eventInfo !== "undefined") {
                this.setState({
                    event: {
                        eventReference: eventInfo['eventReference'],
                        description: eventInfo['description'],
                        eventName: eventInfo['eventName'],
                        location: eventInfo['location'],
                        pictureURL: eventInfo['pictureURL'],
                        rsvpForm: eventInfo['rsvpForm'],
                        time: eventInfo['time'],
                    }
                })

            } else {
                this.setState({
                    event: {
                        eventReference: "Failure getEvent()",
                        description: "Failure getEvent()",
                        eventName: "Failure getEvent()",
                        location: "Failure getEvent()",
                        pictureURL: "Failure getEvent()",
                        rsvpForm: "Failure getEvent()",
                        time: "Failure getEvent()",
                    }
                })

            }
        })
    }

    // Handler Methods
    /**
     * Handles what happens when you change a club's details.
     */
    async editHandleClub(e) {
        e.preventDefault();
        await this.setState({
            org: {
                clubName: e.target[0].value,
                contactEmail: e.target[1].value,
                pictureURL: e.target[2].value,
                description: e.target[3].value,
                clubReference: this.state.org.ref,
                tags: this.state.org.tags,
                announcements: this.state.org.announcements,
                pageURL: this.state.org.pageURL
            }
        });
        await changeClub(this.state.org.clubReference, this.state.org);
        alert('Updated');
        this.closeInfo();
    };

    /**
     * Handles what happens when you change a club tag
     *
     */
    async editHandleTag(e) {
        e.preventDefault();
        console.log(e.target[0].value)
        if (e.target[0].value === "") {
            alert('Please Enter a Tag');
            return;
        }
        await this.setState({
            tag: e.target[0].value.toLowerCase()
        });
        db.firestore().collection("Tags").doc(this.state.tag).get()
            .then((doc) => {
                if (doc.exists) {
                    getTag(this.state.tag).then(tagClubs => {
                        this.setState({
                            tagInfo: {
                                clubs: tagClubs['clubs'],
                                tagID: tagClubs['tagID']
                            }
                        })
                    })
                    if (this.state.tagInfo.clubs.includes(this.state.org.clubReference) === false) {
                        this.state.tagInfo.clubs.push(this.state.org.clubReference);
                        changeTag(this.state.tag, this.tagInfo);
                    }
                } else {
                    this.setState({
                        tagInfo: {
                            clubs: [this.state.org.clubReference],
                            tagID: this.state.tag
                        }
                    })
                    changeTag(this.state.tag, this.state.tagInfo);
                }
            });

        if (this.state.org.tags.includes(this.state.tag) === false) {
            this.state.org.tags.push(this.state.tag);
            changeClub(this.state.org.clubReference, this.state.org);
        }
        console.log(this.state.clubReference);
        alert('Updated');
        this.closeTag();
    };

    /**
     * Handles what happens when you change a clubs event details
     *
     */
    async editHandleEditEvent(e) {
        e.preventDefault();
        await this.setState({
            event: {
                eventName: e.target[0].value,
                location: e.target[1].value,
                time: e.target[2].value,
                pictureURL: e.target[3].value,
                description: e.target[4].value,
                rsvpForm: e.target[5].value,
                eventReference: this.state.eventReference
            }
        })
        await changeEvent(this.state.event.eventReference, this.state.event);
        alert('Updated');
        this.closeEvent();
    }

    /**
     * Handles what happens when you create an event for a club.
     *
     */
    async editHandleCreateEvent(e) {
        e.preventDefault();
        if (!e.target[0].value || !e.target[1].value || !e.target[2].value ||
            !e.target[4].value) {
            alert('Please make sure to have name, location, time, and description');
            return;
        }
        await this.setState({
            event: {
                eventName: e.target[0].value,
                location: e.target[1].value,
                time: e.target[2].value,
                pictureURL: e.target[3].value,
                description: e.target[4].value,
                rsvpForm: e.target[5].value,
                eventReference: this.state.org.clubReference + e.target[0].value + e.target[2].value
            }
        });

        console.log(this.state.eventReference);
        await db.firestore().collection("Events").doc(this.state.event.eventReference).get()
            .then((doc) => {
                if (doc.exists) {
                    alert('You already have an event like this');
                    return;
                } else {
                    changeEvent(this.state.event.eventReference, this.state.event);
                    alert('Event Created');
                    this.closeCEvent();
                }
            });
    }

    /**
     * Handles what happens when you create an announcement for a club.
     *
     */
    async editHandleCreateAnn(e) {
        e.preventDefault();
        if (!e.target[0].value || !e.target[1].value) {
            alert('Please make sure to have announcement, and time');
            return;
        }
        await this.setState({
            announcement: {
                annDetail: e.target[0].value,
                time: e.target[1].value,
                annReference: this.state.org.clubReference + e.target[0].value
            }

        })
        console.log(this.state.annReference);
        await db.firestore().collection("Announcements").doc(this.state.announcement.annReference).get()
            .then((doc) => {
                if (doc.exists) {
                    alert('You already have an announcement like this');
                    return;
                }
                else {
                    createAnnouncements(this.state.announcement.annReference, this.state.announcement);
                    if (this.state.org.announcements === undefined) {
                        this.state.org = {
                            announcements: ''
                        }
                    }
                    else {
                        if (this.state.org.announcements.includes(this.state.announcement.annReference) === false) {
                            this.state.org.announcements.push(this.state.announcement.annReference);
                          changeClub(this.state.org.clubReference, this.state.org);
                        }
                    }
                    alert('Announcement Created');
                    this.closeAnn();
                }

            });
    }

    /**
     * Handles the authorization logic for logging out
     */
    handleLogOut() {
        db.auth().signOut().then((result) => {
            this.setState({
                org: null
            })
        });
        this.props.history.push('/admin_login');
    };

    /**
     * Handles the state change on editing the org's information.
     */
    handleEditInfo = () => {
        this.setState({editInfo: true})
    };

    /**
     * Handles the state change on editing an organization's tag.
     */
    handleEditTag = () => {
        this.setState({editTag: true})
    };

    /**
     * Handles the state change when you edit and org's event.
     */
    handleEditEvent = () => {
        this.setState({editEvent: true})
    };

    handleCreateEvent = () => {
        this.setState({createEvent: true})
    };

    /**
     * Handles the state change when you edit and org's announcement.
     */
    handleCreateAnn = () => {
        this.setState({createAnn: true})
    };

    // Action Methods
    /**
     * Changes the state for helping render certain elements.
     */

    closeInfo = () => {
        this.setState({
            editInfo: false
        })
    };

    /**
     * Changes the state for helping render certain elements.
     */
    closeTag = () => {
        this.setState({
            editTag: false
        })
    };

    /**
     * Changes the state for helping render certain elements.
     */
    closeEvent = () => {
        this.setState({
            editEvent: false
        })
    };

    /**
     * Changes the state for helping render certain elements
     */
    closeCEvent = () => {
        this.setState({
            createEvent: false
        })
    };

    /**
     * Changes the state for helping render certain elements
     */
    closeAnn = () => {
        this.setState({
            createAnn: false
        })
    };

    // container components
    /**
     * Creates a container for the Settings panel for the admin.
     */
    button_container = () => {
        return (
            <div>
                {/*Code for button modals*/}
                {this.modal_edit_clubs()}
                {this.modal_edit_tag()}
                {this.modal_edit_event()}
                {this.modal_create_event()}
                {this.modal_create_ann()}

                {/*Card that contains the buttons*/}
                <Card>
                    <Card.Header style={{backgroundColor: '#006A96', color: 'white'}}>Your Settings</Card.Header>

                    <ListGroup variant="flush">
                        <ListGroup.Item>
                            <Card.Link onClick={this.handleEditInfo}>Edit Club</Card.Link></ListGroup.Item>
                        <ListGroup.Item>
                            <Card.Link onClick={this.handleEditTag}>Edit Tags</Card.Link></ListGroup.Item>
                        <ListGroup.Item>
                            <Card.Link onClick={this.handleEditEvent}>Edit Event</Card.Link></ListGroup.Item>
                        <ListGroup.Item>
                            <Card.Link onClick={this.handleCreateEvent}>Create Event</Card.Link></ListGroup.Item>
                        <ListGroup.Item>
                            <Card.Link onClick={this.handleCreateAnn}>Create Announcement</Card.Link></ListGroup.Item>
                        <ListGroup.Item>
                            <Card.Link onClick={this.handleLogOut}>Log Out</Card.Link></ListGroup.Item>
                    </ListGroup>
                </Card>
            </div>
        )
    };

    // modals
    /**
     * Generates the jsx code to create and handle logic for a modal component to edit a clubs events.
     * @returns {*}
     */
    modal_edit_event = () => {
        return (
            <div>
                <Modal
                    size="lg"
                    show={this.state.editEvent}
                    onHide={this.closeEvent}
                    aria-labelledby="example-modal-sizes-title-lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-modal-sizes-title-lg">
                            Event Info
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form onSubmit={this.editHandleEditEvent}>
                            <Form.Group controlId="formName">
                                <Form.Label>Event Name</Form.Label>
                                <Form.Control type="name" placeholder="Enter Event Name"
                                              defaultValue={this.state.event.eventName}/>
                            </Form.Group>

                            <Form.Group controlId="formPlace">
                                <Form.Label>Location</Form.Label>
                                <Form.Control type="place" placeholder="Enter Location"
                                              defaultValue={this.state.event.locatioin}/>
                            </Form.Group>

                            <Form.Group controlId="formTime">
                                <Form.Label>Time</Form.Label>
                                <Form.Control type="timeS" placeholder="Enter Time"
                                              defaultValue={this.state.event.time}/>
                            </Form.Group>

                            <Form.Group controlId="formPic">
                                <Form.Label>Picture</Form.Label>
                                <Form.Control type="pic" placeholder="Enter Picture URL"
                                              defaultValue={this.state.event.pictureURL}/>
                            </Form.Group>

                            <Form.Group controlId="formDetails">
                                <Form.Label>Details</Form.Label>
                                <Form.Control type="details" placeholder="Enter Details"
                                              defaultValue={this.state.event.description}/>
                            </Form.Group>

                            <Form.Group controlId="formRSVP">
                                <Form.Label>RSVP</Form.Label>
                                <Form.Control type="rsvp" placeholder="Enter RSVP URL"
                                              defaultValue={this.state.event.rsvpForm}/>
                            </Form.Group>
                            {/*todo add form verification*/}
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>

            </div>
        )
    };

    /**
     * Generates the jsx code to create and handle logic for a modal component to edit a club's profile data.
     * @returns {*}
     */
    modal_edit_tag = () => {
        return (<div>
            <Modal
                size="sm"
                show={this.state.editTag}
                onHide={this.closeTag}
                aria-labelledby="example-modal-sizes-title-sm"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-sm">
                        Tag Info
                    </Modal.Title>
                </Modal.Header>
                <Modal.Body>

                    <Form onSubmit={this.editHandleTag}>
                        <Form.Group controlId="formName">
                            <Form.Control type="name" placeholder="Add Tag" defaultValue={this.state.org.tags}/>
                        </Form.Group>
                        <Button variant="success" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

        </div>);
    };

    /**
     * Generates the jsx code to create and handle logic for a modal component to edit a club's tag.
     * @returns {*}
     */
    modal_edit_clubs = () => {
        return (<div>
            <Modal
                size="lg"
                show={this.state.editInfo}
                onHide={this.closeInfo}
                aria-labelledby="example-modal-sizes-title-lg"
            >
                <Modal.Header closeButton>
                    <Modal.Title id="example-modal-sizes-title-lg">
                        Club Info
                    </Modal.Title>
                </Modal.Header>

                <Modal.Body>
                    <Form onSubmit={this.editHandleClub}>
                        <Form.Group controlId="formName">
                            <Form.Label>Club Name</Form.Label>
                            <Form.Control type="name" placeholder="Enter Club Name"
                                          defaultValue={this.state.org.clubName}/>
                        </Form.Group>
                        <Form.Group controlId="formName">
                            <Form.Label>Club Email</Form.Label>
                            <Form.Control type="name" placeholder="Enter Club Email"
                                          defaultValue={this.state.org.contactEmail}/>
                        </Form.Group>
                        <Form.Group controlId="formImage">
                            <Form.Label>Image URL</Form.Label>
                            <Form.Control type="name" placeholder="Enter Image URL"
                                          defaultValue={this.state.org.pictureURL}/>
                        </Form.Group>
                        <Form.Group controlId="formName">
                            <Form.Label>Description</Form.Label>
                            <Form.Control type="name" placeholder="Enter Club Description"
                                          defaultValue={this.state.org.description}/>
                        </Form.Group>
                        <Button variant="primary" type="submit">
                            Submit
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

        </div>)
    };

    /**
     * Generates the jsx code to create and handle logic for a modal component to create an event.
     * @returns {*}
     */
    modal_create_event = () => {
        return (
            <div>
                <Modal
                    size="lg"
                    show={this.state.createEvent}
                    onHide={this.closeCEvent}
                    aria-labelledby="example-modal-sizes-title-lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-modal-sizes-title-lg">
                            Create Event
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form onSubmit={this.editHandleCreateEvent}>
                            <Form.Group controlId="formName">
                                <Form.Label>Event Name</Form.Label>
                                <Form.Control type="name" placeholder="Enter Event Name"/>
                            </Form.Group>

                            <Form.Group controlId="formPlace">
                                <Form.Label>Location</Form.Label>
                                <Form.Control type="place" placeholder="Enter Location"/>
                            </Form.Group>

                            <Form.Group controlId="formTime">
                                <Form.Label>Time</Form.Label>
                                <Form.Control type="timeS" placeholder="Enter Time"/>
                            </Form.Group>

                            <Form.Group controlId="formPic">
                                <Form.Label>Picture</Form.Label>
                                <Form.Control type="pic" placeholder="Enter Picture URL"/>
                            </Form.Group>

                            <Form.Group controlId="formDetails">
                                <Form.Label>Details</Form.Label>
                                <Form.Control type="details" placeholder="Enter Details"/>
                            </Form.Group>

                            <Form.Group controlId="formRSVP">
                                <Form.Label>RSVP</Form.Label>
                                <Form.Control type="rsvp" placeholder="Enter RSVP URL"/>
                            </Form.Group>
                            {/*todo add form verification*/}
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    };

    modal_create_ann = () => {
        return (
            <div>
                <Modal
                    size="lg"
                    show={this.state.createAnn}
                    onHide={this.closeAnn}
                    aria-labelledby="example-modal-sizes-title-lg"
                >
                    <Modal.Header closeButton>
                        <Modal.Title id="example-modal-sizes-title-lg">
                            Create Announcement
                        </Modal.Title>
                    </Modal.Header>

                    <Modal.Body>
                        <Form onSubmit={this.editHandleCreateAnn}>
                            <Form.Group controlId="formName">
                                <Form.Label>Announcement</Form.Label>
                                <Form.Control type="name" placeholder="Enter Announcement"/>
                            </Form.Group>

                            <Form.Group controlId="formTime">
                                <Form.Label>Time</Form.Label>
                                <Form.Control type="timeS" placeholder="I.e. Nov 19, 2019"
                                              defaultValue={new Date()}/>
                            </Form.Group>

                            {/*todo add form verification*/}
                            <Button variant="primary" type="submit">
                                Submit
                            </Button>
                        </Form>
                    </Modal.Body>
                </Modal>
            </div>
        )
    };

    /**
     * Element for the main organization view.
     */
    admin_panel_view = () => {
        console.log('Org Data' + JSON.stringify(this.state.org));
        let showEvents = [];
        if (this.state.org.eventList !== undefined) {
            showEvents = this.state.org.eventList.map(event => {
                console.log(event)
                return <EachEvent eventId={event} {...this.props} />;
            });
        }
        return (
            <div>
                <Card style={{width: 'flex'}}>

                    <Card.Img src={this.state.org.pictureURL} style={{
                        width: '100%',
                        height: '15vw',
                        objectFit: 'cover'
                    }}/>
                    {/* <Card.Header style={{backgroundColor: '#006A96', color: 'white'}}>About Your Club</Card.Header> */}

                    <Card.Body>

                        <Card.Title>{this.state.org.clubName}</Card.Title>
                        <Card.Subtitle>{this.state.org.contactEmail} </Card.Subtitle>
                        <Card.Text>
                            {this.state.org.description}
                        </Card.Text>

                        <ListGroup className="list-group-flush">
                            <ListGroupItem>
                                <Card.Link href={this.state.org.pageURL}>Official Website</Card.Link>
                            </ListGroupItem>
                            <ListGroupItem>
                                Tags
                                {this.state.org.tags.map(tag => (
                                    <Button size="sm">
                                        {tag}
                                    </Button>
                                ))}
                            </ListGroupItem>
                            <ListGroupItem>
                                Events
                                {showEvents}
                            </ListGroupItem>
                        </ListGroup>

                    </Card.Body>

                </Card>
            </div>
        )
    };

    render() {
        // only admins should be able to see this page, redirect if the login type is not admin.
        // if (check_login_type() === 'user') {
        //     this.view_switch_login();
        // }

        return (
            <div>
                {/*start the rest of the page*/}
                <main className='mt-5 pt-5'>
                    <Container>
                        {/*<Row style={{flex: 5}}>*/}
                        <Row>
                            {/*<Col style={{flex: 8}}>*/}
                            <Col sm={4} lg={8} md={8}>
                                {this.admin_panel_view()}
                            </Col>
                            {/*<Col style={{flex: 2}}>*/}
                            <Col sm={4} lg={[2]} md={1}>
                                {this.button_container()}
                            </Col>
                        </Row>

                    </Container>


                </main>
            </div>
        );
    }


}

export default AdminHome;