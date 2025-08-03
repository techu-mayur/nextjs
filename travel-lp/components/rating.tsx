import type { NextPage } from "next";
import styles from "./rating.module.css";
import Link from "next/link";
export type RatingType = {
  className?: string;
};
const Rating: NextPage<RatingType> = ({ className = "" }) => {
  return (
    <section className={[styles.rating, className].join(" ")}>
      <div className={styles.socialIconsParent}>
        <div className={styles.socialIcons}>
          <div className={styles.innerColumn}>
            <div className={styles.locationWrapper}>
              <div className={styles.buttonContainer}>
                <div className={styles.buttonPair}>
                  <b className={styles.exploreTheWorld}>Explore the world!</b>
                  <img className={styles.work1Icon} alt="" src="/work-1.svg" />
                </div>
                <h1 className={styles.travelTopDestinationContainer}>
                  <p className={styles.travelTopDestination}>
                    <span className={styles.travel}>{`Travel `}</span>
                    <span>top destination</span>
                    <span className={styles.span}>{` `}</span>
                  </p>
                  <p className={styles.ofTheWorld}>of the world</p>
                </h1>
                <div className={styles.weAlwaysMakeContainer}>
                  <p className={styles.weAlwaysMake}>
                    We always make our customer happy by providing
                  </p>
                  <p
                    className={styles.asManyChoices}
                  >{`as many choices as possible `}</p>
                </div>
                <div className={styles.frameParent}>
                  <div className={styles.getStartedWrapper}>
                    <Link href="#" className={styles.getStarted}>
                      Get Started
                    </Link>
                  </div>
                  <div className={styles.watchDemoContainer}>
                    <img
                      className={styles.playCircle51Icon}
                      alt=""
                      src="/playcircle5-1.svg"
                    />
                    <Link href="#" className={styles.watchDemo}>
                      Watch Demo
                    </Link>
                  </div>
                </div>
              </div>
            </div>
            <div className={styles.imageContainerParent}>
              <div className={styles.imageContainer}>
                <img
                  className={styles.imagePairIcon}
                  loading="lazy"
                  alt=""
                  src="/rectangle-1@2x.png"
                />
                <img
                  className={styles.imagePairIcon1}
                  loading="lazy"
                  alt=""
                  src="/rectangle-2@2x.png"
                />
                <div className={styles.layerWrapper}>
                  <img className={styles.layerIcon} alt="" src="/layer.svg" />
                  <img
                    className={styles.shapeOverlayIcon}
                    alt=""
                    src="/shape-overlay@2x.png"
                  />
                </div>
              </div>
              <div className={styles.sendMessage}>
                <img className={styles.send1Icon} alt="" src="/send-1.svg" />
              </div>
            </div>
          </div>
        </div>
        <div className={styles.userLocation}>
          <div className={styles.locationWrapper1}>
            <div className={styles.addUserContainer}>
              <img
                className={styles.addUser1Icon}
                alt=""
                src="/adduser-1.svg"
              />
            </div>
          </div>
          <div className={styles.locationContainer}>
            <img
              className={styles.location1Icon}
              alt=""
              src="/location-1.svg"
            />
            <div className={styles.topPlacesWrapper}>
              <b className={styles.topPlaces}>Top Places</b>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
export default Rating;
