import React, { useState } from "react";
import { Row, Col, Drawer, Checkbox, Modal, Divider } from "antd";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { CiSearch } from "react-icons/ci";
import CommonInputField from "../Common/CommonInputField";
import CommonOptionsMultiSelect from "../Common/CommonOptionsMultiSelect";
import CommonTable from "../Common/CommonTable";
import "./styles.css";

export default function PageAccess() {
  const [isOpenAddDrawer, setIsOpenAddDrawer] = useState(false);
  const [isOpenUserModal, setIsOpenUserModal] = useState(false);
  const groupData = [
    { id: 1, name: "Test", initial: "VK", Users: "5" },
    { id: 2, name: "Test", initial: "BJ", Users: "3" },
    { id: 2, name: "Test", initial: "ST", Users: "4" },
  ];

  const usertableColumns = [
    { title: "Name", key: "name", dataIndex: "name" },
    { title: "Email", key: "email", dataIndex: "email", width: 190 },
    { title: "Mobile", key: "mobile", dataIndex: "mobile" },
    { title: "Fees", key: "fees", dataIndex: "fees" },
    { title: "Balance", key: "balance", dataIndex: "balance" },
  ];

  const usersData = [
    {
      id: 1,
      name: "Balaji",
      email: "balaji@gmail.com",
      mobile: "9787564545",
      fees: "12000",
      balance: "3000",
    },
  ];

  const formReset = () => {
    setIsOpenAddDrawer(false);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div className="leadmanager_filterContainer">
            <CommonOutlinedInput
              label="Search"
              width="40%"
              height="33px"
              labelFontSize="12px"
              icon={<CiSearch size={16} />}
              labelMarginTop="-1px"
            />
          </div>
        </Col>
        <Col
          xs={24}
          sm={24}
          md={24}
          lg={12}
          style={{
            display: "flex",
            justifyContent: "flex-end",
            alignItems: "center",
          }}
        >
          <button
            className="leadmanager_addleadbutton"
            onClick={() => {
              setIsOpenAddDrawer(true);
            }}
          >
            Add Group
          </button>
        </Col>
      </Row>

      <Row gutter={24} style={{ marginTop: "20px" }}>
        {groupData.map((item, index) => {
          return (
            <React.Fragment>
              <Col span={8} style={{ marginBottom: "20px" }}>
                <div
                  className="settings_groupcard"
                  style={{
                    borderLeft:
                      index === 0
                        ? "3px solid #753f2f"
                        : index === 1
                        ? "3px solid #2c2653"
                        : index === 2
                        ? "3px solid #2b4651"
                        : "3px solid #753f2f",
                  }}
                >
                  <div style={{ display: "flex", gap: "16px" }}>
                    <div
                      className="groupname_container"
                      style={{
                        backgroundColor:
                          index === 0
                            ? "#f2d5cd"
                            : index === 1
                            ? "#d6d4e9"
                            : index === 2
                            ? "#d6e3e9"
                            : "#f2d5cd",
                        color:
                          index === 0
                            ? "#753f2f"
                            : index === 1
                            ? "#2c2653"
                            : index === 2
                            ? "#2b4651"
                            : "#753f2f",
                      }}
                    >
                      <p>{item.initial}</p>
                    </div>

                    <div className="settings_group_contentContainer">
                      <p>
                        Group Name:{" "}
                        <span style={{ fontWeight: 600 }}>{item.name}</span>
                      </p>
                      <p>
                        Users:{" "}
                        <span style={{ fontWeight: 600 }}>{item.user}</span>
                      </p>
                    </div>
                  </div>

                  <div className="settings_groupcard_footer_container">
                    <button
                      className="settings_group_footer_buttons"
                      onClick={() => setIsOpenUserModal(true)}
                    >
                      View Users
                    </button>
                    <button className="settings_group_footer_buttons">
                      View Permission
                    </button>{" "}
                  </div>
                </div>
              </Col>
            </React.Fragment>
          );
        })}
      </Row>

      {/* add group drawer */}
      <Drawer
        title="Add Group"
        open={isOpenAddDrawer}
        onClose={formReset}
        width="48%"
        className="settings_addgroup_drawer"
      >
        <Row gutter={16} style={{ padding: "24px 24px 0px 24px" }}>
          <Col span={12}>
            <CommonInputField label="Name" required={true} />
          </Col>
          <Col span={12}>
            <CommonOptionsMultiSelect
              label="Users"
              required={true}
              options={[{ id: 1, title: "Balaji" }]}
            />
          </Col>
        </Row>

        <p className="settings_permission_heading">Permissions</p>

        <p className="settings_permission_subheading">Dashboard Access</p>
        <div style={{ padding: "0px 24px 0px 24px" }}>
          <Row style={{ marginTop: "16px" }}>
            <Col span={8}>
              <Checkbox className="settings_pageaccess_checkbox">
                Dashboard
              </Checkbox>{" "}
            </Col>
            <Col span={8}>
              <Checkbox className="settings_pageaccess_checkbox">
                Academic Dashboard
              </Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox className="settings_pageaccess_checkbox">
                SALES Report Dashboard
              </Checkbox>
            </Col>
          </Row>

          <Row style={{ marginTop: "20px" }}>
            <Col span={8}>
              <Checkbox className="settings_pageaccess_checkbox">
                BDE Report Dashboard
              </Checkbox>{" "}
            </Col>
            <Col span={8}>
              <Checkbox className="settings_pageaccess_checkbox">
                HR Report Dashboard
              </Checkbox>
            </Col>
          </Row>
        </div>

        <Divider className="settings_addgroupdrawer_divider" />
        <p className="settings_permission_subheading">Target Access</p>
        <div style={{ padding: "0px 24px 0px 24px" }}>
          <Row style={{ marginTop: "16px" }}>
            <Col span={8}>
              <Checkbox className="settings_pageaccess_checkbox">
                Ledger Board
              </Checkbox>{" "}
            </Col>
            <Col span={8}>
              <Checkbox className="settings_pageaccess_checkbox">
                Monthly
              </Checkbox>
            </Col>
            <Col span={8}>
              <Checkbox className="settings_pageaccess_checkbox">
                Weekly
              </Checkbox>
            </Col>
          </Row>
        </div>

        <div className="leadmanager_tablefiler_footer">
          <div className="leadmanager_submitlead_buttoncontainer">
            <button className="leadmanager_tablefilter_applybutton">Add</button>
          </div>
        </div>
      </Drawer>

      <Modal
        title="Users"
        open={isOpenUserModal}
        onCancel={() => setIsOpenUserModal(false)}
        footer={false}
        width="60%"
      >
        <div style={{ marginTop: "20px" }}>
          <CommonTable
            scroll={{ x: 700 }}
            columns={usertableColumns}
            dataSource={usersData}
            dataPerPage={10}
            // loading={tableLoading}
            checkBox="false"
            size="small"
            paginationStatus={false}
            className="questionupload_table"
          />{" "}
        </div>

        <p className="batch_usermodal_addcandidate">Add User</p>

        <Row>
          <Col span={12}>
            <div className="batch_usermodal_addcandidate_buttonContainer">
              <CommonInputField label="User Name" />
              <button className="batch_usermodal_addcandidate_button">
                + Add
              </button>
            </div>
          </Col>
        </Row>
      </Modal>
    </div>
  );
}
