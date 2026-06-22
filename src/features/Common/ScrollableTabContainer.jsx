import React, { useRef, useState, useEffect } from "react";
import { IoMdArrowDropleft, IoMdArrowDropright } from "react-icons/io";

const ScrollableTabContainer = ({ children }) => {
  const scrollRef = useRef(null);

  const [showLeftArrow, setShowLeftArrow] = useState(false);
  const [showRightArrow, setShowRightArrow] = useState(false);
  const [isSmallScreen, setIsSmallScreen] = useState(window.innerWidth <= 768);

  const checkScreen = () => {
    setIsSmallScreen(window.innerWidth <= 768);
  };

  const checkScroll = () => {
    if (scrollRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollRef.current;

      // Large screens → show/hide based on scroll
      if (!isSmallScreen) {
        setShowLeftArrow(scrollLeft > 0);
        setShowRightArrow(Math.ceil(scrollLeft + clientWidth) < scrollWidth);
      }
    }
  };

  useEffect(() => {
    checkScreen();
    checkScroll();

    let observer;

    if (scrollRef.current) {
      observer = new ResizeObserver(() => {
        checkScreen();
        checkScroll();
      });

      observer.observe(scrollRef.current);
    }

    window.addEventListener("resize", () => {
      checkScreen();
      checkScroll();
    });

    return () => {
      window.removeEventListener("resize", checkScroll);

      if (observer) observer.disconnect();
    };
  }, [children, isSmallScreen]);

  const scrollLeft = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: -600,
        behavior: "smooth",
      });
    }
  };

  const scrollRight = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollBy({
        left: 600,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="customers_scroll_wrapper">
      {(isSmallScreen || showLeftArrow || showRightArrow) && (
        <button
          onClick={scrollLeft}
          className="customer_statusscroll_button"
          style={{ marginRight: "4px", flexShrink: 0 }}
        >
          <IoMdArrowDropleft size={25} />
        </button>
      )}

      <div
        className="customers_status_mainContainer"
        ref={scrollRef}
        onScroll={checkScroll}
      >
        {children}
      </div>

      {(isSmallScreen || showLeftArrow || showRightArrow) && (
        <button
          onClick={scrollRight}
          className="customer_statusscroll_button"
          style={{ marginLeft: "8px", flexShrink: 0 }}
        >
          <IoMdArrowDropright size={25} />
        </button>
      )}
    </div>
  );
};

export default ScrollableTabContainer;
