import type { NextPage } from "next";
import HighlightPairs from "./highlight-pairs";
import styles from "./frame-component1.module.css";
export type FrameComponent1Type = {
  className?: string;
};
const FrameComponent1: NextPage<FrameComponent1Type> = ({ className = "" }) => {
  return (
    <section
      className={[styles.travelPointContentWrapper, className].join(" ")}
    >
      <div className={styles.travelPointContent}>
        <img
          className={styles.travelPointContentChild}
          alt=""
          src="/group-9238.svg"
        />
        <div className={styles.pointDescription}>
          <div className={styles.pointMessage}>
            <div className={styles.pointHeading}>
              <b className={styles.travelPoint}>Travel Point</b>
              <h1 className={styles.weHelpingYou}>
                We helping you find your dream location
              </h1>
            </div>
            <div className={styles.contraryToPopular}>
              Contrary to popular belief, Lorem Ipsum is not simply random text.
              It has roots in a piece of classical Latin literature from 45 BC.
            </div>
          </div>
          <div className={styles.packageHighlights}>
            <HighlightPairs
              emptyPlaceholder="500+"
              holidayPackage="Holiday Package"
              emptyPlaceholderTwo="100"
              luxuryHotel="Luxury Hotel"
            />
            <HighlightPairs
              emptyPlaceholder="7"
              holidayPackage="Premium Airlines"
              emptyPlaceholderTwo="2k+"
              luxuryHotel="Happy Customer"
            />
          </div>
        </div>
        <div className={styles.discountIcon}>
          <img
            className={styles.discount1Icon}
            loading="lazy"
            alt=""
            src="/discount-1.svg"
          />
          <div className={styles.discountedPriceContainer}>
            <b className={styles.discountedPrice}>Discounted Price</b>
          </div>
        </div>
        <div className={styles.ticketIcon}>
          <img
            className={styles.ticketStar1Icon}
            loading="lazy"
            alt=""
            src="/ticketstar-1.svg"
          />
        </div>
      </div>
    </section>
  );
};
export default FrameComponent1;
