import React, { useState, useEffect } from "react";
import { Row, Col, Flex, Tooltip, Radio, Button, Modal } from "antd";
import { CiSearch } from "react-icons/ci";
import { IoIosClose } from "react-icons/io";
import { AiOutlineEdit } from "react-icons/ai";
import { RiDeleteBinLine } from "react-icons/ri";
import CommonOutlinedInput from "../Common/CommonOutlinedInput";
import { useDispatch, useSelector } from "react-redux";
import CommonTable from "../Common/CommonTable";
import CommonSpinner from "../Common/CommonSpinner";
import CommonInputField from "../Common/CommonInputField";
import { addressValidator, selectValidator } from "../Common/Validation";
import {
  createTechnology,
  deleteTechnology,
  getTechnologies,
  updateTechnology,
} from "../ApiService/action";
import { storeSettingsCourseList } from "../Redux/Slice";
import moment from "moment";
import { CommonMessage } from "../Common/CommonMessage";
import CommonDeleteModal from "../Common/CommonDeleteModal";

export default function Courses() {
  const dispatch = useDispatch();
  const courseData = useSelector((state) => state.settingscourselist);

  const [searchValue, setSearchValue] = useState("");
  const [buttonLoading, setButtonLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  //add course modal
  const [isOpenAddModal, setIsOpenAddModal] = useState(false);
  const [courseId, setCourseId] = useState(null);
  const [courseName, setCourseName] = useState("");
  const [courseNameError, setCourseNameError] = useState("");
  const [price, setPrice] = useState(0);
  const [priceError, setPriceError] = useState("");
  const [offerPrice, setOfferPrice] = useState(0);
  //delete modal
  const [isOpenDeleteModal, setIsOpenDeleteModal] = useState(false);

  //pagination
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const columns = [
    { title: "Name", key: "name", dataIndex: "name", width: 200 },
    {
      title: "Price",
      key: "price",
      dataIndex: "price",
      width: 200,
      render: (text) => {
        return (
          <p>{`${Number(text).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}</p>
        );
      },
    },
    {
      title: "Offer Price",
      key: "offer_price",
      dataIndex: "offer_price",
      width: 200,
      render: (text) => {
        return (
          <p>{`${Number(text).toLocaleString("en-IN", {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}</p>
        );
      },
    },
    {
      title: "Action",
      key: "action",
      dataIndex: "action",
      width: 130,
      render: (text, record) => {
        return (
          <div className="trainers_actionbuttonContainer">
            <AiOutlineEdit
              size={20}
              className="trainers_action_icons"
              onClick={() => handleEdit(record)}
            />

            <RiDeleteBinLine
              color="#d32f2f"
              size={19}
              className="trainers_action_icons"
              onClick={() => {
                setCourseId(record.id);
                setIsOpenDeleteModal(true);
              }}
            />
          </div>
        );
      },
    },
  ];

  const handleSearch = (e) => {
    setSearchValue(e.target.value);
    setLoading(true);
    setTimeout(() => {
      getCourseData(e.target.value);
    }, 300);
  };

  const handlePaginationChange = ({ page, limit }) => {
    setPagination({
      page: page,
      limit: limit,
    });
  };

  const getCourseData = async (searchvalue) => {
    setLoading(true);
    const payload = {
      ...(searchvalue && { name: searchvalue }),
    };
    try {
      const response = await getTechnologies(payload);
      dispatch(storeSettingsCourseList(response?.data?.data || []));
    } catch (error) {
      dispatch(storeSettingsCourseList([]));
      console.log("response status error", error);
    } finally {
      setTimeout(() => {
        setLoading(false);
      }, 300);
    }
  };

  const handleSubmit = async () => {
    const nameValidate = addressValidator(courseName);
    const priceValidate = selectValidator(price);

    setCourseNameError(nameValidate);
    setPriceError(priceValidate);

    if (nameValidate || priceValidate) return;

    const payload = {
      ...(courseId && { id: courseId }),
      course_name: courseName,
      price: price,
      offer_price: offerPrice,
    };
    setButtonLoading(true);

    if (courseId) {
      try {
        await updateTechnology(payload);
        CommonMessage("success", "Course Updated");
        setTimeout(() => {
          setButtonLoading(false);
          formReset();
          getCourseData(searchValue);
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    } else {
      try {
        await createTechnology(payload);
        CommonMessage("success", "Course Created");
        setTimeout(() => {
          setButtonLoading(false);
          formReset();
          getCourseData(searchValue);
        }, 300);
      } catch (error) {
        setButtonLoading(false);
        CommonMessage(
          "error",
          error?.response?.data?.details ||
            "Something went wrong. Try again later"
        );
      }
    }
  };

  const handleEdit = (item) => {
    setCourseId(item.id);
    setCourseName(item.name);
    setPrice(item.price);
    setOfferPrice(item.offer_price);
    setIsOpenAddModal(true);
  };

  const handleDelete = async () => {
    setButtonLoading(true);
    try {
      await deleteTechnology(courseId);
      CommonMessage("success", "Course Deleted");
      setTimeout(() => {
        setButtonLoading(false);
        formReset();
        getCourseData(searchValue);
      }, 300);
    } catch (error) {
      setButtonLoading(false);
      CommonMessage(
        "error",
        error?.response?.data?.details ||
          "Something went wrong. Try again later"
      );
    }
  };

  const formReset = () => {
    setIsOpenAddModal(false);
    setButtonLoading(false);
    setIsOpenDeleteModal(false);
    setCourseId(null);
    setCourseName("");
    setCourseNameError("");
    setPrice(0);
    setPriceError("");
    setOfferPrice(0);
  };

  return (
    <div>
      <Row>
        <Col xs={24} sm={24} md={24} lg={12}>
          <div
            className="leadmanager_filterContainer"
            style={{ position: "relative" }}
          >
            <CommonOutlinedInput
              label={"Search By Name"}
              width="40%"
              height="33px"
              labelFontSize="12px"
              icon={
                searchValue ? (
                  <div
                    className="users_filter_closeIconContainer"
                    onClick={() => {
                      setSearchValue("");
                      setPagination({
                        page: 1,
                      });
                      getCourseData(null);
                    }}
                  >
                    <IoIosClose size={11} />
                  </div>
                ) : (
                  <CiSearch size={16} />
                )
              }
              labelMarginTop="-1px"
              style={{
                padding: searchValue ? "0px 26px 0px 0px" : "0px 8px 0px 0px",
              }}
              onChange={handleSearch}
              value={searchValue}
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
              setIsOpenAddModal(true);
            }}
          >
            Add Course
          </button>
        </Col>
      </Row>

      <div style={{ marginTop: "20px" }}>
        <CommonTable
          scroll={{ x: 1000 }}
          columns={columns}
          dataSource={courseData}
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

      <Modal
        title={courseId ? "Update Course" : "Create Course"}
        open={isOpenAddModal}
        onCancel={formReset}
        width="35%"
        footer={[
          <Button
            key="cancel"
            onClick={formReset}
            className="leads_coursemodal_cancelbutton"
          >
            Cancel
          </Button>,

          buttonLoading ? (
            <Button
              key="create"
              type="primary"
              className="leads_coursemodal_loading_createbutton"
            >
              <CommonSpinner />
            </Button>
          ) : (
            <Button
              key="create"
              type="primary"
              onClick={handleSubmit}
              className="leads_coursemodal_createbutton"
            >
              {courseId ? "Update" : "Create"}
            </Button>
          ),
        ]}
      >
        <div style={{ marginTop: "20px" }}>
          <CommonInputField
            label="Course Name"
            required={true}
            onChange={(e) => {
              setCourseName(e.target.value);
              setCourseNameError(addressValidator(e.target.value));
            }}
            value={courseName}
            error={courseNameError}
          />
        </div>
        <div style={{ marginTop: "30px" }}>
          <CommonInputField
            label="Price"
            required={true}
            onChange={(e) => {
              setPrice(e.target.value);
              setPriceError(selectValidator(e.target.value));
            }}
            value={price}
            error={priceError}
            type="number"
          />
        </div>
        <div style={{ marginTop: "30px", marginBottom: "20px" }}>
          <CommonInputField
            label="Offer Price"
            required={false}
            onChange={(e) => {
              setOfferPrice(e.target.value);
            }}
            value={offerPrice}
            error=""
          />
        </div>
      </Modal>

      {/* delete Modal */}
      <CommonDeleteModal
        open={isOpenDeleteModal}
        onCancel={formReset}
        content="Are you sure want to delete the course?"
        loading={buttonLoading}
        onClick={handleDelete}
      />
    </div>
  );
}
