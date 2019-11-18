import React from "react";
import NavBar from "../navbar";
import Carousel from 'react-bootstrap/Carousel'
import Card from 'react-bootstrap/Card'
import Button from "react-bootstrap/Button";
import Col from "react-bootstrap/Col";
import CardDeck from "react-bootstrap/CardDeck";
import {getClubs} from "../cloud";

class Home extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            orgs: []
        };

        // GET /getClubs & set the state when the api response is recieved
        getClubs().then((json) => {
            this.setState({orgs: json.clubs});
        });

        if (this.state.orgs === undefined) {
            this.state = {
                orgs: []
            };
        }
    }

    render() {
        if (this.state.orgs === undefined) {
            this.state = {
                orgs: []
            };
        }
        return (
            <div>
                <NavBar/>
                actual page
                <main className='mt-5 pt-5'>
                    <div className='container centerPage'>
                        <div className='row centerPage'>
                            <NavBar {...this.props}/>
                            {/*<h1> Welcome</h1>*/}
                            {/* org carousel here*/}
                            <div>
                                {console.log(JSON.stringify(this.state.orgs))}
                                {this.org_carousel(this.state.orgs)}
                            </div>

                            {/*Rest of the page here*/}
                            <div className='home_grid_container'>
                                {this.org_grid(this.state.orgs)}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        );
    }

    org_grid = (orgs) => {
        let grid_items = [];
        let numcols = 4;
        let numrows = orgs.length / numcols;
        numrows = Math.ceil(numrows);

        orgs.forEach(function (e) {
            grid_items.push(org_grid_component(e));
        });

        let grid = [];

        for (let i = 0; i <= numrows; i++) {
            let row = [];
            for (let j = 0; j < numcols; j++) {
                row.push(
                    <div className='home_grid_component'>
                        <Col>
                            {grid_items[i * numcols + j]}
                        </Col>
                        <div>
                            <br />
                        </div>
                    </div>
                )
            }
            grid.push(row)
        }

        return (
            <div>
                <CardDeck> {grid} </CardDeck>
            </div>
        );
    };

    org_carousel = (orgs) => {
        orgs = orgs.slice(0, 5);
        let carousel_items = [];
        orgs.forEach(function (e) {
            carousel_items.push(one_carousel_item(e));
        });

        return (
            <div className='carousel'>
                <Carousel>
                    {carousel_items}
                </Carousel>
            </div>
        );
    };
}


let one_carousel_item = (org) => {
    return (
        <Carousel.Item>
            <img
                className="d-block w-100"
                // src={org.img}
                alt={org.alt}
                src={org.img}
            />
            <Carousel.Caption>
                <h3>{org.name}</h3>
                <p>{org.desc}</p>
            </Carousel.Caption>
        </Carousel.Item>

    );
};

let org_grid_component = (org) => {
    org = Object.values(org)[0]
    console.log(JSON.stringify(org));
    org.img = 'https://picsum.photos/150/50';

    return (
        <div>
            {/*<Card style={{width: '18rem'}}>*/}
            <Card style={{width: '20rem', height: '36rem'}} className='text-center'>
                <Card.Img variant="top" src={org.img}/>
                <Card.Body>
                    <Card.Title>{org.clubName}</Card.Title>
                    <Card.Text>
                        <small className="scroll-box">{org.description.slice(0, 450)}</small>
                    </Card.Text>
                    <Button variant="primary" href={org.pageURL}>Org Home</Button>
                </Card.Body>
            </Card>
        </div>
    )
};


export default Home;


function shuffle(array) {
    array.sort(() => Math.random() - 0.5);
}
