import React, { useState, useEffect } from "react";
import { Table } from "antd";
import "./commonstyles.css";
const CommonTable = ({
  columns,
  dataSource,
  dataPerPage,
  scroll,
  bordered,
  selectedDatas,
  checkBox,
  loading,
  paginationStatus,
  size,
  className,
  selectedRowKeys,
}) => {
  const [pageSize, setPageSize] = useState(dataPerPage || 10);

  useEffect(() => {
    const interval = setInterval(() => {
      const sizeChanger = document.querySelector(
        ".ant-pagination-options-size-changer"
      );
      if (
        sizeChanger &&
        !sizeChanger.querySelector(".commontable_paginationlabel")
      ) {
        const label = document.createElement("span");
        label.innerText = "Show Rows ";
        label.className = "commontable_paginationlabel";
        label.style.marginRight = "4px";
        sizeChanger.prepend(label);
      }
    }, 100);

    return () => clearInterval(interval);
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    setPageSize(pagination.pageSize);
  };

  const rowSelection =
    checkBox === "false"
      ? null
      : {
          selectedRowKeys,
          onChange: (selectedKeys, selectedRows) => {
            if (selectedDatas) {
              selectedDatas(selectedRows);
            }
          },
        };

  const paginationConfig =
    paginationStatus === false
      ? false
      : {
          pageSize: pageSize,
          showSizeChanger: true,
          pageSizeOptions: ["10", "20", "50", "100", "250", "500"],
          showQuickJumper: false,
          total: dataSource.length,
          position: ["bottomRight"],
          itemRender: () => null, // Hides page numbers
        };

  return (
    <Table
      rowSelection={rowSelection}
      columns={columns}
      dataSource={dataSource}
      scroll={scroll}
      pagination={paginationConfig}
      onChange={handleTableChange}
      tableLayout="fixed"
      bordered={bordered === "true"}
      loading={loading}
      size={size}
      className={className}
      rowKey={(record) => record.id || record.question_id}
    />
  );
};

export default CommonTable;
