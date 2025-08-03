import type { NextPage } from "next";
import styles from "./testimonial-container.module.css";

export type TestimonialContainerType = {
  className?: string;
};

const TestimonialContainer: NextPage<TestimonialContainerType> = ({
  className = "",
}) => {
  return (
    <section className={[styles.testimonialContainer, className].join(" ")}>
      <div className={styles.featuresContainer}>
        <div className={styles.testimonialDetailsWrapper}>
          <div className={styles.testimonialDetails}>
            <div className={styles.testimonialQuote}>
              <b className={styles.markSmithContainer}>
                <span>{`Mark Smith `}</span>
                <span className={styles.travelEnthusiast}>
                  / Travel Enthusiast
                </span>
              </b>
              <div className={styles.contraryToPopularContainer}>
                <p className={styles.contraryToPopular}>
                  Contrary to popular belief, Lorem Ipsum is not simply random
                  text. It has roots
                </p>
                <p className={styles.inAPiece}>
                  in a piece of classical Latin literature from 45 BC.
                </p>
              </div>
            </div>
            <div className={styles.destinationShowcase}>
              <div className={styles.ratingStars}>
                <div className={styles.stars} />
                <div className={styles.ratingStars1} />
                <div className={styles.stars1} />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.newsletterContainerParent}>
          <div className={styles.newsletterContainer}>
            <b className={styles.subscribeToOur}>subscribe to our newsletter</b>
            <h1
              className={styles.prepareYourself}
            >{`Prepare yourself & let’s explore the beauty of the world`}</h1>
          </div>
          <div className={styles.subscriptionForm}>
            <div className={styles.formFields}>
              <img
                className={styles.message1Icon}
                alt=""
                src="/message-1.svg"
              />
              <b className={styles.yourEmail}>Your Email</b>
            </div>
            <div className={styles.submitButton}>
              <b className={styles.subscribe}>Subscribe</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default TestimonialContainer;
