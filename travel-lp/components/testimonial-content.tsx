import type { NextPage } from "next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import CategoryIcons from "./category-icons";
import "swiper/css";
import styles from "./testimonial-content.module.css";
import { Col, Container, Row } from "react-bootstrap";
export type TestimonialContentType = {
  className?: string;
};
const TestimonialContent: NextPage<TestimonialContentType> = ({
  className = "",
}) => {
  return (
    <section id="testimonial" className={styles.testimonialContent}>
      <Container fluid className={styles.serviceContent}>
        <Row>
          <Col md={4}>
            <div className={styles.serviceHeading}>
              <b className={styles.services}>Services</b>
              <h1 className={styles.ourTopValue}>
                Our top value categories for you
              </h1>
            </div>
          </Col>
          <Col md={8} className="d-none d-md-block">
            <Swiper
              slidesPerView={2}
              // modules={[Autoplay]}
              autoplay={{
                delay: 3000, // Change delay as needed
                disableOnInteraction: false, // Allows autoplay to continue after interaction
              }}
              loop={true}
              className={styles.serviceCategories}
            >
              <SwiperSlide>
                <CategoryIcons
                  className="slider-active"
                  destination1="/destination-1@2x.png"
                  bestTourGuide="Best Tour Guide"
                  whatLookedLikeASmallPatch="What looked like a small patch of purple grass, above five feet."
                />
              </SwiperSlide>
              <SwiperSlide>
                <CategoryIcons
                  className="slider-active"
                  destination1="/booking-1@2x.png"
                  bestTourGuide="Easy Booking"
                  whatLookedLikeASmallPatch="Square, was moving across the sand in their direction."
                  propBoxShadow="0px 41px 89px rgba(0, 0, 0, 0.1), 0px 0px 0px rgba(0, 0, 0, 0.1)"
                />
              </SwiperSlide>
              <SwiperSlide>
                <CategoryIcons
                  className="slider-active"
                  destination1="/cloudy-1@2x.png"
                  bestTourGuide="Weather Forecast"
                  whatLookedLikeASmallPatch="What looked like a small patch of purple grass, above five feet."
                  propBoxShadow="unset"
                />
              </SwiperSlide>
              {/* Add more slides as needed */}
            </Swiper>
          </Col>
          <Col md={8} className="d-block d-md-none ">
            <CategoryIcons
              className="slider-active-mobile"
              destination1="/destination-1@2x.png"
              bestTourGuide="Best Tour Guide"
              whatLookedLikeASmallPatch="What looked like a small patch of purple grass, above five feet."
            />
          </Col>
        </Row>
      </Container>
    </section>
  );
};
export default TestimonialContent;
