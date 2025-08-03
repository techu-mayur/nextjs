import React from "react";
import CountUp from "react-countup";
import styles from "./highlight-pairs.module.css";
export type HighlightPairsProps = {
  emptyPlaceholder: string;
  holidayPackage: string;
  emptyPlaceholderTwo: string;
  luxuryHotel: string;
};
const HighlightPairs: React.FC<HighlightPairsProps> = ({
  emptyPlaceholder,
  holidayPackage,
  emptyPlaceholderTwo,
  luxuryHotel,
}) => {
  return (
    <div className={styles.highlightPairs}>
      <div className={styles.firstHighlightPair}>
        <CountUp
          end={parseInt(emptyPlaceholder.replace(/\D/g, ""), 10)}
          duration={2.5}
        />
        <div className={styles.holidayPackage}>{holidayPackage}</div>
      </div>
      <div className={styles.secondHighlightPair}>
        <CountUp
          end={parseInt(emptyPlaceholderTwo.replace(/\D/g, ""), 10)}
          duration={2.5}
        />
        <div className={styles.luxuryHotel}>{luxuryHotel}</div>
      </div>
    </div>
  );
};
export default HighlightPairs;
