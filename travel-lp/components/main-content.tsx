"use client";
import type { NextPage } from "next";
import {
  Container,
  Navbar,
  Nav,
  Button,
  NavDropdown,
  Form,
} from "react-bootstrap";
import styles from "./main-content.module.css";
import { Link } from "react-router-dom";
export type MainContentType = {
  className?: string;
};
const MainContent: NextPage<MainContentType> = ({ className = "" }) => {
  return (
    <section className={[styles.mainContent, className].join(" ")}>
      <header className={styles.frameParent}>
        <Navbar expand="lg">
          <Container>
            <Navbar.Brand href="#" className={styles.vectorParent}>
              <img className={styles.vectorIcon} alt="" src="/vector.svg" />
              <span className={styles.travlog}>TravelKaMaza</span>
            </Navbar.Brand>
            <Navbar.Toggle aria-controls="basic-navbar-nav" />
            <Navbar.Collapse id="basic-navbar-nav">
              <Nav
                className={`${styles.navigation} flex-grow-1 justify-content-end`}
              >
                <li className="nav-item">
                  <Nav.Link href="#clients" className={styles.clients}>
                    Clients
                  </Nav.Link>
                </li>
                <li className="nav-item">
                  <Nav.Link href="#services" className={styles.services}>
                    Services
                  </Nav.Link>
                </li>
                <li className="nav-item">
                  <Nav.Link
                    href="#top-destination"
                    className={styles.topDestination}
                  >
                    Top Destination
                  </Nav.Link>
                </li>
                <li className="nav-item">
                  <Nav.Link href="#travel-point" className={styles.travelPoint}>
                    Travel Point
                  </Nav.Link>
                </li>
                <li className="nav-item">
                  <Nav.Link href="#features" className={styles.features}>
                    Features
                  </Nav.Link>
                </li>
                <li className="nav-item">
                  <Nav.Link
                    href="#testimonials"
                    className={styles.testimonials}
                  >
                    Testimonials
                  </Nav.Link>
                </li>
                <div className="plan-trip">
                  <button className={styles.authButtons1}>Plan Trip</button>
                </div>
              </Nav>
            </Navbar.Collapse>
          </Container>
        </Navbar>
      </header>
    </section>
  );
};
export default MainContent;
