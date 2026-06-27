import React, { useRef, useState, useEffect } from "react";
import { Tooltip } from "antd";
import "./commonstyles.css";

const EllipsisTooltip = ({ text, smallText = false }) => {
  const textRef = useRef(null);
  const [isTruncated, setIsTruncated] = useState(false);

  useEffect(() => {
    const el = textRef.current;
    if (!el) return;

    const checkTruncation = () => {
      setIsTruncated(el.scrollWidth > el.offsetWidth);
    };

    // check initially
    checkTruncation();

    // wait for Drawer open animation + layout settle
    const timer = setTimeout(checkTruncation, 300);

    const observer = new ResizeObserver(() => {
      checkTruncation();
    });
    observer.observe(el);

    return () => {
      clearTimeout(timer);
      observer.disconnect();
    };
  }, [text]);

  return (
    <Tooltip
      title={isTruncated ? text : null}
      placement="bottom"
      getPopupContainer={() => document.body}
      color="#fff"
      styles={{
        body: {
          backgroundColor: "#fff",
          color: "#333",
          fontWeight: 500,
          fontSize: "13px",
        },
      }}
    >
      <span
        ref={textRef}
        className={
          smallText == true
            ? "ellipsistooltip_smalltext"
            : "lead-ellipsis-text"
        }
        style={isTruncated ? { cursor: "pointer" } : undefined}
      >
        {text || "-"}
      </span>
    </Tooltip>
  );
};

export default EllipsisTooltip;
