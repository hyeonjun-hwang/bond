const formatDate = (dateStr) => {
  if (!dateStr) return null;
  return dateStr.replace(/(\d{4})(\d{2})(\d{2})/, "$1-$2-$3");
};

const getTodayDate = () => {
  const today = new Date();
  return today.toISOString().split("T")[0];
};

// API 요청용 날짜 포맷 함수 추가
const getAPIFormatDate = () => {
  return getTodayDate().replace(/-/g, "");
};

module.exports = {
  formatDate,
  getTodayDate,
  getAPIFormatDate,
};
