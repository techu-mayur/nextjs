import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./features-list-items.module.css";

export type FeaturesListItemsType = {
  className?: string;
  location2?: string;
  weOfferBestServices?: string;
  loremIpsumIsNotSimplyRand?: string;

  /** Style props */
  propBorder?: CSSProperties["border"];
};

const FeaturesListItems: NextPage<FeaturesListItemsType> = ({
  className = "",
  location2,
  weOfferBestServices,
  loremIpsumIsNotSimplyRand,
  propBorder,
}) => {
  const featuresListItemsStyle: CSSProperties = useMemo(() => {
    return {
      border: propBorder,
    };
  }, [propBorder]);

  return (
    <div
      className={[styles.featuresListItems, className].join(" ")}
      style={featuresListItemsStyle}
    >
      <div className={styles.rectangleParent}>
        <div className={styles.frameChild} />
        <img
          className={styles.location2Icon}
          loading="lazy"
          alt=""
          src={location2}
        />
      </div>
      <div className={styles.servicesDescriptionContainer}>
        <div className={styles.servicesDescription}>
          <b className={styles.weOfferBest}>{weOfferBestServices}</b>
          <div className={styles.loremIpsumIs}>{loremIpsumIsNotSimplyRand}</div>
        </div>
      </div>
    </div>
  );
};

export default FeaturesListItems;
