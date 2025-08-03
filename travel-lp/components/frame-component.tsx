import type { NextPage } from "next";
import FeaturesListItems from "./features-list-items";
import styles from "./frame-component.module.css";

export type FrameComponentType = {
  className?: string;
};

const FrameComponent: NextPage<FrameComponentType> = ({ className = "" }) => {
  return (
    <section
      className={[styles.destinationShowcaseWrapper, className].join(" ")}
    >
      <div className={styles.destinationShowcase}>
        <div className={styles.testimonialContainer}>
          <div className={styles.testimonialsContainer}>
            <b className={styles.keyFeatures}>Key features</b>
            <h1 className={styles.weOfferBest}>We offer best services</h1>
          </div>
          <div className={styles.keyFeaturesDescription}>
            <div className={styles.keyFeaturesDescriptionConta}>
              <div className={styles.contraryToPopularContainer}>
                <p className={styles.contraryToPopular}>
                  Contrary to popular belief, Lorem Ipsum is not simply random
                  text. It has roots in a piece of classical Latin literature
                </p>
                <p className={styles.from45Bc}>from 45 BC.</p>
              </div>
              <div className={styles.featuresListContainer}>
                <FeaturesListItems
                  location2="/location-2.svg"
                  weOfferBestServices="We offer best services"
                  loremIpsumIsNotSimplyRand="Lorem Ipsum is not simply random text"
                />
                <FeaturesListItems
                  location2="/calendar-1.svg"
                  weOfferBestServices="Schedule your trip"
                  loremIpsumIsNotSimplyRand="It has roots in a piece of classical"
                  propBorder="1px solid rgba(25, 24, 37, 0.1)"
                />
                <FeaturesListItems
                  location2="/ticket-1.svg"
                  weOfferBestServices="Get discounted coupons"
                  loremIpsumIsNotSimplyRand="Lorem Ipsum is not simply random text"
                  propBorder="unset"
                />
              </div>
            </div>
            <div className={styles.testimonialAvatar}>
              <div className={styles.mapContent}>
                <div className={styles.mapContentInner}>
                  <div className={styles.map111Parent}>
                    <img
                      className={styles.map111Icon}
                      loading="lazy"
                      alt=""
                      src="/map11-1.svg"
                    />
                    <div className={styles.mapTitleContainer}>
                      <b className={styles.paradiseOnEarth}>
                        Paradise on Earth
                      </b>
                    </div>
                  </div>
                </div>
                <div className={styles.wrapperDestinationImage}>
                  <img
                    className={styles.destinationImageIcon}
                    loading="lazy"
                    alt=""
                    src="/rectangle-10@2x.png"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.showcaseContent}>
          <div className={styles.featuresContent}>
            <b className={styles.testimonials}>Testimonials</b>
            <h1 className={styles.trustOurClients}>Trust our clients</h1>
          </div>
        </div>
      </div>
    </section>
  );
};

export default FrameComponent;
