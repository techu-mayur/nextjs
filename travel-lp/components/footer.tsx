import type { NextPage } from "next";
import styles from "./footer.module.css";
export type FooterType = {
  className?: string;
};
const Footer: NextPage<FooterType> = ({ className = "" }) => {
  return (
    <footer className={[styles.footer, className].join(" ")}>
      <div className={styles.footerContainer}>
        <div className={styles.footerContent}>
          <div className={styles.brandInfo}>
            <img className={styles.logoIcon} alt="" src="/vector.svg" />
            <div className={styles.travlog}>TravelKaMaza</div>
          </div>
          <div className={styles.contraryToPopularContainer}>
            <p className={styles.contraryToPopular}>
              Contrary to popular belief, Lorem Ipsum is not simply random text.
              It has roots
            </p>
            <p className={styles.inAPiece}>
              in a piece of classical Latin literature from 45 BC.
            </p>
          </div>
        </div>
        <div className={styles.socialLinks}>
          <img className={styles.groupIcon} alt="" src="/group-21.svg" />
          <img className={styles.groupIcon1} alt="" src="/group-31.svg" />
          <img
            className={styles.socialLinksChild}
            loading="lazy"
            alt=""
            src="/group-8.svg"
          />
        </div>
      </div>
      <div className={styles.footerNavigation}>
        <div className={styles.companyInfo}>
          <b className={styles.company}>Company</b>
          <div className={styles.about}>About</div>
          <div className={styles.career}>Career</div>
          <div className={styles.mobile}>Mobile</div>
        </div>
        <div className={styles.supportInfo}>
          <b className={styles.contact}>Contact</b>
          <div className={styles.whyTravlog}>Why Travlog?</div>
          <div className={styles.partnerWithUs}>Partner with us</div>
          <div className={styles.faqs}>FAQ’s</div>
          <div className={styles.blog}>Blog</div>
        </div>
        <div className={`${styles.contactInfo} ${styles.meetUs}`}>
          <b className={styles.meetUs}>Meet Us</b>
          <div className={styles.contactDetails}>+00 92 1234 56789</div>
          <div className={styles.infotravlogcom}>info@travlog.com</div>
          <div className={styles.address}>
            <div className={styles.rStreetNew}>205. R Street, New York</div>
            <div className={styles.bd23200}>BD23200</div>
          </div>
        </div>
      </div>
      <img className={styles.objectsIcon} alt="" src="/objects-2.svg" />
    </footer>
  );
};
export default Footer;
