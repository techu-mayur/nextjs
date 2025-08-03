import type { NextPage } from "next";
import { Swiper, SwiperSlide } from "swiper/react";
import { Autoplay } from "swiper/modules";
import MainContent from "../components/main-content";
import Rating from "../components/rating";
import TestimonialContent from "../components/testimonial-content";
import DestinationContent from "../components/destination-content";
import DestinationGallery from "../components/destination-gallery";
import FrameComponent1 from "../components/frame-component1";
import FrameComponent from "../components/frame-component";
import TestimonialContainer from "../components/testimonial-container";
import Footer from "../components/footer";
import CarouselControls from "../components/carousel-controls";
import styles from "./index.module.css";
const Homepage: NextPage = () => {
  return (
    <div className={styles.homepage}>
      <div className={styles.homepageChild} />
      <div className={styles.homepageItem} />
      <MainContent />
      <Rating />
      <section className={styles.groupParent}>
        <Swiper
          spaceBetween={50}
          onSlideChange={() => console.log("slide change")}
          onSwiper={(swiper) => console.log(swiper)}
          modules={[Autoplay]}
          autoplay={{
            delay: 3000,
            disableOnInteraction: false,
          }}
          loop={true}
          breakpoints={{
            // when window width is <= 640px
            640: {
              slidesPerView: 2,
            },
            // when window width is <= 768px
            768: {
              slidesPerView: 2,
            },
            // when window width is <= 1024px
            1024: {
              slidesPerView: 4,
            },
          }}
        >
          <SwiperSlide>
            <img
              className={styles.groupIcon}
              loading="lazy"
              alt=""
              src="/group.svg"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img
              className={styles.frameChild}
              loading="lazy"
              alt=""
              src="/group-2.svg"
            />
          </SwiperSlide>
          <SwiperSlide>
            <img className={styles.groupIcon1} alt="" src="/group-1@2x.png" />
          </SwiperSlide>
          <SwiperSlide>
            <img className={styles.frameItem} alt="" src="/group-9235.svg" />
          </SwiperSlide>
          <SwiperSlide>
            <img
              className={styles.frameInner}
              loading="lazy"
              alt=""
              src="/group-3.svg"
            />
          </SwiperSlide>
        </Swiper>
        <img
          className={styles.objectsIcon}
          loading="lazy"
          alt=""
          src="/objects@2x.png"
        />
      </section>
      <TestimonialContent />
      <section className={styles.destinationContentParent}>
        <DestinationContent />
        <DestinationGallery />
      </section>
      <FrameComponent1 />
      <FrameComponent />
      <TestimonialContainer />
      <Footer />
      <CarouselControls />
    </div>
  );
};
export default Homepage;
