document.addEventListener("DOMContentLoaded", function () {
  // URL에서 creditTab 파라미터 확인
  const urlParams = new URLSearchParams(window.location.search);
  const hasCreditParams = urlParams.has("creditTab");

  // creditTab 파라미터가 있으면 신용등급별 탭을 활성화
  if (hasCreditParams) {
    const creditTab = document.querySelector('a[href="#credit"]');
    const periodicTab = document.querySelector('a[href="#periodic"]');
    const creditPane = document.querySelector("#credit");
    const periodicPane = document.querySelector("#periodic");

    creditTab.classList.add("active");
    periodicTab.classList.remove("active");
    creditPane.classList.add("show", "active");
    periodicPane.classList.remove("show", "active");
  }
});
