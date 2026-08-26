import React, { useState, useEffect, useRef } from "react";
import { Table, Pagination } from "antd";
import { GrFormPrevious, GrFormNext } from "react-icons/gr";
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
  rowClassName,
  limit,
  page_number,
  totalPageNumber,
  onPaginationChange,
  summary,
  sticky = { offsetHeader: 64 },
  getCheckboxProps,
  rowKey,
  disableLocalPagination,
}) => {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const tableWrapperRef = useRef(null);
  const customScrollRef = useRef(null);
  const bottomBoundaryRef = useRef(null);
  
  const [scrollWidth, setScrollWidth] = useState(0);
  const [clientWidth, setClientWidth] = useState(0);
  const [isBottomVisible, setIsBottomVisible] = useState(false);

  // Measure scroll widths
  useEffect(() => {
    const tableContainer = tableWrapperRef.current;
    if (!tableContainer) return;

    const getScrollElement = () =>
      tableContainer.querySelector(".ant-table-body") ||
      tableContainer.querySelector(".ant-table-content");

    const updateWidths = () => {
      const el = getScrollElement();
      if (el) {
        setScrollWidth(el.scrollWidth);
        setClientWidth(el.clientWidth);
      }
    };

    updateWidths();

    const resizeObserver = new ResizeObserver(() => {
      updateWidths();
    });
    resizeObserver.observe(tableContainer);

    const observer = new MutationObserver(() => {
      const el = getScrollElement();
      if (el && el.firstElementChild) {
        resizeObserver.observe(el.firstElementChild);
      }
      updateWidths();
    });
    observer.observe(tableContainer, { childList: true, subtree: true });

    return () => {
      resizeObserver.disconnect();
      observer.disconnect();
    };
  }, [dataSource, columns]);

  // Sync scroll positions
  useEffect(() => {
    const tableContainer = tableWrapperRef.current;
    const customScroll = customScrollRef.current;
    if (!tableContainer || !customScroll) return;

    const getScrollElement = () =>
      tableContainer.querySelector(".ant-table-body") ||
      tableContainer.querySelector(".ant-table-content");

    let isSyncingLeft = false;
    let isSyncingRight = false;

    const handleTableScroll = (e) => {
      if (!isSyncingLeft) {
        isSyncingRight = true;
        customScroll.scrollLeft = e.target.scrollLeft;
      }
      isSyncingLeft = false;
    };

    const handleCustomScroll = (e) => {
      const scrollEl = getScrollElement();
      if (scrollEl && !isSyncingRight) {
        isSyncingLeft = true;
        scrollEl.scrollLeft = e.target.scrollLeft;
      }
      isSyncingRight = false;
    };

    customScroll.addEventListener("scroll", handleCustomScroll);

    let scrollEl = getScrollElement();
    if (scrollEl) {
      scrollEl.addEventListener("scroll", handleTableScroll);
      // set initial sync in case it was already scrolled
      customScroll.scrollLeft = scrollEl.scrollLeft;
    }

    const observer = new MutationObserver(() => {
      const newScrollEl = getScrollElement();
      if (newScrollEl && newScrollEl !== scrollEl) {
        if (scrollEl) {
          scrollEl.removeEventListener("scroll", handleTableScroll);
        }
        scrollEl = newScrollEl;
        if (scrollEl) {
          scrollEl.addEventListener("scroll", handleTableScroll);
        }
      }
    });
    observer.observe(tableContainer, { childList: true, subtree: true });

    return () => {
      customScroll.removeEventListener("scroll", handleCustomScroll);
      if (scrollEl) {
        scrollEl.removeEventListener("scroll", handleTableScroll);
      }
      observer.disconnect();
    };
  }, [scrollWidth, clientWidth, isBottomVisible]);

  // Intersection observer to hide custom scroll when native one is visible
  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        setIsBottomVisible(entry.isIntersecting);
      },
      { 
        root: null, // viewport
        rootMargin: "0px 0px 100px 0px", // Trigger slightly before the bottom comes into view to compensate for pagination height
        threshold: 0 
      }
    );

    if (bottomBoundaryRef.current) {
      observer.observe(bottomBoundaryRef.current);
    }

    return () => {
      observer.disconnect();
    };
  }, []);

  const showCustomScroll = scrollWidth > clientWidth + 2 && !isBottomVisible;

  // Pagination logic (unchanged)
  useEffect(() => {
    setPageSize(limit || 10);
  }, [limit, page_number]);

  useEffect(() => {
    setCurrentPage(page_number || 1);
  }, [page_number]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      const sizeChanger = document.querySelector(
        ".ant-pagination-options-size-changer",
      );
      if (
        sizeChanger &&
        !sizeChanger.querySelector(".commontable_paginationlabel")
      ) {
        const label = document.createElement("span");
        label.innerText = "Show Rows ";
        label.className = "commontable_paginationlabel";
        sizeChanger.prepend(label);
      }

      // Watch for DOM changes under the table container instead of body
      const tableContainer = document.querySelector(".ant-table-wrapper");
      if (tableContainer) {
        const observer = new MutationObserver(() => {
          const sizeChangerUpdated = document.querySelector(
            ".ant-pagination-options-size-changer",
          );
          if (
            sizeChangerUpdated &&
            !sizeChangerUpdated.querySelector(".commontable_paginationlabel")
          ) {
            const label = document.createElement("span");
            label.innerText = "Show Rows ";
            label.className = "commontable_paginationlabel";
            sizeChangerUpdated.prepend(label);
          }
        });
        observer.observe(tableContainer, {
          childList: true,
          subtree: true,
        });

        return () => observer.disconnect();
      }
    }, 100);

    return () => clearTimeout(timeout);
  }, []);

  useEffect(() => {
    const handleCopy = (e) => {
      const selection = window.getSelection().toString();
      if (selection) {
        e.clipboardData.setData("text/plain", selection.trim());
        e.preventDefault();
      }
    };

    document.addEventListener("copy", handleCopy);
    return () => document.removeEventListener("copy", handleCopy);
  }, []);

  const handleTableChange = (pagination, filters, sorter) => {
    setPageSize(pagination.pageSize);
    setCurrentPage(pagination.current);
    if (onPaginationChange) {
      onPaginationChange({
        page: pagination.current,
        limit: pagination.pageSize,
        sorter: sorter,
      });
    }
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
          getCheckboxProps: getCheckboxProps,
          renderCell: (checked, record, index, originNode) => {
            if (record.rowSpan !== undefined) {
              return {
                children: originNode,
                props: {
                  rowSpan: record.rowSpan,
                },
              };
            }
            return originNode;
          },
        };

  const paginationConfig = {
    current: page_number || 1,
    pageSize: limit || 10,
    showSizeChanger: true,
    total: totalPageNumber || 0,
    pageSizeOptions: ["10", "20", "50", "100"],
    position: ["bottomRight"],
    showLessItems: true,
    itemRender: (page, type, originalElement) => {
      const safeLimit = limit || 10;
      const totalPages = Math.ceil((totalPageNumber || 0) / safeLimit);

      if (type === "prev") {
        const isDisabled = page_number === 1;
        return (
          <div
            className="commontable_pagination_prevbutton"
            style={{ opacity: isDisabled ? 0.6 : 1 }}
          >
            <GrFormPrevious size={15} />
          </div>
        );
      }
      if (type === "next") {
        const isDisabled = page_number === totalPages;
        return (
          <div
            style={{ opacity: isDisabled ? 0.6 : 1 }}
            className="commontable_pagination_prevbutton"
          >
            <GrFormNext size={15} />
          </div>
        );
      }
      return originalElement;
    },
  };

  return (
    <div ref={tableWrapperRef} style={{ position: "relative", width: "100%" }}>
      <Table
        rowSelection={rowSelection}
        columns={columns}
        dataSource={dataSource}
        scroll={scroll}
        pagination={disableLocalPagination ? false : paginationConfig}
        onChange={handleTableChange}
        tableLayout="fixed"
        bordered={bordered === "true"}
        loading={loading}
        size={size}
        className={className}
        rowClassName={rowClassName}
        sticky={sticky}
        summary={summary}
        rowKey={rowKey || ((record) => record.id || record.row_num || record.question_id)}
      />
      
      {/* We place a transparent boundary element right after the table to detect when the bottom of the table is visible */}
      <div ref={bottomBoundaryRef} style={{ height: "1px", width: "100%" }} />
      
      {disableLocalPagination && (totalPageNumber || 0) > 0 && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginTop: 16 }}>
          <Pagination
            {...paginationConfig}
            onChange={(page, pageSize) => {
              handleTableChange({ current: page, pageSize }, {}, {});
            }}
          />
        </div>
      )}

      {showCustomScroll && (
        <div
          ref={customScrollRef}
          className="custom-horizontal-scrollbar"
          style={{
            position: "sticky",
            bottom: 0,
            width: "100%",
            overflowX: "auto",
            overflowY: "hidden",
            zIndex: 999,
          }}
        >
          <div style={{ width: scrollWidth, height: "1px" }} />
        </div>
      )}
    </div>
  );
};

export default CommonTable;
