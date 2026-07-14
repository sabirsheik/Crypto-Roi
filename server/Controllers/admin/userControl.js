import User from "../../Models/authuser.js";

// GET /api/admin/all-users
export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find(
      { role: "user" }, // 🔹 Sirf 'user' role wale
      `
      name
      email
      phone
      country
      createdAt
      referralCode
      role
      lifetimeInvestment
      wallets.main
      wallets.profit
      wallets.cashbox
      wallets.split
      wallets.affiliate
    `
    ).lean();

    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Server Error" });
  }
};


// PUT /api/admin/update-user/:id
export const updateUserByAdmin = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, country, role } = req.body;

    const existing = await User.findOne({ email });
    if (existing && existing._id.toString() !== id) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const updated = await User.findByIdAndUpdate(
      id,
      { name, email, phone, country, role },
      { new: true, runValidators: true }
    ).select("-password");

    res.status(200).json(updated);
  } catch (error) {
    next(error);
  }
};

// DELETE /api/admin/delete-user/:id
export const deleteUser = async (req, res, next) => {
  try {
    const { id } = req.params;
    await User.findByIdAndDelete(id);
    res.status(200).json({ message: "User deleted successfully." });
  } catch (error) {
    next(error);
  }
};
