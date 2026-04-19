import mongoose from 'mongoose';

const TravelPlanSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    destination: {
      type: String,
      required: true,
    },
    duration: {
      type: Number,
      required: true,
    },
    budget: {
      type: Number,
      required: true,
    },
    currency: {
      type: String,
      required: true,
    },
    travelers: {
      type: Number,
      default: 1,
    },
    planDetails: {
      type: Object, // Will store the JSON response from AI
      required: true,
    },
    coverImage: {
      type: String,
    },
  },
  { timestamps: true }
);

export default mongoose.models.TravelPlan || mongoose.model('TravelPlan', TravelPlanSchema);
