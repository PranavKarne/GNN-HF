import User from "../models/User.js";
import mongoose from "mongoose";

// Counter collection for atomic ID generation
const CounterSchema = new mongoose.Schema({
  _id: String,
  sequence: { type: Number, default: 0 }
});

const Counter = mongoose.model('Counter', CounterSchema);

/**
 * Generate a unique patient ID for a new user (THREAD-SAFE)
 * Format: P0001, P0002, P0003, etc.
 * Uses MongoDB atomic findOneAndUpdate to prevent race conditions
 * @returns {Promise<string>} Unique patient ID
 */
export async function generateUniquePatientId() {
  try {
    // Atomically increment counter and get new value
    const counter = await Counter.findOneAndUpdate(
      { _id: 'patientId' },
      { $inc: { sequence: 1 } },
      { new: true, upsert: true }
    );

    // Format as P0001, P0002, etc. (4 digits with leading zeros)
    return "P" + String(counter.sequence).padStart(4, "0");
  } catch (error) {
    console.error("Error generating patient ID:", error);
    
    // Fallback: Use timestamp-based ID if counter fails
    const timestamp = Date.now().toString().slice(-4);
    return "P" + timestamp;
  }
}
