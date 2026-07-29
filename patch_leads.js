
const fs = require("fs");
let content = fs.readFileSync("d:/GitHub/Actecrm/src/features/Lead/Leads.jsx", "utf8");

content = content.replace(
  /const \[leadActionFilter, setLeadActionFilter\] = useState\("super_hot"\);/,
  `const [leadActionFilter, setLeadActionFilter] = useState("Sale Ready");`
);

content = content.replace(
  /targetBucket === "Followup Leads"\s*\n\s*\?\s*"sale_ready_leads"\s*\n\s*:\s*targetBucket === "Interested Leads"\s*\n\s*\?\s*"super_hot"/g,
  `targetBucket === "Followup Leads"
            ? "Sale Ready"
            : targetBucket === "Interested Leads"
              ? "Super Hot"`
);

// Interested Leads UI update
content = content.replace(
  /const orderedKeys = \[\s*"super_hot",\s*"hot",\s*"warm",\s*"cold",\s*"dormant",\s*"not_interested",\s*\];/g,
  `const orderedKeys = [
                  "Super Hot", "super_hot",
                  "Hot", "hot",
                  "Warm", "warm",
                  "Cold", "cold",
                  "Dormant", "dormant",
                  "Not Interested", "not_interested",
                  "Only Enquiry", "only_enquiry"
                ];`
);

content = content.replace(
  /const actionColorMap = \{\s*super_hot: "#dc2626",\s*hot: "#f97316",\s*warm: "#eab308",\s*cold: "#3b82f6",\s*not_interested: "#991b1b",\s*dormant: "#6b7280",\s*\};/g,
  `const actionColorMap = {
                    "Super Hot": "#dc2626", super_hot: "#dc2626",
                    "Hot": "#f97316", hot: "#f97316",
                    "Warm": "#eab308", warm: "#eab308",
                    "Cold": "#3b82f6", cold: "#3b82f6",
                    "Not Interested": "#991b1b", not_interested: "#991b1b",
                    "Dormant": "#6b7280", dormant: "#6b7280",
                    "Only Enquiry": "#6b7280", only_enquiry: "#6b7280",
                  };`
);

// Followup Leads UI update
content = content.replace(
  /const orderedKeys = \[\s*"sale_ready_leads",\s*"highly_interested_leads",\s*"interested_leads",\s*"exploring_leads",\s*"not_responding_leads",\s*"not_interested_leads",\s*\];/g,
  `const orderedKeys = [
                  "Sale Ready", "sale_ready_leads",
                  "Highly Interested", "highly_interested_leads",
                  "Interested", "interested_leads",
                  "Exploring", "exploring_leads",
                  "Not Responding", "not_responding_leads",
                  "Not Interested", "not_interested_leads",
                ];`
);

content = content.replace(
  /const actionColorMap = \{\s*sale_ready_leads: "#dc2626",\s*highly_interested_leads: "#f97316",\s*interested_leads: "#eab308",\s*exploring_leads: "#3b82f6",\s*not_responding_leads: "#6b7280",\s*not_interested_leads: "#991b1b",\s*\};/g,
  `const actionColorMap = {
                    "Sale Ready": "#dc2626", sale_ready_leads: "#dc2626",
                    "Highly Interested": "#f97316", highly_interested_leads: "#f97316",
                    "Interested": "#eab308", interested_leads: "#eab308",
                    "Exploring": "#3b82f6", exploring_leads: "#3b82f6",
                    "Not Responding": "#6b7280", not_responding_leads: "#6b7280",
                    "Not Interested": "#991b1b", not_interested_leads: "#991b1b",
                  };`
);

// Valid Leads UI update
content = content.replace(
  /const validColorMap = \{\s*validated: "#16a34a",\s*junk: "#dc2626",\s*need_screening: "#eab308",\s*\};/g,
  `const validColorMap = {
                    "Validated": "#16a34a", validated: "#16a34a",
                    "Junk": "#dc2626", junk: "#dc2626",
                    "Need Screening": "#eab308", need_screening: "#eab308",
                  };`
);

// Eligible Leads UI update
content = content.replace(
  /const eligibleColorMap = \{\s*communicated: "#6366f1",\s*not_communicated: "#f97316",\s*no_response: "#64748b",\s*data_correct_but_no_response: "#64748b",\s*\};/g,
  `const eligibleColorMap = {
                    "Communicated": "#6366f1", communicated: "#6366f1",
                    "Not Communicated": "#f97316", not_communicated: "#f97316",
                    "Data Correct But No Response": "#64748b", no_response: "#64748b", data_correct_but_no_response: "#64748b",
                  };`
);

// Payload generation update (the big one)
content = content.replace(
  /(\.\.\.\(bucket === "Followup Leads" &&)[\s\S]*?(?=\.\.\.\(bucket === "Interested Leads")/m,
  \`...(bucket === "Followup Leads" &&
        [
          "sale_ready_leads", "Sale Ready",
          "highly_interested_leads", "Highly Interested",
          "interested_leads", "Interested",
          "exploring_leads", "Exploring",
          "not_responding_leads", "Not Responding",
          "not_interested_leads", "Not Interested",
        ].includes(currentAction) && {
          lead_action: currentAction.includes("_")
            ? currentAction
                .split("_")
                .filter((word) => word.toLowerCase() !== "leads")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            : currentAction,
        }),
      \`
);

content = content.replace(
  /(\.\.\.\(bucket === "Interested Leads" &&)[\s\S]*?(?=\.\.\.\(bucket === "Valid Leads")/m,
  \`...(bucket === "Interested Leads" &&
        [
          "super_hot", "Super Hot",
          "hot", "Hot",
          "warm", "Warm",
          "cold", "Cold",
          "not_interested", "Not Interested",
          "dormant", "Dormant",
          "only_enquiry", "Only Enquiry",
        ].includes(currentAction) && {
          lead_action: currentAction.includes("_")
            ? currentAction
                .split("_")
                .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
                .join(" ")
            : currentAction,
        }),
      \`
);

content = content.replace(
  /(\.\.\.\(bucket === "Valid Leads" &&)[\s\S]*?(?=\.\.\.\(bucket === "Eligible Leads")/m,
  \`...(bucket === "Valid Leads" &&
        ["validated", "Validated", "need_screening", "Need Screening", "junk", "Junk"].includes(currentAction) && {
          lead_action:
            currentAction === "validated" || currentAction === "Validated"
              ? "Validated"
              : currentAction === "need_screening" || currentAction === "Need Screening"
                ? "Need Screening"
                : "Junk",
        }),
      \`
);

content = content.replace(
  /(\.\.\.\(bucket === "Eligible Leads" &&)[\s\S]*?(?=page: pageNumber,)/m,
  \`...(bucket === "Eligible Leads" &&
        [
          "communicated", "Communicated",
          "not_communicated", "Not Communicated",
          "no_response",
          "data correct but no response",
          "data_correct_but_no_response", "Data Correct But No Response"
        ].includes(currentAction) && {
          lead_action:
            currentAction === "communicated" || currentAction === "Communicated"
              ? "Communicated"
              : currentAction === "not_communicated" || currentAction === "Not Communicated"
                ? "Not Communicated"
                : "Data Correct But No Response",
        }),
      \`
);

fs.writeFileSync("d:/GitHub/Actecrm/src/features/Lead/Leads.jsx", content);

