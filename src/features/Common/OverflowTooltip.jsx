import { Tooltip } from "antd";

const OverflowTooltip = ({
  title,
  children,
  placement = "bottom",
  color = "#fff",
}) => {
  return (
    <Tooltip
      title={title}
      placement={placement}
      color={color}
      styles={{
        cursor: "pointer",
        body: {
          backgroundColor: "#fff",
          color: "#333",
          fontWeight: 500,
          fontSize: "13px",
        },
      }}
    >
      <span className="lead-ellipsis-text" style={{ cursor: "pointer" }}>
        {children}
      </span>
    </Tooltip>
  );
};

export default OverflowTooltip;
