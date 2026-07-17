/** Image URLs from screens/personal/00_empty screens/03_Create/code.html */

export const PERSONAL_CREATE_HERO_IMAGE =
  "https://lh3.googleusercontent.com/aida-public/AB6AXuA-S5hG0-m2gK7pruw9pAacUUi6vRS76o8dtsf9SMzqCBdjZ4yluSijLvjn1aRJQZ_BGQm4FnGJyFqeWVk9Kc2q72tPM6zMC3Rf02WS-TsizKYSjJXdF4jfvpM67eUG07_XHwFvGkUUrtc95Ure9l4dtNe4n-3Z_kmxUn2LylDbgT7ZfnIMO02O8QuIjz0KWFlvT4yDH_T1briMXK8s4S_VXKh6m7URqwfwgbJf4c9wRsDte-mMJPawD3imvJS5xr_UC9ptn5GYNhqr";

export const PERSONAL_CREATE_CARD_IMAGES: Record<string, string> = {
  FUTURE_BUILDING:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAVI8xNBoBnynn3P4hF7o9KqOuveWw2FFOu8FNd7sRQjlQW6RUzfBAZakp3A6U3ktxa3ARm_3YcA0klnhwuK3ovMANZ7xYwqlgB4YN1P26CUxrTsgLUcOvLzdhu8zXEwztt9VC40VDXp44OZ2dudDxc-y4GNxYnSt86mjwAFm07iBoqmjtbwtpSif15BOjzcLPvEvmzUx8UKM4X0CNC991a8GnX9FyDechiXUyAXgjRV6-bcWkUuhzBBF0QMN-79FyUkMPZQii8TiNp",
  LIFESTYLE:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuAWrvAJ8ma6E4rJJpC8kaOjpHJYml-mAo3C1iEMOTfLVGJ_bks32OdGYEqCKVOknwO0ZUn-zhfngMErpWKdoiwqrbISjakke8XbdgqNkJtBQ-tZ_shR5SNbA11HVHpENcRSnD9ZACQAkU_dBdScZ_VSN0EsEW2jwpxJShdnmy-iRVz2gCm-SmmJgTQ9jkWu7teA0Y2MKSB8YPc_dpvLt_8XskLvHTJ9omfQadEDsUGfYYi4KRPNIvmP-oKd6b55ZftSTnI10haZIloR",
  RELATIONSHIPS:
    "https://lh3.googleusercontent.com/aida-public/AB6AXuBMWapMgbyBl8QX8MLhRuBs2nNSyvv3NmOYzgd0qfsHtVYQRXU8BFIMEu-oqGNIXaAf7t_LBuihYC4l37iOvuBEbAUj2H3dfY6nDT3V0FFxtxALMO-NKsXpIwq4bQmJHdbIXaNzs7_jAmM3DxNzmYG1dYjcBfip12x4nQD6wSS9HJeSYOcrvJnmMVY44ycjswsNZgwshWr8jhdQEohPyIUJf0Gf0k9GtmaS5xTUg1ZJLZwSKFJmykUT7DmpAIMVsa9Tni9OWxgJMNNB",
};

export function createCardImageForType(momentTypeCode: string): string {
  const key =
    momentTypeCode.toUpperCase() === "EMOTIONAL_SECURITY"
      ? "RELATIONSHIPS"
      : momentTypeCode.toUpperCase();
  return (
    PERSONAL_CREATE_CARD_IMAGES[key] ??
    PERSONAL_CREATE_CARD_IMAGES.FUTURE_BUILDING
  );
}
