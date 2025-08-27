import { FunctionComponent, useState, useCallback } from "react";
import { TextField, InputAdornment, Icon, IconButton } from "@mui/material";
import MatterhornPopup from "./MatterhornPopup";
import PortalPopup from "./PortalPopup";
import { useNavigate } from "react-router-dom";
import styles from "./HotelsPage.module.css";

export type HotelsPageType = {
  className?: string;
};

const HotelsPage: FunctionComponent<HotelsPageType> = ({ className = "" }) => {
  const [isMatterhornPopupOpen, setMatterhornPopupOpen] = useState(false);
  const navigate = useNavigate();

  const openMatterhornPopup = useCallback(() => {
    setMatterhornPopupOpen(true);
  }, []);

  const closeMatterhornPopup = useCallback(() => {
    setMatterhornPopupOpen(false);
  }, []);

  const onFickleflightLogoContainerClick = useCallback(() => {
    navigate("/homepage");
  }, [navigate]);

  const onSearchTextClick = useCallback(() => {
    navigate("/");
  }, [navigate]);

  return (
    <>
      <div className={[styles.hotelsPage, className].join(" ")}>
        <header className={styles.topHeader}>
          <div className={styles.topContainer}>
            <div
              className={styles.fickleflightLogo}
              onClick={onFickleflightLogoContainerClick}
            >
              <div className={styles.symbols}>
                <img
                  className={styles.webScreenIcon}
                  alt=""
                  src="/web-screen.svg"
                  onClick={onFickleflightLogoContainerClick}
                />
              </div>
            </div>
            <div className={styles.navigationRight}>
              <div className={styles.navigationMenu}>
                <div
                  className={styles.explore}
                  onClick={onFickleflightLogoContainerClick}
                >
                  Explore
                </div>
                <div className={styles.explore} onClick={onSearchTextClick}>
                  Search
                </div>
                <button className={styles.hotels}>Hotels</button>
                <button className={styles.offers}>Offers</button>
              </div>
              <div className={styles.accountSection}>
                <img
                  className={styles.hamburgerMenuIcon}
                  alt=""
                  src="/notification.svg"
                />
                <img
                  className={styles.notificationBellIcon}
                  alt=""
                  src="/notification1.svg"
                />
                <img
                  className={styles.unsplashd1upkifd04aIcon}
                  alt=""
                  src="/top_avatar@2x.png"
                />
              </div>
            </div>
          </div>
        </header>
        <div className={styles.header}>
          <div className={styles.banner}>
            <img
              className={styles.bannerBackground}
              alt=""
              src="/Banner-Background1@2x.png"
            />
            <div className={styles.title}>
              <div className={styles.staysInLos}>Stays in Los Angeles</div>
              <div className={styles.options}>
                <div className={styles.pilldefault}>
                  <div className={styles.beds}>Recommended</div>
                </div>
                <div className={styles.hotelsPage_pilldefault}>
                  <div className={styles.beds}>Price</div>
                </div>
                <div className={styles.hotelsPage_pilldefault}>
                  <div className={styles.beds}>Rating</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className={styles.hotelResults}>
          <div className={styles.resultsSumamry}>
            <div className={styles.results}>200+ results</div>
            <div className={styles.filters}>
              <img className={styles.filtersIcon} alt="" src="/filters.svg" />
              <div className={styles.hotelsPage_filters}>Filters</div>
            </div>
          </div>
          <div className={styles.resultsSection}>
            <div className={styles.resultCardsCol}>
              <div className={styles.resultsCard}>
                <img
                  className={styles.resultsImageIcon}
                  alt=""
                  src="/Results-Image@2x.png"
                />
                <div className={styles.resultsDetails}>
                  <div className={styles.resultsSumamry}>
                    <div className={styles.resultAndVideo}>
                      <div className={styles.kingBedStandard}>
                        1 king bed standard
                      </div>
                      <b className={styles.holidayInnExpre}>
                        Holiday Inn Expre...
                      </b>
                      <div className={styles.review}>
                        <div className={styles.reviews}>(1,136 reviews)</div>
                        <div className={styles.stars}>
                          <div className={styles.div}>4.7</div>
                          <img
                            className={styles.vectorIcon}
                            alt=""
                            src="/Vector.svg"
                          />
                        </div>
                      </div>
                    </div>
                    <img
                      className={styles.videoIcon}
                      alt=""
                      src="/video.svg"
                      onClick={openMatterhornPopup}
                    />
                  </div>
                  <div className={styles.priceAndCta}>
                    <div className={styles.pricing}>
                      <b className={styles.s286}>$S 286</b>
                      <div className={styles.night}>/night</div>
                    </div>
                    <button className={styles.viewDetailsButton}>
                      <div className={styles.viewDetailsButtonChild} />
                      <div className={styles.searchFlights}>View Details</div>
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.hotelsPage_resultsCard}>
                <img
                  className={styles.resultsImageIcon}
                  alt=""
                  src="/Results-Image1@2x.png"
                />
                <div className={styles.hotelsPage_resultsDetails}>
                  <div className={styles.resultsSumamry}>
                    <div className={styles.result}>
                      <b className={styles.freehandLosAngeles}>
                        Freehand Los Angeles
                      </b>
                      <div className={styles.bedInQuad}>Bed in Quad</div>
                      <div className={styles.hotelsPage_review}>
                        <div className={styles.hotelsPage_reviews}>
                          (1,941 reviews)
                        </div>
                        <div className={styles.hotelsPage_stars}>
                          <div className={styles.hotelsPage_div}>4.2</div>
                          <img
                            className={styles.hotelsPage_vectorIcon}
                            alt=""
                            src="/Vector1.svg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.hotelsPage_priceAndCta}>
                    <div className={styles.pricing}>
                      <b className={styles.s286}>$S 198</b>
                      <div className={styles.night}>/night</div>
                    </div>
                    <button className={styles.viewDetailsButton}>
                      <div className={styles.viewDetailsButtonChild} />
                      <div className={styles.searchFlights}>View Details</div>
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.hotelsPage_resultsCard}>
                <img
                  className={styles.resultsImageIcon}
                  alt=""
                  src="/Results-Image2@2x.png"
                />
                <div className={styles.hotelsPage_resultsDetails}>
                  <div className={styles.resultsSumamry}>
                    <div className={styles.result}>
                      <b className={styles.freehandLosAngeles}>
                        The Westin Bonavent...
                      </b>
                      <div className={styles.bedInQuad}>1 King, City view</div>
                      <div className={styles.hotelsPage_review}>
                        <div className={styles.hotelsPage_reviews}>
                          (1,002 reviews)
                        </div>
                        <div className={styles.hotelsPage_stars}>
                          <div className={styles.hotelsPage_div}>4.1</div>
                          <img
                            className={styles.hotelsPage_vectorIcon}
                            alt=""
                            src="/Vector2.svg"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className={styles.hotelsPage_priceAndCta}>
                    <div className={styles.pricing}>
                      <b className={styles.s286}>$S 289</b>
                      <div className={styles.night}>/night</div>
                    </div>
                    <button className={styles.viewDetailsButton}>
                      <div className={styles.viewDetailsButtonChild} />
                      <div className={styles.searchFlights}>View Details</div>
                    </button>
                  </div>
                </div>
              </div>
              <div className={styles.resultsCard}>
                <img
                  className={styles.resultsImageIcon}
                  alt=""
                  src="/Results-Image3@2x.png"
                />
                <div className={styles.resultsDetails}>
                  <div className={styles.resultsSumamry}>
                    <div className={styles.resultAndVideo}>
                      <div className={styles.kingBedStandard}>Deluxe King</div>
                      <b className={styles.holidayInnExpre}>
                        The Ritz-Carlton, L...
                      </b>
                      <div className={styles.review}>
                        <div className={styles.reviews}>(1,136 reviews)</div>
                        <div className={styles.stars}>
                          <div className={styles.div}>4.7</div>
                          <img
                            className={styles.vectorIcon}
                            alt=""
                            src="/Vector3.svg"
                          />
                        </div>
                      </div>
                    </div>
                    <img
                      className={styles.videoIcon}
                      alt=""
                      src="/Feature-Video.svg"
                      onClick={openMatterhornPopup}
                    />
                  </div>
                  <div className={styles.priceAndCta}>
                    <div className={styles.pricing}>
                      <b className={styles.s286}>$S 286</b>
                      <div className={styles.night}>/night</div>
                    </div>
                    <button className={styles.viewDetailsButton}>
                      <div className={styles.viewDetailsButtonChild} />
                      <div className={styles.searchFlights}>View Details</div>
                    </button>
                  </div>
                </div>
              </div>
              <iframe
                className={styles.map}
                src={`https://www.openstreetmap.org/export/embed.html?bbox=-118.56033325195314%2C33.837912419023645%2C-117.98355102539064%2C34.25948651450623&amp;layer=mapnik`}
              />
            </div>
            <iframe
              className={styles.hotelsPage_map}
              src={`https://www.openstreetmap.org/export/embed.html?bbox=-118.56033325195314%2C33.837912419023645%2C-117.98355102539064%2C34.25948651450623&amp;layer=mapnik`}
            />
          </div>
        </div>
        <div className={styles.footerSection}>
          <div className={styles.newsletterFormSection}>
            <img
              className={styles.newsletterSectionBackground}
              alt=""
              src="/Newsletter-Section-Background1@2x.png"
            />
            <div className={styles.subscribeForm}>
              <div className={styles.formHeader}>
                <b className={styles.formTitleSubtext}>
                  subscribe to our newsletter
                </b>
                <b className={styles.formTitle}>Get weekly updates</b>
              </div>
              <div className={styles.form}>
                <div className={styles.formText}>
                  <div className={styles.fillInYour}>
                    Fill in your details to join the party!
                  </div>
                </div>
                <div className={styles.formFields}>
                  <div className={styles.formText}>
                    <TextField
                      className={styles.input}
                      color="primary"
                      label="Your name"
                      size="medium"
                      variant="outlined"
                      type="text"
                      sx={{ "& .MuiInputBase-root": { height: "56px" } }}
                    />
                  </div>
                  <div className={styles.formText}>
                    <TextField
                      className={styles.input}
                      color="primary"
                      label="Email address"
                      size="medium"
                      variant="outlined"
                      type="text"
                      sx={{ "& .MuiInputBase-root": { height: "56px" } }}
                    />
                  </div>
                </div>
                <button className={styles.button}>
                  <div className={styles.unstyledbutton}>
                    <div className={styles.hotelsPage_button}>submit</div>
                  </div>
                </button>
              </div>
            </div>
          </div>
          <footer className={styles.footer}>
            <div className={styles.fickleflightBio}>
              <img className={styles.logoIcon} alt="" src="/Logo1.svg" />
              <div className={styles.fickleFlightIs}>
                Fickle Flight is your one-stop travel portal. We offer hassle
                free flight and hotel bookings. We also have all your flight
                needs in you online shop.
              </div>
              <img
                className={styles.socialIcons}
                alt=""
                src="/Social-Icons1.svg"
              />
            </div>
            <div className={styles.seperator} />
            <div className={styles.footerLinks}>
              <div className={styles.company}>
                <div className={styles.aboutUs}>About Us</div>
                <div className={styles.hotelsPage_company}>Company</div>
                <div className={styles.news}>News</div>
                <div className={styles.careers}>Careers</div>
                <div className={styles.howWeWork}>How we work</div>
              </div>
              <div className={styles.company}>
                <div className={styles.account}>Account</div>
                <div className={styles.hotelsPage_support}>Support</div>
                <div className={styles.supportCenter}>Support Center</div>
                <div className={styles.faq}>FAQ</div>
                <div className={styles.accessibility}>Accessibility</div>
              </div>
              <div className={styles.more}>
                <div className={styles.covidAdvisory}>Covid Advisory</div>
                <div className={styles.hotelsPage_more}>More</div>
                <div className={styles.airlineFees}>Airline Fees</div>
                <div className={styles.tips}>Tips</div>
                <div className={styles.howWeWork}>Quarantine Rules</div>
              </div>
            </div>
          </footer>
        </div>
      </div>
      {isMatterhornPopupOpen && (
        <PortalPopup
          overlayColor="rgba(0, 0, 0, 0.3)"
          placement="Centered"
          onOutsideClick={closeMatterhornPopup}
        >
          <MatterhornPopup onClose={closeMatterhornPopup} />
        </PortalPopup>
      )}
    </>
  );
};

export default HotelsPage;
