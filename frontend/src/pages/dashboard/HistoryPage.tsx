import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { BackToHome } from "@/components/BackToHome";
import { API_ENDPOINTS, API_BASE_URL } from "@/config/api";
import { getAuthHeaders } from "@/config/apiUtils";

import {
  Search,
  Download,
  Eye,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  FileHeart,
  Calendar,
  Image as ImageIcon,
  Activity,
  Trash2,
} from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface AnalysisRecord {
  _id: string;
  patientId: number;

  name: string;
  age: number;
  gender: string;

  symptoms: string;
  medicalHistory: string;

  timestamp: string;

  predictedClass: string;
  confidence: number;
  riskLevel: "low" | "moderate" | "high";
  riskScore: number;

  imagePath: string;
  probabilities: Record<string, number>;
}

export default function HistoryPage() {
  const [search, setSearch] = useState("");
  const [riskFilter, setRiskFilter] = useState<string>("all");
  const [records, setRecords] = useState<AnalysisRecord[]>([]);
  const [selectedRecord, setSelectedRecord] = useState<AnalysisRecord | null>(
    null
  );
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ============================================================
  // ⭐ FETCH ALL REPORTS
  // ============================================================
  useEffect(() => {
    const email = localStorage.getItem("email");
    if (!email) return;

    const controller = new AbortController();

    const loadReports = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const res = await fetch(`${API_ENDPOINTS.GET_REPORTS}?page=${page}&limit=${limit}`, {
          headers: getAuthHeaders(),
          signal: controller.signal,
        });

        const data = await res.json();

        if (data.status === "success") {
          setRecords(data.reports || []);
          setTotalPages(data.totalPages || 1);
        } else {
          setError(data.message || "Unable to load reports");
        }
      } catch (err: any) {
        if (err?.name === "AbortError") return;
        console.error(err);
        setError(err?.message || "Network error while loading reports");
      } finally {
        setIsLoading(false);
      }
    };

    loadReports();

    return () => controller.abort();
  }, [page, limit]);

  // ============================================================
  // ⭐ FILTERING
  // ============================================================
  const filteredData = records.filter((r) => {
    const s = search.toLowerCase();
    const d = new Date(r.timestamp).toISOString().slice(0, 10);

    const matchSearch =
      r.patientId.toString().includes(s) || 
      d.includes(s) ||
      r.name?.toLowerCase().includes(s);

    const matchRisk = riskFilter === "all" || r.riskLevel === riskFilter;

    return matchSearch && matchRisk;
  });

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case "high":
        return AlertTriangle;
      case "moderate":
        return TrendingUp;
      default:
        return CheckCircle2;
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toISOString().slice(0, 10);
  const formatTime = (d: string) =>
    new Date(d).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

  // ============================================================
  // ⭐ DOWNLOAD PDF REPORT
  // ============================================================
  const downloadReport = async (id: string) => {
    try {
      const response = await fetch(
        API_ENDPOINTS.DOWNLOAD_REPORT(id),
        { headers: getAuthHeaders() }
      );

      if (!response.ok) {
        const text = await response.text();
        throw new Error(text || `HTTP error! status: ${response.status}`);
      }

      const contentType = response.headers.get("content-type") || "";
      if (!contentType.startsWith("application/pdf")) {
        const text = await response.text();
        console.error("Received non-PDF response:", text);
        throw new Error(text || "Invalid PDF response from server");
      }

      const blob = await response.blob();

      // Get filename from Content-Disposition header if available
      const disposition = response.headers.get("content-disposition");
      let filename = "HeartAnalysisReport.pdf";
      if (disposition && disposition.includes("filename=")) {
        const filenameMatch = disposition.match(/filename=(.+)/);
        if (filenameMatch && filenameMatch[1]) {
          filename = filenameMatch[1].replace(/['"]/g, "");
        }
      }

      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = filename;
      a.click();

      window.URL.revokeObjectURL(url);
      
      console.log("✅ PDF downloaded successfully");
    } catch (err: any) {
      console.error("Download error:", err);
      alert(`Could not download report: ${err?.message || err}`);
    }
  };

  // ============================================================
  // ⭐ DELETE REPORT
  // ============================================================
  const deleteReport = async (id: string) => {
    try {
      const email = localStorage.getItem("email");
      if (!email) return;

      const response = await fetch(
        `${API_ENDPOINTS.DELETE_REPORT(id)}?email=${email}`,
        {
          method: "DELETE",
          headers: getAuthHeaders()
        }
      );

      const data = await response.json();

      if (data.status === "success") {
        // Remove the deleted record from the list
        setRecords((prev) => prev.filter((r) => r._id !== id));
        setDeleteId(null);
        alert("Report deleted successfully");
      } else {
        alert(data.message || "Could not delete report.");
      }
    } catch (err) {
      console.error("Delete error:", err);
      alert("Could not delete report.");
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold">Reports & History</h1>
            <p className="text-muted-foreground mt-1">View saved ECG analysis reports</p>
          </div>
          <BackToHome />
        </div>
      </motion.div>

      {/* Filters */}
      <Card variant="glass">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                placeholder="Search by patient ID, name, or date..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-12"
              />
            </div>

            {/* Risk Filter */}
            <div className="flex gap-2 flex-wrap bg-muted/40 rounded-xl p-1">
              {["all", "high", "moderate", "low"].map((risk) => (
                <button
                  key={risk}
                  onClick={() => setRiskFilter(risk)}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                    riskFilter === risk
                      ? "bg-background shadow"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {risk === "all" ? "All Risk" : risk.toUpperCase()}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {error && (
        <div className="p-4 rounded-lg bg-destructive/10 text-destructive flex items-center justify-between">
          <span>{error}</span>
          <Button variant="outline" size="sm" onClick={() => setPage(1)}>Retry</Button>
        </div>
      )}

      {isLoading && !error && (
        <p className="text-muted-foreground">Loading reports...</p>
      )}

      {/* Reports Table */}
      <Card variant="glass" className="overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-muted/30 border-b border-border/50">
              <tr>
                <th className="p-4 text-left">Patient ID</th>
                <th className="p-4 text-left">Patient Name</th>
                <th className="p-4 text-left">Date & Time</th>
                <th className="p-4 text-left">Risk</th>
                <th className="p-4 text-left">Score</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-border/50">
              {filteredData.map((r) => {
                const Icon = getRiskIcon(r.riskLevel);

                return (
                  <tr
                    key={r._id}
                    className="hover:bg-muted/30 cursor-pointer"
                    onClick={() => setSelectedRecord(r)}
                  >
                    <td className="p-4 flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg">
                        <FileHeart className="w-4 h-4 text-primary" />
                      </div>
                      {String(r.patientId).padStart(4, "0")}
                    </td>

                    <td className="p-4">
                      <span className="font-medium">{r.name || 'N/A'}</span>
                    </td>

                    <td className="p-4">
                      <Calendar className="w-4 h-4 inline-block mr-2 text-muted-foreground" />
                      {formatDate(r.timestamp)}
                      <span className="text-muted-foreground ml-2">
                        {formatTime(r.timestamp)}
                      </span>
                    </td>

                    <td className="p-4">
                      <Badge variant={`risk-${r.riskLevel}`}>
                        <Icon className="w-3 h-3 mr-1" />
                        {r.riskLevel}
                      </Badge>
                    </td>

                    <td className="p-4">{r.riskScore}</td>

                    <td className="p-4 text-right flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedRecord(r);
                        }}
                      >
                        <Eye className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadReport(r._id);
                        }}
                      >
                        <Download className="w-4 h-4" />
                      </Button>

                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive hover:text-destructive hover:bg-destructive/10"
                        onClick={(e) => {
                          e.stopPropagation();
                          setDeleteId(r._id);
                        }}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredData.length === 0 && (
          <div className="p-12 text-center text-muted-foreground">
            No reports found.
          </div>
        )}
      </Card>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
            Previous
          </Button>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))}>
            Next
          </Button>
        </div>
      </div>

      {/* ====================== MODAL ====================== */}
      <Dialog open={!!selectedRecord} onOpenChange={() => setSelectedRecord(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto" aria-describedby="report-details-description">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileHeart className="w-5 h-5 text-primary" />
              Patient #{selectedRecord?.patientId} - {selectedRecord?.name}
            </DialogTitle>
          </DialogHeader>

          <div id="report-details-description" className="sr-only">
            Full medical report details including patient information, ECG analysis, risk assessment, and probability distribution for patient {selectedRecord?.name}
          </div>

          {selectedRecord && (
            <div className="space-y-6">
              {/* Patient Info */}
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-muted-foreground mb-2">Patient Details</p>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">

                  <div>
                    <p className="text-xs text-muted-foreground">Name</p>
                    <p className="font-semibold">{selectedRecord.name}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Age</p>
                    <p className="font-semibold">{selectedRecord.age}</p>
                  </div>

                  <div>
                    <p className="text-xs text-muted-foreground">Gender</p>
                    <p className="font-semibold">{selectedRecord.gender}</p>
                  </div>
                </div>

                {/* Symptoms */}
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Symptoms</p>
                  <p className="font-semibold">{selectedRecord.symptoms || 'N/A'}</p>
                </div>

                {/* Medical History */}
                <div className="mt-4">
                  <p className="text-xs text-muted-foreground">Medical History</p>
                  <p className="font-semibold">{selectedRecord.medicalHistory || 'N/A'}</p>
                </div>
              </div>

              {/* ECG Image */}
              <div className="p-4 bg-muted/30 rounded-xl">
                <div className="flex items-center gap-2 mb-3">
                  <ImageIcon className="w-4 h-4 text-primary" />
                  ECG Image
                </div>

                <div className="rounded-xl overflow-hidden border border-border">
                  <img
                    src={`${API_BASE_URL}${selectedRecord.imagePath}`}
                    className="w-full h-48 object-contain bg-muted/50"
                  />
                </div>
              </div>

              {/* Risk Summary */}
              <div className="grid grid-cols-3 gap-4">
                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  Risk:
                  <Badge variant={`risk-${selectedRecord.riskLevel}`} className="ml-2 capitalize">
                    {selectedRecord.riskLevel}
                  </Badge>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  Score:
                  <p className="text-2xl font-bold">{selectedRecord.riskScore}</p>
                </div>

                <div className="p-4 bg-muted/30 rounded-xl text-center">
                  Confidence:
                  <p className="text-2xl font-bold">{selectedRecord.confidence}%</p>
                </div>
              </div>

              {/* Predicted Class */}
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-muted-foreground">Predicted Class</p>
                <p className="font-bold">{selectedRecord.predictedClass}</p>
              </div>

              {/* Probability List */}
              <div className="p-4 bg-muted/30 rounded-xl">
                <p className="text-muted-foreground mb-2">Class Probabilities</p>

                <div className="space-y-3">
                  {Object.entries(selectedRecord.probabilities).map(
                    ([label, value]) => (
                      <div key={label}>
                        <div className="flex justify-between text-sm">
                          <span>{label}</span>
                          <span>{value.toFixed(2)}%</span>
                        </div>
                        <div className="w-full h-2 bg-border rounded-full overflow-hidden">
                          <div
                            className="h-full bg-primary"
                            style={{ width: `${value}%` }}
                          ></div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* ====================== DELETE CONFIRMATION DIALOG ====================== */}
      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent aria-describedby="delete-confirmation-description">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
            <AlertDialogDescription id="delete-confirmation-description">
              This action cannot be undone. This will permanently delete the report
              and remove the associated ECG image from the server.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteId && deleteReport(deleteId)}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
