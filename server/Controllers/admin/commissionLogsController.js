import Commission from "../../Models/admin/commission.js";
export const getAllCommissionLogs = async (req, res) => {
  try {
    const logs = await Commission.find()
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("Commission Logs Error:", error);
    next(error);
  }
};


export const getUserCommissionLogs = async (req, res, next) => {
  try {
    // Get the logged-in user's ID from auth middleware
    const userId = req.user?._id;

    if (!userId) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized — User ID missing",
      });
    }

    // Find all commissions where this user was the receiver
    const logs = await Commission.find({ "receiver.id": userId })
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      count: logs.length,
      logs,
    });
  } catch (error) {
    console.error("User Commission Logs Error:", error);
    next(error);
  }
};


// controllers/commissionController.js
export const clearUserCommissionLogs = async (req, res, next) => {
  try {
    const userId = req.user?._id;
    if (!userId) return res.status(401).json({ success: false, message: "Unauthorized" });
    await Commission.deleteMany({ "receiver.id": userId });
    return res.status(200).json({ success: true, message: "Commission logs cleared" });
  } catch (err) {
    next(err);
  }
};



export const deleteCommissions = async (req, res) => {
  try {
    const { ids } = req.body; // For bulk delete
    const commissionId = req.params.id; // For single delete

    if (ids && Array.isArray(ids) && ids.length > 0) {
      // Bulk delete
      await Commission.deleteMany({ _id: { $in: ids } });
      return res.status(200).json({ message: `${ids.length} commissions deleted successfully` });
    }

    if (commissionId) {
      // Single delete
      const commission = await Commission.findById(commissionId);
      if (!commission) {
        return res.status(404).json({ message: "Commission not found" });
      }

      await Commission.findByIdAndDelete(commissionId);
      return res.status(200).json({ message: "Commission deleted successfully" });
    }

    return res.status(400).json({ message: "No IDs provided for deletion" });
  } catch (error) {
    console.error("Delete Commission Error:", error.message);
    return res.status(500).json({ message: "Failed to delete commissions" });
  }
};
