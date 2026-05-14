const { getAuth } = require("@clerk/express");

const authMiddleware = (req, res, next) => {
  // بنجيب بيانات اليوزر باستخدام getAuth زي ما Clerk طلبت
  const auth = getAuth(req);

  // لو مفيش userId، يبقى اليوزر ده مش مسجل دخول
  if (!auth.userId) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  // لو مسجل دخول، بناخد الآي دي بتاعه ونمرره لباقي الكود بتاعنا
  req.userId = auth.userId;
  next();
};

module.exports = authMiddleware;
