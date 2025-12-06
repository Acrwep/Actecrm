import { Card, Tag } from "antd";

const CourseCard = ({ name, price, offer }) => {
  const discount = price - offer;

  return (
    <Card
      hoverable
      style={{
        borderRadius: 16,
        padding: 16,
        boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
      }}
    >
      <h3 style={{ marginBottom: 8 }}>{name}</h3>

      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#999" }}>
          Original Price:
        </span>
        <span
          style={{
            textDecoration: "line-through",
            marginLeft: 8,
            color: "#999",
          }}
        >
          ₹{price.toLocaleString("en-IN")}
        </span>
      </div>

      <div style={{ marginBottom: 6 }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: "#222" }}>
          Offer Price:
        </span>
        <span
          style={{
            marginLeft: 8,
            fontWeight: "bold",
            color: "#1b5e20",
            fontSize: 20,
          }}
        >
          ₹{offer.toLocaleString("en-IN")}
        </span>
      </div>

      <Tag color="red" style={{ padding: "4px 10px", fontSize: 14 }}>
        Save ₹{discount.toLocaleString("en-IN")}
      </Tag>
    </Card>
  );
};

export default CourseCard;
