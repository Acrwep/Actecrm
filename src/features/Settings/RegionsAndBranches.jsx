import React, { useEffect, useState } from "react";
import CommonTable from "../Common/CommonTable";
import CommonSelectField from "../Common/CommonSelectField";
import { useSelector } from "react-redux";
import { Modal } from "antd";
import {
  getBranchManagers,
  updateBranchManager,
  assignBranchManager,
  getUsers,
} from "../ApiService/action";

export default function RegionAndBranches() {
  const [allUsersList, setAllUsersList] = useState([]);

  const [loading, setLoading] = useState(false);
  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const [data, setData] = useState([]);

  const fetchBranchManagers = async () => {
    try {
      setLoading(true);
      const res = await getBranchManagers();
      if (res.data && res.data.data) {
        setData(res.data.data);
      }
    } catch (error) {
      console.error(error);
    } finally {
      getUsersData();
    }
  };

  const getUsersData = async () => {
    const payload = {
      page: 1,
      limit: 1000,
    };
    try {
      const response = await getUsers(payload);
      console.log("users response", response);
      setAllUsersList(response?.data?.data?.data || []);
    } catch (error) {
      setAllUsersList([]);
      console.log("get all users error", error);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerUpdate = (
    branch_id,
    regional_manager_id,
    branch_manager_id,
    record,
    columnName,
  ) => {
    Modal.confirm({
      title: "Confirm Assignment",
      content: (
        <span style={{ fontSize: "13px" }}>
          Are you sure you want to change the{" "}
          <span style={{ fontWeight: 600 }}>{columnName}</span> for{" "}
          <span style={{ fontWeight: 600 }}>{record.branch_name}</span>?
        </span>
      ),
      onOk: async () => {
        try {
          setLoading(true);
          if (!record.id) {
            await assignBranchManager({
              branch_id,
              regional_manager_id,
              branch_manager_id,
            });
          } else {
            await updateBranchManager({
              branch_id,
              regional_manager_id,
              branch_manager_id,
            });
          }
          await fetchBranchManagers();
        } catch (error) {
          console.error(error);
          setLoading(false);
        }
      },
      onCancel: () => {
        // Refresh data to reset the dropdown's visual state if canceled
        // fetchBranchManagers();
      },
    });
  };

  const columns = [
    { title: "Region Name", key: "region_name", dataIndex: "region_name" },
    { title: "Branch Name", key: "branch_name", dataIndex: "branch_name" },
    {
      title: "Regional Manager",
      key: "regional_manager_name",
      dataIndex: "regional_manager_name",
      render: (_, record) => {
        return (
          <CommonSelectField
            label={""}
            height="33px"
            labelMarginTop="0px"
            labelFontSize="11px"
            options={allUsersList}
            value={record.regional_manager_id}
            onChange={(e) =>
              handleManagerUpdate(
                record.branch_id,
                e.target.value,
                record.branch_manager_id,
                record,
                "Regional Manager",
              )
            }
          />
        );
      },
    },
    {
      title: "Branch Manager",
      key: "branch_manager_name",
      dataIndex: "branch_manager_name",
      render: (_, record) => {
        return (
          <CommonSelectField
            label={""}
            height="33px"
            labelMarginTop="0px"
            labelFontSize="11px"
            options={allUsersList}
            value={record.branch_manager_id}
            onChange={(e) =>
              handleManagerUpdate(
                record.branch_id,
                record.regional_manager_id,
                e.target.value,
                record,
                "Branch Manager",
              )
            }
          />
        );
      },
    },
  ];

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  useEffect(() => {
    fetchBranchManagers();
  }, []);

  return (
    <div>
      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 600 }}
          columns={columns}
          dataSource={data}
          dataPerPage={10}
          loading={loading}
          checkBox="false"
          size="small"
          className="questionupload_table"
          onPaginationChange={handlePaginationChange} // callback to fetch new data
          limit={pagination.limit} // page size
          page_number={pagination.page} // current page
          totalPageNumber={pagination.total} // total rows
        />
      </div>
    </div>
  );
}
