const activeAccountFilter = (req, res, next) => {
  const user = req.user;
  if (user.status === "ACTIVE") {
    next();
  } else {
    return res.status(403).json({ error: "forbidden" });
  }
};

module.exports = {
  activeAccountFilter,
};