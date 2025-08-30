// เปิดหน้าโปรโมชั่นตาม campaign ID
export const goToPromotionPage = (campaignId) => {
  window.location.href = `/mypromotion/src/pages/promotion/promotion.php?id=${campaignId}`;
};

// ไปหน้า login
export const goToLoginPage = () => {
  window.location.href = `/src/pages/login/login.php`;
};

// ไปหน้า home
export const goToHomePage = () => {
  window.location.href = `/src/index.php`;
};

// ไปหน้า form
export const goToFormPage = () => {
  window.location.href = `/form/form.html`;
};

// ไปหน้าก่อนหน้า
export const goBack = () => {
  window.history.back();
};
