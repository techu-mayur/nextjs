import type { NextPage } from "next";
import styles from "./carousel-controls.module.css";
export type CarouselControlsType = {
  className?: string;
};
const CarouselControls: NextPage<CarouselControlsType> = ({
  className = "",
}) => {
  return (
    <section className={[styles.carouselControls, className].join(" ")}>
      <img className={styles.layer1Icon} alt="" src="/layer-1@2x.png" />
      <img className={styles.backgroundIcon} alt="" src="/background@2x.png" />
      <img className={styles.shapeIcon} alt="" src="/shape@2x.png" />
      <div className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <img className={styles.arrowLeft1Icon} alt="" src="/arrowleft-1.svg" />
      </div>{" "}
      <img
        className={styles.carouselControlsChild}
        loading="lazy"
        alt=""
        src="/ellipse-22@2x.png"
      />
      <div className={styles.ratingicon}>
        <img
          className={styles.star2Icon}
          loading="lazy"
          alt=""
          src="/star-2.svg"
        />
        <img
          className={styles.star3Icon}
          loading="lazy"
          alt=""
          src="/star-2.svg"
        />
        <img
          className={styles.star4Icon}
          loading="lazy"
          alt=""
          src="/star-2.svg"
        />
        <img className={styles.star5Icon} alt="" src="/star-2.svg" />
        <img className={styles.star6Icon} alt="" src="/star-2.svg" />
      </div>
      <div className={styles.rectangleGroup}>
        <div className={styles.frameItem} />
        <img className={styles.arrowLeft2Icon} alt="" src="/arrowleft-2.svg" />
      </div>
      <img
        className={styles.graphicElementsIcon}
        loading="lazy"
        alt=""
        src="/graphic-elements.svg"
      />
    </section>
  );
};
export default CarouselControls;
