import type { NextPage } from "next";
import { useMemo, type CSSProperties } from "react";
import styles from "./category-icons.module.css";

export type CategoryIconsType = {
  className?: string;
  destination1?: string;
  bestTourGuide?: string;
  whatLookedLikeASmallPatch?: string;

  /** Style props */
  propBoxShadow?: CSSProperties["boxShadow"];
};

const CategoryIcons: NextPage<CategoryIconsType> = ({
  className = "",
  destination1,
  bestTourGuide,
  whatLookedLikeASmallPatch,
  propBoxShadow,
}) => {
  const categoryIconsStyle: CSSProperties = useMemo(() => {
    return {
      boxShadow: propBoxShadow,
    };
  }, [propBoxShadow]);

  return (
    <div
      className={[styles.categoryIcons, className].join(" ")}
      style={categoryIconsStyle}
    >
      <img
        className={styles.destination1Icon}
        loading="lazy"
        alt=""
        src={destination1}
      />
      <div className={styles.categoryLabels}>
        <h3 className={styles.bestTourGuide}>{bestTourGuide}</h3>
        <div className={styles.whatLookedLike}>{whatLookedLikeASmallPatch}</div>
      </div>
    </div>
  );
};

export default CategoryIcons;
