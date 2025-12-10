import PatientReport from "../models/PatientReport.js";

export async function generatePatientId(userEmail) {
  const lastReport = await PatientReport.findOne({ userEmail })
    .sort({ patientId: -1 });

  if (!lastReport) return 1;

  return lastReport.patientId + 1;
}
