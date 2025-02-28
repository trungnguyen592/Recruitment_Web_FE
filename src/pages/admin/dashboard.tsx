import { Card, Col, Row, Statistic, Spin } from "antd";
import CountUp from "react-countup";
import { useSelector, useDispatch } from "react-redux";
import { useEffect } from "react";
import { fetchCompany } from "@/redux/slice/companySlide";
import { fetchJob } from "@/redux/slice/jobSlide";
import { fetchResume } from "@/redux/slice/resumeSlide";
import { AppDispatch, RootState } from "@/redux/store";

const DashboardPage = () => {
  const dispatch = useDispatch<AppDispatch>();

  // Gọi API để lấy dữ liệu ngay khi vào trang Dashboard
  useEffect(() => {
    dispatch(fetchCompany({ query: "" })); // Lấy danh sách công ty
    dispatch(fetchJob({ query: "" })); // Lấy danh sách công việc
    dispatch(fetchResume({ query: "" })); // Lấy danh sách hồ sơ
  }, [dispatch]);

  // Lấy dữ liệu từ Redux store
  const companyState = useSelector((state: RootState) => state.company);
  const jobState = useSelector((state: RootState) => state.job);
  const resumeState = useSelector((state: RootState) => state.resume);

  // Kiểm tra xem dữ liệu có đang được tải không
  const isLoading =
    companyState.isFetching || jobState.isFetching || resumeState.isFetching;

  // Hàm format số liệu để hiển thị hiệu ứng đếm số
  const formatter = (value: number | string) => (
    <CountUp end={Number(value)} separator="," />
  );

  return (
    // Hiển thị loading khi dữ liệu đang được tải
    <Spin spinning={isLoading} tip="Đang tải dữ liệu...">
      <Row gutter={[20, 20]}>
        {/* Thống kê tổng số công ty */}
        <Col span={24} md={8}>
          <Card title="Tổng số công ty" bordered={false}>
            <Statistic
              title="Companies"
              value={companyState.result.length}
              formatter={formatter}
            />
          </Card>
        </Col>

        {/* Thống kê tổng số công việc */}
        <Col span={24} md={8}>
          <Card title="Tổng số công việc" bordered={false}>
            <Statistic
              title="Jobs"
              value={jobState.result.length}
              formatter={formatter}
            />
          </Card>
        </Col>

        {/* Thống kê tổng số hồ sơ */}
        <Col span={24} md={8}>
          <Card title="Tổng số hồ sơ" bordered={false}>
            <Statistic
              title="Resumes"
              value={resumeState.result.length}
              formatter={formatter}
            />
          </Card>
        </Col>
      </Row>
    </Spin>
  );
};

export default DashboardPage;
