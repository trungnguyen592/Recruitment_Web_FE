import {
  Button,
  Col,
  Form,
  Input,
  Modal,
  Row,
  Select,
  Table,
  Tabs,
  message,
  notification,
} from "antd";
import { isMobile } from "react-device-detect";
import type { TabsProps } from "antd";
import { IResume, IUser } from "@/types/backend";
import { useState, useEffect } from "react";
import {
  callFetchResumeByUser,
  callGetSubscriberSkills,
  callUpdateSubscriber,
  callUpdateUser,
} from "@/config/api";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { MonitorOutlined } from "@ant-design/icons";
import { SKILLS_LIST } from "@/config/utils";
import { useAppDispatch, useAppSelector } from "@/redux/hooks";
import { setUserUpdateInfo } from "@/redux/slice/accountSlide";
interface IProps {
  open: boolean;
  onClose: (v: boolean) => void;
}

const UserResume = (props: any) => {
  const [listCV, setListCV] = useState<IResume[]>([]);
  const [isFetching, setIsFetching] = useState<boolean>(false);

  useEffect(() => {
    const init = async () => {
      setIsFetching(true);
      const res = await callFetchResumeByUser();
      console.log("API Response:", res);
      if (res && res.data) {
        setListCV(res.data as IResume[]);
      }
      setIsFetching(false);
    };
    init();
  }, []);

  const columns: ColumnsType<IResume> = [
    {
      title: "STT",
      key: "index",
      width: 50,
      align: "center",
      render: (text, record, index) => {
        return <>{index + 1}</>;
      },
    },
    {
      title: "Công Ty",
      dataIndex: ["companyId", "name"],
    },
    {
      title: "Vị trí",
      dataIndex: ["jobId", "name"],
    },
    {
      title: "Trạng thái",
      dataIndex: "status",
    },
    {
      title: "Ngày rải CV",
      dataIndex: "createdAt",
      render(value, record, index) {
        return <>{dayjs(record.createdAt).format("DD-MM-YYYY HH:mm:ss")}</>;
      },
    },
    {
      title: "",
      dataIndex: "",
      render(value, record, index) {
        return (
          <a
            href={`${import.meta.env.VITE_BACKEND_URL}/images/resume/${
              record?.url
            }`}
            target="_blank"
          >
            Chi tiết
          </a>
        );
      },
    },
  ];

  return (
    <div>
      <Table<IResume>
        columns={columns}
        dataSource={listCV}
        loading={isFetching}
        pagination={false}
      />
    </div>
  );
};

const UserUpdateInfo = (props: any) => {
  const [form] = Form.useForm();
  const [age, setAge] = useState<string>(""); // Định kiểu state là string
  const handleAgeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, ""); // Chỉ giữ số
    setAge(value);
  };
  const user = useAppSelector((state) => state.account.user);
  const dispatch = useAppDispatch(); // Sử dụng useAppDispatch để dispatch action

  useEffect(() => {
    if (user) {
      form.setFieldsValue({
        name: user.name,
        email: user.email,
        age: user.age,
        gender: user.gender,
        address: user.address,
      });
    }
  }, [user]);

  const onFinish = async (values: IUser) => {
    const { name, email, age, gender, address } = values;

    if (!user._id) {
      notification.error({
        message: "Lỗi",
        description: "Không tìm thấy ID người dùng!",
      });
      return;
    }

    const res = await callUpdateUser(user._id, {
      name,
      email,
      age,
      gender,
      address,
    });

    if (res.data) {
      message.success("Cập nhật thông tin thành công");
      dispatch(setUserUpdateInfo({ name, email, age, gender, address }));
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description: res.message,
      });
    }
  };

  return (
    <>
      <Form onFinish={onFinish} form={form}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <Form.Item label={"Họ và tên"} name={"name"}>
              <Input placeholder="Nhập họ và tên" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={"Email"} name={"email"}>
              <Input placeholder="Nhập email" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label="Tuổi" name="age">
              <Input
                placeholder="Nhập tuổi"
                value={age}
                onChange={handleAgeChange} // Chặn nhập chữ
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={"Giới tính"} name={"gender"}>
              <Select placeholder="Chọn giới tính">
                <Select.Option value="male">Nam</Select.Option>
                <Select.Option value="female">Nữ</Select.Option>
                <Select.Option value="other">Khác</Select.Option>
              </Select>
            </Form.Item>
          </Col>
          <Col span={24}>
            <Form.Item label={"Địa chỉ"} name={"address"}>
              <Input placeholder="Nhập địa chỉ" />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Button onClick={() => form.submit()}>Cập nhật</Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

const JobByEmail = (props: any) => {
  const [form] = Form.useForm();
  const user = useAppSelector((state) => state.account.user);

  useEffect(() => {
    const init = async () => {
      const res = await callGetSubscriberSkills();
      if (res && res.data) {
        form.setFieldValue("skills", res.data.skills);
      }
    };
    init();
  }, []);

  const onFinish = async (values: any) => {
    const { skills } = values;
    const res = await callUpdateSubscriber({
      email: user.email,
      name: user.name,
      skills: skills ? skills : [],
    });
    if (res.data) {
      message.success("Cập nhật thông tin thành công");
    } else {
      notification.error({
        message: "Có lỗi xảy ra",
        description: res.message,
      });
    }
  };

  return (
    <>
      <Form onFinish={onFinish} form={form}>
        <Row gutter={[20, 20]}>
          <Col span={24}>
            <Form.Item
              label={"Kỹ năng"}
              name={"skills"}
              rules={[
                { required: true, message: "Vui lòng chọn ít nhất 1 skill!" },
              ]}
            >
              <Select
                mode="multiple"
                allowClear
                showArrow={false}
                style={{ width: "100%" }}
                placeholder={
                  <>
                    <MonitorOutlined /> Tìm theo kỹ năng...
                  </>
                }
                optionLabelProp="label"
                options={SKILLS_LIST}
              />
            </Form.Item>
          </Col>
          <Col span={24}>
            <Button onClick={() => form.submit()}>Cập nhật</Button>
          </Col>
        </Row>
      </Form>
    </>
  );
};

const ManageAccount = (props: IProps) => {
  const { open, onClose } = props;

  const onChange = (key: string) => {
    // console.log(key);
  };

  const items: TabsProps["items"] = [
    {
      key: "user-resume",
      label: `Rải CV`,
      children: <UserResume />,
    },
    {
      key: "email-by-skills",
      label: `Nhận Jobs qua Email`,
      children: <JobByEmail />,
    },
    {
      key: "user-update-info",
      label: `Cập nhật thông tin`,
      children: <UserUpdateInfo />,
    },
    {
      key: "user-password",
      label: `Thay đổi mật khẩu`,
      children: `//todo`,
    },
  ];

  return (
    <>
      <Modal
        title="Quản lý tài khoản"
        open={open}
        onCancel={() => onClose(false)}
        maskClosable={false}
        footer={null}
        destroyOnClose={true}
        width={isMobile ? "100%" : "1000px"}
      >
        <div style={{ minHeight: 400 }}>
          <Tabs
            defaultActiveKey="user-resume"
            items={items}
            onChange={onChange}
          />
        </div>
      </Modal>
    </>
  );
};

export default ManageAccount;
