import type { NextPage } from "next";
import CardImageSet from "./card-image-set";
import styles from "./destination-gallery.module.css";
export type DestinationGalleryType = {
  className?: string;
};
const DestinationGallery: NextPage<DestinationGalleryType> = ({
  className = "",
}) => {
  return (
    <div className={[styles.destinationGallery, className].join(" ")}>
      <div className={styles.galleryItems}>
        <CardImageSet
          imageTrio="/rectangle-6@2x.png"
          paradiseBeachBantayanIsla="Paradise Beach, Bantayan Island"
          emptyPlaceholders="$550.16"
          romeItaly="Rome, Italy"
          emptyRatingPlaceholders="4.8"
        />
        <CardImageSet
          imageTrio="/rectangle-6-1@2x.png"
          paradiseBeachBantayanIsla="Ocean with full of Colors"
          emptyPlaceholders="$20.99"
          romeItaly="Maldives"
          emptyRatingPlaceholders="4.5"
        />
        <CardImageSet
          imageTrio="/rectangle-6-2@2x.png"
          paradiseBeachBantayanIsla="Mountain View, Above the cloud"
          emptyPlaceholders="$150.99"
          romeItaly="United Arab Emeries "
          emptyRatingPlaceholders="5.0"
        />
      </div>
      <img className={styles.objectsIcon} alt="" src="/objects-1.svg" />
    </div>
  );
};
export default DestinationGallery;
