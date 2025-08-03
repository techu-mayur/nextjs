import type { NextPage } from "next";
import styles from "./card-image-set.module.css";

export type CardImageSetType = {
  className?: string;
  imageTrio?: string;
  paradiseBeachBantayanIsla?: string;
  emptyPlaceholders?: string;
  romeItaly?: string;
  emptyRatingPlaceholders?: string;
};

const CardImageSet: NextPage<CardImageSetType> = ({
  className = "",
  imageTrio,
  paradiseBeachBantayanIsla,
  emptyPlaceholders,
  romeItaly,
  emptyRatingPlaceholders,
}) => {
  return (
    <div className={[styles.cardImageSet, className].join(" ")}>
      <img
        className={styles.imageTrioIcon}
        loading="lazy"
        alt=""
        src={imageTrio}
      />
      <div className={styles.cardDetailsSet}>
        <div className={styles.destinationInfoSet}>
          <div className={styles.destinationNameSet}>
            <b className={styles.paradiseBeachBantayan}>
              {paradiseBeachBantayanIsla}
            </b>
            <b className={styles.emptyPlaceholders}>{emptyPlaceholders}</b>
          </div>
          <div className={styles.romeItaly}>{romeItaly}</div>
        </div>
        <div className={styles.ratingSet}>
          <b className={styles.emptyRatingPlaceholders}>
            {emptyRatingPlaceholders}
          </b>
          <img
            className={styles.star1Icon}
            loading="lazy"
            alt=""
            src="/star-1.svg"
          />
        </div>
      </div>
    </div>
  );
};

export default CardImageSet;
