import InvestmentPlans from '../../Models/admin/investmentsPlan.js'
const getPlans = async (req, res, next) => {
  try {
    const plans = await InvestmentPlans.find().sort({ minAmount: 1 });
    res.status(200).json(plans);
  } catch (error) {
    next(error);
    // res.status(500).json({ message: 'Error fetching plans', error: error.message });
  }
};

const deletePlan = async (req, res, next) => {
  try {
    await InvestmentPlans.findByIdAndDelete(req.params.id)
    res.json({ message: 'Plan deleted' })
  } catch (err) {
    next(err);
    // res.status(500).json({ message: 'Error deleting plan' })
  }
}

const getSinglePlan = async (req, res, next) => {
  try {
    const plan = await InvestmentPlans.findById(req.params.id);
    if (!plan) return res.status(404).json({ message: 'Plan not found' });
    res.status(200).json(plan);
  } catch (err) {
    next(err);
  }
};

const updatePlan = async (req, res, next) => {
  try {
    const plan = await InvestmentPlans.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!plan) return res.status(404).json({ message: 'Plan not found' });

    res.status(200).json({ message: 'Plan updated successfully', plan });
  } catch (err) {
    next(err);
  }
};

const createPlan = async (req, res, next) => {
  try {
    const { title, minAmount, maxAmount, dailyROI, features } = req.body;

    const plan = new InvestmentPlans({
      title,
      minAmount,
      maxAmount,
      dailyROI,
      features,
    });

    await plan.save();
    res.status(201).json({ message: "Plan created successfully", plan });
  } catch (err) {
    next(err); 
  }
};

export {
  getPlans,
  deletePlan,
  getSinglePlan,
  updatePlan,
  createPlan
};
