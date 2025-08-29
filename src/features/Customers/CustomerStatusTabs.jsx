import React, { useState, useRef } from "react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  useSortable,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

// Sortable Item Component
function SortableItem({
  id,
  children,
  onClick,
  activeClass,
  inactiveClass,
  isActive,
}) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    cursor: "grab",
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className={isActive ? activeClass : inactiveClass}
      onClick={onClick}
    >
      {children}
    </div>
  );
}

export default function CustomerStatusTabs({
  customerStatusCount,
  getCustomersData,
  selectedDates,
  searchValue,
}) {
  const [status, setStatus] = useState("Form Pending");
  const [items, setItems] = useState([
    "Form Pending",
    "Awaiting Finance",
    "Awaiting Verify",
    "Awaiting Trainer",
    "Awaiting Trainer Verify",
    "Awaiting Class",
    "Class Going",
    "Pending Fees",
    "Escalated",
    "Feedback",
    "Completed",
    "Others",
  ]);

  const sensors = useSensors(useSensor(PointerSensor));

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (active.id !== over.id) {
      setItems((prev) => {
        const oldIndex = prev.indexOf(active.id);
        const newIndex = prev.indexOf(over.id);
        return arrayMove(prev, oldIndex, newIndex);
      });
    }
  };

  return (
    <div className="customers_scroll_wrapper">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext items={items} strategy={horizontalListSortingStrategy}>
          <div className="customers_status_mainContainer">
            {items.map((item) => (
              <SortableItem
                key={item}
                id={item}
                isActive={status === item}
                activeClass={`customers_active_${item
                  .replace(/\s+/g, "")
                  .toLowerCase()}_container`}
                inactiveClass={`customers_${item
                  .replace(/\s+/g, "")
                  .toLowerCase()}_container`}
                onClick={() => {
                  if (status !== item) {
                    setStatus(item);
                    getCustomersData(
                      selectedDates[0],
                      selectedDates[1],
                      searchValue,
                      item
                    );
                  }
                }}
              >
                <p>
                  {item}{" "}
                  {`( ${
                    customerStatusCount &&
                    customerStatusCount[
                      item.toLowerCase().replace(/\s+/g, "_")
                    ] !== undefined
                      ? customerStatusCount[
                          item.toLowerCase().replace(/\s+/g, "_")
                        ]
                      : "-"
                  } )`}
                </p>
              </SortableItem>
            ))}
          </div>
        </SortableContext>
      </DndContext>
    </div>
  );
}
