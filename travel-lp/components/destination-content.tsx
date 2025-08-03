import type { NextPage } from "next";
import styles from "./destination-content.module.css";
export type DestinationContentType = {
  className?: string;
};
const DestinationContent: NextPage<DestinationContentType> = ({
  className = "",
}) => {
  return (
    <div className={[styles.destinationContent, className].join(" ")}>
      <div className={styles.topDestinationWrapper}>
        <div className={styles.topDestinationHeader}>
          <b className={styles.topDestination}>Top Destination</b>
          <h1 className={styles.exploreTopDestination}>
            Explore top destination
          </h1>
        </div>
      </div>
      {/* <div className={styles.frameParent}>
        <div className={styles.rectangleParent}>
          <div className={styles.frameChild} />
          <img
            className={styles.arrowLeft1Icon}
            loading="lazy"
            alt=""
            src="/arrowleft-1.svg"
          />
        </div>
        <div className={styles.rectangleGroup}>
          <div className={styles.frameItem} />
          <img
            className={styles.arrowLeft2Icon}
            alt=""
            src="/arrowleft-2.svg"
          />
        </div>
      </div> */}
    </div>
  );
};
export default DestinationContent;
