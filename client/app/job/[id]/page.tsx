"use client";
import Footer from "@/Components/Footer";
import Header from "@/Components/Header";
import JobCard from "@/Components/JobItem/JobCard";
import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import formatMoney from "@/utils/formatMoney";
import { formatDates } from "@/utils/fotmatDates";
import { Bookmark, Zap, Cloud, RefreshCw, Database } from "lucide-react";
import Image from "next/image";
import { useParams, useRouter } from "next/navigation";
import React, { useEffect } from "react";
import toast from "react-hot-toast";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

function page() {
  const { jobs, likeJob, applyToJob } = useJobsContext();
  const { userProfile, isAuthenticated } = useGlobalContext();
  const params = useParams();
  const router = useRouter();
  const { id } = params;

  const [isLiked, setIsLiked] = React.useState(false);
  const [isApplied, setIsApplied] = React.useState(false);
  const [checkedSkills, setCheckedSkills] = React.useState<string[]>([]);
  const [activeMedTechQ, setActiveMedTechQ] = React.useState<number | null>(null);
  const [selectedModel, setSelectedModel] = React.useState<"mri" | "cardiac" | "xray">("mri");

  // Diagnostics Simulation Sandbox states for Siemens Healthineers interview
  const [sliceNumber, setSliceNumber] = React.useState(12);
  const [segmentationConfidence, setSegmentationConfidence] = React.useState(75);
  const [ecgAnomaly, setEcgAnomaly] = React.useState(false);
  const [telemetryLogs, setTelemetryLogs] = React.useState<string[]>([
    "Scanner telemetry connection established (Client Version v3.1.2)",
    "HL7 Stream active: listening on port 6001 (FHIR compatible)"
  ]);

  // JobSeeker AI Copilot states
  const [activeTab, setActiveTab] = React.useState<"sde" | "ai_copilot">("ai_copilot");
  const [resumeText, setResumeText] = React.useState("");
  const [isAnalyzingResume, setIsAnalyzingResume] = React.useState(false);
  const [analysisResult, setAnalysisResult] = React.useState<{
    score: number;
    matched: string[];
    missing: string[];
    advice: string;
  } | null>(null);

  const [candidateAnswer, setCandidateAnswer] = React.useState("");
  const [isEvaluatingAnswer, setIsEvaluatingAnswer] = React.useState(false);
  const [evaluationResult, setEvaluationResult] = React.useState<{
    score: number;
    feedback: string;
    strengths: string;
    tips: string;
  } | null>(null);

  const [negotiationTone, setNegotiationTone] = React.useState("Confident");
  const [negotiationScript, setNegotiationScript] = React.useState("");



  const modelMetrics = {
    mri: {
      name: "3D Brain MRI Segmentation",
      architecture: "3D U-Net (Quantized via TensorRT)",
      metrics: [
        { label: "Dice Coefficient (Overlap Accuracy)", value: 89, color: "bg-emerald-500" },
        { label: "Clinical Sensitivity (Recall)", value: 94.2, color: "bg-blue-500" },
        { label: "Clinical Specificity", value: 98.1, color: "bg-indigo-500" }
      ],
      cohort: "12,500+ Clinical Scans",
      regulation: "FDA Class II Track"
    },
    cardiac: {
      name: "Cardiac Telemetry Anomaly Detection",
      architecture: "Temporal Convolutional Network + Isolation Forest",
      metrics: [
        { label: "ROC-AUC Score", value: 97.4, color: "bg-emerald-500" },
        { label: "Clinical Sensitivity (Recall)", value: 96.8, color: "bg-blue-500" },
        { label: "Clinical Specificity", value: 99.2, color: "bg-indigo-500" }
      ],
      cohort: "10,000+ IoT Live Streams",
      regulation: "CE Mark Certified"
    },
    xray: {
      name: "Chest X-Ray Pathology Detection",
      architecture: "DenseNet-121 (Multi-label Classification)",
      metrics: [
        { label: "Mean Average Precision (mAP)", value: 91.5, color: "bg-emerald-500" },
        { label: "Clinical Sensitivity (Recall)", value: 93.1, color: "bg-blue-500" },
        { label: "Clinical Specificity", value: 97.4, color: "bg-indigo-500" }
      ],
      cohort: "150,000+ Validated Images",
      regulation: "FDA Class II Approved"
    }
  };

  const currentMetrics = modelMetrics[selectedModel];

  const toggleSkill = (skill: string) => {
    setCheckedSkills(prev => 
      prev.includes(skill) ? prev.filter(s => s !== skill) : [...prev, skill]
    );
  };

  const job = jobs.find((job: Job) => job._id === id);
  const otherJobs = jobs.filter((job: Job) => job._id !== id);

  const getMockQuestion = () => {
    if (job && job.title && (job.title.toLowerCase().includes("data") || job.title.toLowerCase().includes("ml") || job.title.toLowerCase().includes("healthineers"))) {
      return "How would you handle highly skewed clinical data classes when training a medical imaging classification model?";
    }
    return "Explain how you would implement a distributed rate-limiting middleware in an Express application using Redis.";
  };

  useEffect(() => {
    if (job) {
      setIsApplied(job.applicants.includes(userProfile._id));
    }
  }, [job, userProfile._id]);

  useEffect(() => {
    if (job) {
      setIsLiked(job.likes.includes(userProfile._id));
    }
  }, [job, userProfile._id]);

  if (!job) return null;

  const {
    title,
    location,
    description,
    salary,
    createdBy,
    applicants,
    jobType,
    createdAt,
    salaryType,
    negotiable,
  } = job;

  const { name, profilePicture } = createdBy;

  const handleLike = (id: string) => {
    setIsLiked((prev) => !prev);
    likeJob(id);
  };

  return (
    <main>
      <Header />

      <div className="p-8 mb-8 mx-auto w-[90%] rounded-md flex gap-8">
        <div className="w-[26%] flex flex-col gap-8">
          <JobCard activeJob job={job} />

          {otherJobs.map((job: Job) => (
            <JobCard job={job} key={job._id} />
          ))}
        </div>

        <div className="flex-1 bg-white p-6 rounded-md">
          <div className="flex flex-col gap-2">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                <div className="w-14 h-14 rounded-md flex items-center justify-center text-white font-extrabold text-2xl bg-gradient-to-tr from-[#7263f3] to-[#a294f9] shadow-sm select-none">
                  {name ? name.split(" ").map((n: string) => n[0]).join("").toUpperCase().substring(0, 2) : "U"}
                </div>

                <div>
                  <p className="font-bold">{name}</p>
                  <p className="text-sm">Recruiter</p>
                </div>
              </div>
              <button
                className={`text-2xl  ${
                  isLiked ? "text-[#7263f3]" : "text-gray-400"
                }`}
                onClick={() => {
                  if (isAuthenticated) {
                    handleLike(job._id);
                  } else {
                    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
                    window.location.href = `${apiUrl}/login`;
                  }
                }}
              >
                {isLiked ? bookmark : bookmarkEmpty}
              </button>
            </div>

            <h1 className="text-2xl font-semibold">{title}</h1>
            <div className="flex gap-4 items-center">
              <p className="text-gray-500">{location}</p>
            </div>

            <div className="mt-2 flex gap-4 justify-between items-center">
              <p className="flex-1 py-2 px-4 flex flex-col items-center justify-center gap-1 bg-green-500/20 rounded-xl">
                <span className="text-sm">Salary</span>

                <span>
                  <span className="font-bold">
                    {formatMoney(salary, "GBP")}
                  </span>
                  <span className="font-medium text-gray-500 text-lg">
                    /
                    {salaryType
                      ? `${
                          salaryType === "Yearly"
                            ? "pa"
                            : salaryType === "Monthly"
                            ? "pcm"
                            : salaryType === "Weekly"
                            ? "pw"
                            : "ph"
                        }`
                      : ""}
                  </span>
                </span>
              </p>

              <p className="flex-1 py-2 px-4 flex flex-col items-center justify-center gap-1 bg-purple-500/20 rounded-xl">
                <span className="text-sm">Posted</span>
                <span className="font-bold">{formatDates(createdAt)}</span>
              </p>

              <p className="flex-1 py-2 px-4 flex flex-col items-center justify-center gap-1 bg-blue-500/20 rounded-xl">
                <span className="text-sm">Applicants</span>
                <span className="font-bold">{applicants.length}</span>
              </p>

              <p className="flex-1 py-2 px-4 flex flex-col items-center justify-center gap-1 bg-yellow-500/20 rounded-xl">
                <span className="text-sm">Job Type</span>
                <span className="font-bold">{jobType[0]}</span>
              </p>
            </div>

            <h2 className="font-bold text-2xl mt-2">Job Description</h2>
          </div>

          <div
            className="wysiwyg mt-2"
            dangerouslySetInnerHTML={{ __html: description }}
          ></div>

          {/* Interactive Navigation Tabs */}
          <div className="flex gap-6 border-b border-gray-200 mt-10 mb-6">
            <button
              onClick={() => setActiveTab("ai_copilot")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all duration-200 select-none ${
                activeTab === "ai_copilot"
                  ? "border-[#7263f3] text-[#7263f3]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              Candidate AI Copilot
            </button>
            <button
              onClick={() => setActiveTab("sde")}
              className={`pb-3 text-sm font-bold border-b-2 transition-all duration-200 select-none ${
                activeTab === "sde"
                  ? "border-[#7263f3] text-[#7263f3]"
                  : "border-transparent text-gray-500 hover:text-gray-800"
              }`}
            >
              SDE Scalability & Diagnostics
            </button>
          </div>

          {activeTab === "sde" && (
            <>
              {/* SDE System Design Context */}
              <div className="p-8 bg-gradient-to-br from-[#7263f3]/5 to-purple-500/5 rounded-2xl border border-[#7263f3]/10">
            <h3 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
              System Architecture & Scale
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                <Zap className="w-6 h-6 text-[#7263f3] mb-2" />
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Peak QPS</span>
                <span className="text-lg font-extrabold text-gray-800 mt-1">
                  {title.toLowerCase().includes("senior") || title.toLowerCase().includes("lead") ? "50k+" : "10k+"}
                </span>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                <Cloud className="w-6 h-6 text-blue-500 mb-2" />
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Cloud</span>
                <span className="text-lg font-extrabold text-gray-800 mt-1">
                  {title.toLowerCase().includes("azure") ? "Azure" : title.toLowerCase().includes("gcp") ? "GCP" : "AWS"}
                </span>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                <RefreshCw className="w-6 h-6 text-emerald-500 mb-2" />
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Pattern</span>
                <span className="text-lg font-extrabold text-gray-800 text-center leading-tight mt-1">Event<br/>Driven</span>
              </div>
              <div className="p-4 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col items-center justify-center text-center hover:shadow-md transition-all">
                <Database className="w-6 h-6 text-indigo-500 mb-2" />
                <span className="text-xs text-gray-500 font-semibold uppercase tracking-wider">Data</span>
                <span className="text-lg font-extrabold text-gray-800 text-center leading-tight mt-1">NoSQL<br/>& Redis</span>
              </div>
            </div>
            
            <div className="mt-8">
              <h4 className="text-md font-bold text-gray-800 mb-4 flex items-center gap-2">
                SDE Interview Discussion Guide
              </h4>
              <div className="space-y-3">
                <div className="p-4 bg-white rounded-lg border-l-4 border-[#7263f3] shadow-sm hover:translate-x-1 transition-transform">
                  <p className="text-sm font-semibold text-gray-800">How would you handle a sudden 10x traffic spike?</p>
                  <p className="text-xs text-gray-500 mt-1">Focus on caching strategies (Redis/Memcached), CDN usage, and auto-scaling group configurations.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-l-4 border-emerald-500 shadow-sm hover:translate-x-1 transition-transform">
                  <p className="text-sm font-semibold text-gray-800">Design a distributed rate limiter for our API.</p>
                  <p className="text-xs text-gray-500 mt-1">Discuss Token Bucket vs Leaky Bucket algorithms, and how you would implement them using Redis sorted sets or Lua scripts.</p>
                </div>
                <div className="p-4 bg-white rounded-lg border-l-4 border-purple-500 shadow-sm hover:translate-x-1 transition-transform">
                  <p className="text-sm font-semibold text-gray-800">How do you ensure data consistency across microservices?</p>
                  <p className="text-xs text-gray-500 mt-1">Expect questions on the Saga pattern, Outbox pattern, and two-phase commits vs eventual consistency.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Siemens Healthineers MedTech SDE & AI/Data Science Spec */}
          <div className="mt-8 p-8 bg-gradient-to-br from-emerald-50/50 to-blue-50/50 rounded-2xl border border-emerald-500/20 shadow-sm">
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <div>
                <span className="px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Siemens Healthineers Spec
                </span>
                <h3 className="text-xl font-bold text-gray-800 mt-2 flex items-center gap-2">
                  MedTech SDE & Data Science Interview Prep
                </h3>
              </div>
              <div className="flex gap-2">
                <span className="py-1 px-2.5 text-xs font-semibold rounded-md bg-emerald-500/10 text-emerald-700 border border-emerald-500/15">
                  HIPAA Compliant
                </span>
                <span className="py-1 px-2.5 text-xs font-semibold rounded-md bg-blue-500/10 text-blue-700 border border-blue-500/15">
                  DICOM / HL7 / FHIR
                </span>
              </div>
            </div>

            <p className="text-sm text-gray-600 mb-6 leading-relaxed">
              Medical technology demands extreme safety, zero-latency sensor streaming, strict privacy regulations, and advanced machine learning for clinical decision support. Explore the metrics and interactive simulation answers below:
            </p>

            {/* Interactive Model Performance Sandbox */}
            <div className="mb-8 p-6 bg-white rounded-xl border border-gray-100 shadow-sm">
              <h4 className="text-xs font-bold text-gray-600 mb-4 uppercase tracking-wider text-center">
                Clinical ML Model Performance & Validation Dashboard
              </h4>
              
              {/* Model selection toggles */}
              <div className="flex flex-wrap gap-2 mb-6 justify-center">
                <button
                  onClick={() => setSelectedModel("mri")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    selectedModel === "mri"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Brain MRI (Segmentation)
                </button>
                <button
                  onClick={() => setSelectedModel("cardiac")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    selectedModel === "cardiac"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Cardiac IoT (Telemetry)
                </button>
                <button
                  onClick={() => setSelectedModel("xray")}
                  className={`px-4 py-2 rounded-lg text-xs font-bold transition-all duration-200 ${
                    selectedModel === "xray"
                      ? "bg-emerald-600 text-white shadow"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Chest X-Ray (Pathology)
                </button>
              </div>

              {/* Model Info */}
              <div className="p-4 rounded-lg bg-gray-50/50 mb-5 md:flex justify-between items-center gap-4">
                <div className="text-center md:text-left">
                  <h5 className="text-sm font-bold text-gray-800">{currentMetrics.name}</h5>
                  <p className="text-xs text-gray-500 mt-0.5">Architecture: <span className="font-semibold">{currentMetrics.architecture}</span></p>
                </div>
                <div className="mt-2.5 md:mt-0 flex gap-2 justify-center">
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-emerald-100 text-emerald-800">
                    {currentMetrics.cohort}
                  </span>
                  <span className="px-2.5 py-1 text-[10px] font-bold rounded bg-blue-100 text-blue-800">
                    {currentMetrics.regulation}
                  </span>
                </div>
              </div>

              {/* Metrics visualizer */}
              <div className="space-y-4">
                {currentMetrics.metrics.map((metric, i) => (
                  <div key={i}>
                    <div className="flex justify-between items-center text-xs mb-1.5">
                      <span className="text-gray-600 font-medium">{metric.label}</span>
                      <span className="font-extrabold text-gray-800">{metric.value}%</span>
                    </div>
                    <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                      <div
                        className={`${metric.color} h-full rounded-full transition-all duration-500 ease-out`}
                        style={{ width: `${metric.value}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-4">
              {/* Question 1 */}
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => setActiveMedTechQ(activeMedTechQ === 1 ? null : 1)}
                  className="w-full text-left p-5 flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-emerald-600">Q1:</span>
                    Design a scalable pipeline to segment 3D MRI scans (DICOM) in real-time.
                  </span>
                  <span className="text-xs font-extrabold text-[#7263f3]">
                    {activeMedTechQ === 1 ? "Hide Answer" : "Reveal Answer"}
                  </span>
                </button>
                {activeMedTechQ === 1 && (
                  <div className="p-5 border-t border-gray-100 bg-emerald-50/10">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Model Architecture Response:</div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      Stream massive 3D DICOM files asynchronously to an S3-compatible medical vault. Trigger containerized serverless GPU workers (e.g. AWS Lambda with custom container images or Kubernetes PODs running Triton Inference Server). Run a quantized 3D U-Net model with NVIDIA TensorRT to optimize medical imaging segmentations, guaranteeing latency below 200ms for active radiologist review sessions.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 uppercase">3D U-Net</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 uppercase">Triton GPU</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 uppercase">TensorRT</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Question 2 */}
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => setActiveMedTechQ(activeMedTechQ === 2 ? null : 2)}
                  className="w-full text-left p-5 flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-emerald-600">Q2:</span>
                    Design a real-time global telemetry pipeline for 10k Siemens Healthineers scanners.
                  </span>
                  <span className="text-xs font-extrabold text-[#7263f3]">
                    {activeMedTechQ === 2 ? "Hide Answer" : "Reveal Answer"}
                  </span>
                </button>
                {activeMedTechQ === 2 && (
                  <div className="p-5 border-t border-gray-100 bg-emerald-50/10">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Model IoT Architecture:</div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      Deploy Apache Kafka or AWS Kinesis to ingest high-frequency IoT sensor telemetry (thermal, vacuum pressure, spin rates) globally. Validate schema headers against HL7/FHIR criteria. Direct real-time payloads to a time-series database (e.g. InfluxDB) for anomaly detection via isolation forests to schedule preventative scanner maintenance, archiving cold historical data in S3 Glacier.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 uppercase">Kafka Ingest</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 uppercase">FHIR Schemas</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 uppercase">InfluxDB Anomaly</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Question 3 */}
              <div className="border border-gray-200 rounded-xl bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                <button
                  onClick={() => setActiveMedTechQ(activeMedTechQ === 3 ? null : 3)}
                  className="w-full text-left p-5 flex justify-between items-center bg-gray-50/50 hover:bg-gray-50 transition-colors"
                >
                  <span className="text-sm font-bold text-gray-800 flex items-center gap-2">
                    <span className="text-emerald-600">Q3:</span>
                    How do you train AI diagnostics models across hospitals without violating patient privacy?
                  </span>
                  <span className="text-xs font-extrabold text-[#7263f3]">
                    {activeMedTechQ === 3 ? "Hide Answer" : "Reveal Answer"}
                  </span>
                </button>
                {activeMedTechQ === 3 && (
                  <div className="p-5 border-t border-gray-100 bg-emerald-50/10">
                    <div className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-2">Model Privacy Response:</div>
                    <p className="text-sm text-gray-700 leading-relaxed font-medium">
                      Implement **Federated Learning**. Rather than moving sensitive patient data to a central cloud, distribute model weights to hospital-local servers. Perform local training rounds on local datasets, then securely aggregate model weight gradients using Cryptographic Secure Multiparty Computation (SMPC) or Differential Privacy algorithms to update the centralized model weights securely.
                    </p>
                    <div className="mt-3 flex gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 uppercase">Federated Learning</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 uppercase">SMPC</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-gray-100 text-gray-600 uppercase">HIPAA Compliant</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Siemens Healthineers Interactive Diagnostics Sandbox */}
            <div className="mt-8 pt-8 border-t border-emerald-500/10">
              <h4 className="text-sm font-extrabold text-gray-800 mb-2 uppercase tracking-wider text-center">
                Clinical Diagnostics Simulation Sandbox
              </h4>
              <p className="text-xs text-gray-500 text-center mb-6 leading-relaxed">
                Demonstrate safety-critical pipeline designs with live mock diagnostic feeds and streaming scanner telemetry.
              </p>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                
                {/* Module 1: MRI DICOM Slice Segmenter */}
                <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-1 text-[9px] font-bold rounded-md bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                      Module 1: MRI DICOM Slice Viewer
                    </span>
                    <h5 className="text-sm font-bold text-gray-800 mt-2 mb-3">3D U-Net Segmentation Sandbox</h5>
                    
                    {/* Simulated Brain DICOM Viewer */}
                    <div className="relative w-full aspect-video bg-gray-950 rounded-lg flex items-center justify-center overflow-hidden border border-gray-800 shadow-inner">
                      <div className="absolute inset-0 bg-[radial-gradient(#1f2937_1px,transparent_1px)] [background-size:16px_16px] opacity-40"></div>
                      
                      {/* Stylized Dynamic Skull & Brain slice */}
                      <svg className="w-36 h-36 text-gray-700/80" viewBox="0 0 200 200">
                        {/* Out Skull */}
                        <ellipse cx="100" cy="100" rx={65 + Math.sin(sliceNumber / 3) * 3} ry={80 + Math.cos(sliceNumber / 3) * 3} fill="none" stroke="#4b5563" strokeWidth="1.5" strokeDasharray="3 3" />
                        {/* Brain Hemispheres */}
                        <path d="M 100,25 C 45,25 40,175 100,175" fill="#1e293b" stroke="#374151" strokeWidth="1.5" />
                        <path d="M 100,25 C 155,25 160,175 100,175" fill="#1e293b" stroke="#374151" strokeWidth="1.5" />
                        {/* Ventricles */}
                        <ellipse cx="100" cy="95" rx={5 + (sliceNumber % 3)} fill="#0f172a" />
                        
                        {/* Active ML U-Net Segmentation tumor highlight */}
                        {sliceNumber >= 6 && sliceNumber <= 18 && (
                          <ellipse
                            cx={85 + Math.sin(sliceNumber / 2) * 6}
                            cy={80 + Math.cos(sliceNumber / 3) * 4}
                            rx={12 + (sliceNumber % 3) * 1.5}
                            ry={10 + (sliceNumber % 2) * 1.2}
                            fill="rgba(16, 185, 129, 0.25)"
                            stroke="#10b981"
                            strokeWidth="2"
                            style={{
                              opacity: segmentationConfidence / 100,
                              filter: "drop-shadow(0 0 5px rgba(16, 185, 129, 0.5))"
                            }}
                          />
                        )}
                      </svg>
                      
                      {/* Grid Labels */}
                      <span className="absolute top-2.5 left-3 text-[9px] font-mono text-emerald-400">
                        DICOM: SLICE_{sliceNumber.toString().padStart(3, "0")} / 024
                      </span>
                      <span className="absolute bottom-2.5 right-3 text-[8px] font-mono text-gray-500">
                        Inference: Quantized U-Net
                      </span>
                      
                      {sliceNumber >= 6 && sliceNumber <= 18 ? (
                        <span className="absolute top-2.5 right-3 px-2 py-0.5 text-[9px] font-extrabold rounded bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 font-mono animate-pulse">
                          Tumor: {(85 + (sliceNumber % 3) + (segmentationConfidence % 4)).toFixed(1)}% Match
                        </span>
                      ) : (
                        <span className="absolute top-2.5 right-3 px-2 py-0.5 text-[9px] font-bold rounded bg-gray-800 text-gray-400 font-mono">
                          Nominal Tissue
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Range Controls */}
                  <div className="mt-4 space-y-3">
                    <div>
                      <div className="flex justify-between items-center text-[11px] text-gray-600 mb-1">
                        <span className="font-semibold">DICOM Slice Scrubber</span>
                        <span className="font-mono text-gray-800 font-bold">Slice {sliceNumber} / 24</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        value={sliceNumber}
                        onChange={(e) => setSliceNumber(parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>

                    <div>
                      <div className="flex justify-between items-center text-[11px] text-gray-600 mb-1">
                        <span className="font-semibold">Segmentation Confidence</span>
                        <span className="font-mono text-gray-800 font-bold">{segmentationConfidence}%</span>
                      </div>
                      <input
                        type="range"
                        min="20"
                        max="100"
                        value={segmentationConfidence}
                        onChange={(e) => setSegmentationConfidence(parseInt(e.target.value))}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
                      />
                    </div>
                  </div>
                </div>

                {/* Module 2: ECG Live IoT Telemetry */}
                <div className="p-5 bg-white rounded-xl border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div>
                    <span className="px-2.5 py-1 text-[9px] font-bold rounded-md bg-blue-100 text-blue-800 uppercase tracking-wide">
                      Module 2: Cardiac Telemetry
                    </span>
                    <h5 className="text-sm font-bold text-gray-800 mt-2 mb-3">Live Streaming Telemetry Monitor</h5>
                    
                    {/* Simulated ECG grid waveform */}
                    <div className="relative w-full aspect-video bg-gray-950 rounded-lg flex items-center justify-center overflow-hidden border border-gray-800 shadow-inner">
                      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-40"></div>
                      
                      {/* Heartbeat pulse path */}
                      <svg className="w-full h-full text-blue-500" viewBox="0 0 300 150">
                        {ecgAnomaly ? (
                          // PVC Anomaly Wave
                          <path
                            d="M 0,75 L 30,75 L 45,75 L 50,55 L 55,95 L 60,75 L 90,75 L 105,75 L 115,20 L 125,130 L 135,75 L 150,75 L 175,75 L 180,-10 L 195,160 L 210,75 L 230,75 L 260,75 L 275,75 L 280,60 L 285,90 L 290,75 L 300,75"
                            fill="none"
                            stroke="#ef4444"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              filter: "drop-shadow(0 0 5px rgba(239, 68, 68, 0.8))"
                            }}
                          />
                        ) : (
                          // Normal Heartbeat Wave
                          <path
                            d="M 0,75 L 30,75 L 45,75 L 50,65 L 55,85 L 60,75 L 95,75 L 110,75 L 115,30 L 122,120 L 130,75 L 165,75 L 180,75 L 185,65 L 190,85 L 195,75 L 230,75 L 245,75 L 250,30 L 257,120 L 265,75 L 300,75"
                            fill="none"
                            stroke="#3b82f6"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              filter: "drop-shadow(0 0 5px rgba(59, 130, 246, 0.6))"
                            }}
                          />
                        )}
                      </svg>
                      
                      {/* Overlay labels */}
                      <span className="absolute top-2.5 left-3 text-[9px] font-mono text-blue-400">
                        Node: SCANNER_T_2041
                      </span>
                      <span className="absolute bottom-2.5 left-3 text-[8px] font-mono text-gray-500">
                        HL7 FHIR Stream (250Hz JSON)
                      </span>
                      
                      {ecgAnomaly ? (
                        <div className="absolute top-2.5 right-3 flex items-center gap-1.5 px-2 py-0.5 text-[9px] font-extrabold rounded bg-red-500/20 text-red-400 border border-red-500/30 font-mono animate-pulse">
                          Outlier Triggered (PVC)
                        </div>
                      ) : (
                        <div className="absolute top-2.5 right-3 flex items-center gap-1 px-2 py-0.5 text-[9px] font-bold rounded bg-blue-500/20 text-blue-400 border border-blue-500/30 font-mono">
                          ECG Signal Nominal
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Telemetry controls and event logger */}
                  <div className="mt-4 space-y-3">
                    <button
                      onClick={() => {
                        const newAnomalyState = !ecgAnomaly;
                        setEcgAnomaly(newAnomalyState);
                        const timestamp = new Date().toLocaleTimeString();
                        if (newAnomalyState) {
                          setTelemetryLogs(prev => [
                            `[${timestamp}] ! Outlier arrhythmia flagged by TCN anomaly model (98.4% confidence)`,
                            ...prev.slice(0, 3)
                          ]);
                        } else {
                          setTelemetryLogs(prev => [
                            `[${timestamp}] Nominal signal restored. Running isolation forest monitoring.`,
                            ...prev.slice(0, 3)
                          ]);
                        }
                      }}
                      className={`w-full py-2 px-3 text-xs font-bold rounded-lg transition-all ${
                        ecgAnomaly
                          ? "bg-red-600 hover:bg-red-700 text-white shadow-sm"
                          : "bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
                      }`}
                    >
                      {ecgAnomaly ? "Clear Telemetry Anomaly" : "Inject Telemetry Anomaly"}
                    </button>

                    {/* Console Event Logger */}
                    <div className="bg-gray-900 rounded-lg p-2.5 border border-gray-800 font-mono text-[9px] text-gray-300 min-h-[50px] max-h-[50px] overflow-y-auto shadow-inner">
                      {telemetryLogs.map((log, index) => (
                        <div key={index} className={`truncate ${log.includes("!") ? "text-red-400 font-bold" : "text-emerald-400"}`}>
                          {log}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        </>
      )}

          {activeTab === "ai_copilot" && (
            <div className="space-y-8 mt-6">
              
              {/* Card 1: Resume Fit Analyzer & Parser */}
              <div className="p-6 bg-gradient-to-br from-[#7263f3]/5 to-indigo-500/5 rounded-2xl border border-[#7263f3]/10 shadow-sm animate-[fadeIn_0.3s_ease]">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="px-2.5 py-0.5 text-[9px] font-bold rounded bg-[#7263f3]/10 text-[#7263f3] uppercase tracking-wide">
                      JobFindrr Tool 1
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 mt-1">Interactive Resume Fit Analyzer</h3>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Real-time Parsing
                  </span>
                </div>
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Paste your resume text below to match your qualifications against this job's required skills and tags. Get a dynamic match rating and customized refinement instructions!
                </p>

                <div className="space-y-4">
                  <textarea
                    rows={4}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    placeholder="Paste your resume details here (e.g. 'Senior Frontend Developer with 5 years experience in React, Next.js, and TypeScript...')"
                    className="w-full p-3 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7263f3]/25 focus:border-[#7263f3] outline-none transition-all placeholder:text-gray-400"
                  />

                  <button
                    onClick={() => {
                      if (!resumeText.trim()) {
                        toast.error("Please paste your resume text first!");
                        return;
                      }
                      setIsAnalyzingResume(true);
                      setTimeout(() => {
                        setIsAnalyzingResume(false);
                        const lowerText = resumeText.toLowerCase();
                        // Find matching skills
                        const matched = (job.skills || []).filter((skill: string) => 
                          lowerText.includes(skill.toLowerCase())
                        );
                        // Find missing skills
                        const missing = (job.skills || []).filter((skill: string) => 
                          !lowerText.includes(skill.toLowerCase())
                        );
                        
                        // Calculate score
                        const totalSkills = (job.skills || []).length;
                        const score = totalSkills > 0 ? Math.round((matched.length / totalSkills) * 100) : 70;
                        
                        let advice = "Your resume looks strong! Consider adding more specific experiences regarding your team leadership.";
                        if (missing.length > 0) {
                          advice = `To maximize your fit, explicitly mention your experience with ${missing.slice(0, 2).join(" and ")} in your project summaries.`;
                        }

                        setAnalysisResult({ score, matched, missing, advice });
                        toast.success("Resume analysis complete!");
                      }, 1200);
                    }}
                    disabled={isAnalyzingResume}
                    className="px-4 py-2 bg-[#7263f3] hover:bg-[#7263f3]/90 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:bg-gray-400"
                  >
                    {isAnalyzingResume ? "Analyzing Resume & Skills..." : "Analyze Resume Fit"}
                  </button>

                  {analysisResult && (
                    <div className="p-5 bg-white border border-gray-150 rounded-xl mt-4 shadow-inner space-y-4 animate-[fadeIn_0.3s_ease]">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-xs font-extrabold text-gray-700">Resume Match Score</span>
                        <span className={`px-2.5 py-0.5 text-xs font-extrabold rounded-full ${
                          analysisResult.score >= 80 
                            ? "bg-green-100 text-green-800" 
                            : analysisResult.score >= 50 
                            ? "bg-amber-100 text-amber-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {analysisResult.score}% Compatibility
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ${
                            analysisResult.score >= 80 ? "bg-green-500" : analysisResult.score >= 50 ? "bg-amber-500" : "bg-red-500"
                          }`}
                          style={{ width: `${analysisResult.score}%` }}
                        ></div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div>
                          <span className="font-bold text-green-600 block mb-1.5">Matched Keywords ({analysisResult.matched.length})</span>
                          {analysisResult.matched.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {analysisResult.matched.map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-green-50 text-green-700 border border-green-100 font-medium">{kw}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-gray-400">None detected. Add core tags to resume.</span>
                          )}
                        </div>

                        <div>
                          <span className="font-bold text-amber-600 block mb-1.5">Missing Core Keywords ({analysisResult.missing.length})</span>
                          {analysisResult.missing.length > 0 ? (
                            <div className="flex flex-wrap gap-1.5">
                              {analysisResult.missing.map((kw, i) => (
                                <span key={i} className="px-2 py-0.5 rounded bg-amber-50 text-amber-700 border border-amber-100 font-medium">{kw}</span>
                              ))}
                            </div>
                          ) : (
                            <span className="text-green-600 font-medium">All core keywords found!</span>
                          )}
                        </div>
                      </div>

                      <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 text-xs">
                        <span className="font-bold text-indigo-800 block mb-1">Tailored Action Plan:</span>
                        <p className="text-gray-700 leading-relaxed font-medium">{analysisResult.advice}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 2: AI Mock Interview Coach */}
              <div className="p-6 bg-gradient-to-br from-blue-50/50 to-indigo-50/50 rounded-2xl border border-blue-500/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="px-2.5 py-0.5 text-[9px] font-bold rounded bg-blue-100 text-blue-800 uppercase tracking-wide">
                      JobFindrr Tool 2
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 mt-1">AI Mock Interview Coach</h3>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded bg-blue-50 text-blue-700 border border-blue-100">
                    SDE Eval Engine
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Prepare for this role! Below is a high-yield technical question generated for this exact position. Submit your answer below to get evaluated by our automated SDE grading engine.
                </p>

                <div className="space-y-4">
                  <div className="p-4 bg-white rounded-xl border border-gray-150">
                    <span className="text-[10px] font-bold text-[#7263f3] uppercase tracking-wider block mb-1">Generated Technical Question:</span>
                    <p className="text-sm font-bold text-gray-800">{getMockQuestion()}</p>
                  </div>

                  <textarea
                    rows={4}
                    value={candidateAnswer}
                    onChange={(e) => setCandidateAnswer(e.target.value)}
                    placeholder="Type your explanation or pseudocode here..."
                    className="w-full p-3 text-xs bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-[#7263f3]/25 focus:border-[#7263f3] outline-none transition-all placeholder:text-gray-400"
                  />

                  <button
                    onClick={() => {
                      if (!candidateAnswer.trim()) {
                        toast.error("Please type your response first!");
                        return;
                      }
                      setIsEvaluatingAnswer(true);
                      setTimeout(() => {
                        setIsEvaluatingAnswer(false);
                        const wordCount = candidateAnswer.split(/\s+/).length;
                        
                        let score = 55;
                        let feedback = "Your answer is a bit brief. Try elaborating on the core mechanisms and design decisions.";
                        let strengths = "Correctly mentioned basic terms relating to the topic.";
                        let tips = "Discuss error handling, lock timeout strategies (like lease times in Redis), and recovery procedures.";

                        if (wordCount > 40) {
                          score = 88;
                          feedback = "Excellent response! You demonstrated strong technical intuition, a clear explanation of algorithms, and proper architectural considerations.";
                          strengths = "Solid breakdown of key algorithmic constraints, scalability parameters, and synchronization patterns.";
                          tips = "Include details on network partitions, node failures, and how client-side retry policies interact with these failures.";
                        } else if (wordCount > 15) {
                          score = 74;
                          feedback = "Good foundation! You have grasped the general flow, but can supplement your explanation with more lower-level design details.";
                          strengths = "Correctly identifies the primary components and flow patterns.";
                          tips = "Explicitly address potential scale conflicts, such as storage growth or parallel write locks.";
                        }

                        setEvaluationResult({ score, feedback, strengths, tips });
                        toast.success("AI Evaluation complete!");
                      }, 1500);
                    }}
                    disabled={isEvaluatingAnswer}
                    className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors disabled:bg-gray-400"
                  >
                    {isEvaluatingAnswer ? "Evaluating Answer..." : "Submit Response to AI Coach"}
                  </button>

                  {evaluationResult && (
                    <div className="p-5 bg-white border border-gray-150 rounded-xl mt-4 shadow-inner space-y-4 animate-[fadeIn_0.3s_ease]">
                      <div className="flex justify-between items-center pb-3 border-b border-gray-100">
                        <span className="text-xs font-extrabold text-gray-700">AI Scoring Output</span>
                        <span className="text-xs font-extrabold text-[#7263f3]">
                          {evaluationResult.score} / 100 Score
                        </span>
                      </div>

                      <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-[#7263f3] to-blue-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${evaluationResult.score}%` }}
                        ></div>
                      </div>

                      <p className="text-xs text-gray-700 leading-relaxed font-medium bg-gray-50 p-3 rounded-lg border border-gray-100">
                        <span className="font-bold text-[#7263f3] block mb-1">Feedback Summary:</span>
                        {evaluationResult.feedback}
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                        <div className="p-3 bg-green-50/50 rounded-lg border border-green-100 font-medium">
                          <span className="font-bold text-green-800 block mb-1">Key Strengths</span>
                          <p className="text-green-700 leading-relaxed">{evaluationResult.strengths}</p>
                        </div>
                        <div className="p-3 bg-indigo-50/50 rounded-lg border border-indigo-100 font-medium">
                          <span className="font-bold text-indigo-800 block mb-1">Expert Upgrade Tips</span>
                          <p className="text-indigo-700 leading-relaxed">{evaluationResult.tips}</p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Card 3: Salary Negotiator & Script Generator */}
              <div className="p-6 bg-gradient-to-br from-emerald-50/50 to-teal-50/50 rounded-2xl border border-emerald-500/10 shadow-sm">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="px-2.5 py-0.5 text-[9px] font-bold rounded bg-emerald-100 text-emerald-800 uppercase tracking-wide">
                      JobFindrr Tool 3
                    </span>
                    <h3 className="text-lg font-bold text-gray-800 mt-1">Salary Negotiator & Pitch Builder</h3>
                  </div>
                  <span className="px-2.5 py-1 text-[10px] font-semibold rounded bg-emerald-50 text-emerald-700 border border-emerald-100">
                    Equity Aware
                  </span>
                </div>
                
                <p className="text-xs text-gray-500 mb-4 leading-relaxed">
                  Draft a winning pay proposal! Select your tone below to instantly write a professional, high-converting salary negotiation script ready to copy-paste.
                </p>

                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-bold text-gray-600 block mb-1.5">Select Script Tone:</label>
                    <div className="flex gap-2">
                      {["Confident", "Collaborative", "Polite"].map((t) => (
                        <button
                          key={t}
                          onClick={() => setNegotiationTone(t)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            negotiationTone === t
                              ? "bg-emerald-600 text-white shadow-sm"
                              : "bg-white text-gray-600 border border-gray-200 hover:bg-gray-50"
                          }`}
                        >
                          {t}
                        </button>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => {
                      let script = "";
                      const formattedSalary = formatMoney(salary * 1.15, "GBP");
                      if (negotiationTone === "Confident") {
                        script = `Dear Hiring Team,\n\nThank you so much for extending the offer for the ${job.title} position. I am highly thrilled about the opportunity to join the team and bring my expertise in ${job.skills.slice(0, 3).join(", ")} to deliver outstanding products.\n\nGiven my robust background in distributed architectures, scalable pipelines, and successful product delivery, I would like to discuss adjusting the base compensation to ${formattedSalary} per year, along with a proportional equity adjustment, to better align with the core impact of this leadership role.\n\nI am confident I will generate immediate return on investment for the team and am looking forward to finalizing our partnership.\n\nBest regards,\n[Your Name]`;
                      } else if (negotiationTone === "Collaborative") {
                        script = `Dear Hiring Team,\n\nI am absolutely delighted to receive the offer for the ${job.title} role! I have great respect for your vision and am eager to begin contributing to the success of the team.\n\nBefore I sign, I wanted to discuss the compensation structure. Based on current industry bands for a role of this impact, combined with my extensive experience, I was hoping we could explore a base salary of ${formattedSalary}. I am also highly open to adjusting the RSU or sign-on bonus allocation to make this a win-win partnership.\n\nI would love to jump on a quick call to align on these numbers!\n\nWarmly,\n[Your Name]`;
                      } else {
                        script = `Dear Hiring Team,\n\nThank you so much for the offer to join as your new ${job.title}! I am incredibly excited about the vision of the organization.\n\nI want to make sure I start on the best possible foot. Given the high scope of this position and my comprehensive skills, I would be very grateful if we could consider a base salary of ${formattedSalary}. I hope this fits within your budget parameters and represents a fair start for our long-term journey.\n\nThank you very much for your time and consideration!\n\nSincerely,\n[Your Name]`;
                      }
                      setNegotiationScript(script);
                      toast.success("Script generated successfully!");
                    }}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-lg shadow-sm transition-colors"
                  >
                    Generate Negotiation Script
                  </button>

                  {negotiationScript && (
                    <div className="p-4 bg-gray-50 border border-gray-150 rounded-xl mt-4 space-y-3 animate-[fadeIn_0.3s_ease]">
                      <span className="text-[10px] font-bold text-emerald-800 uppercase tracking-wider block">Generated Pitch Template:</span>
                      <pre className="text-xs text-gray-700 font-mono whitespace-pre-wrap leading-relaxed bg-white p-3 rounded-lg border border-gray-200 shadow-inner max-h-[220px] overflow-y-auto">
                        {negotiationScript}
                      </pre>
                      <button
                        onClick={() => {
                          navigator.clipboard.writeText(negotiationScript);
                          toast.success("Copied to clipboard!");
                        }}
                        className="px-3 py-1 bg-white hover:bg-gray-100 text-gray-700 border border-gray-300 text-[10px] font-bold rounded-md shadow-sm transition-all"
                      >
                        Copy Script
                      </button>
                    </div>
                  )}
                </div>
              </div>

            </div>
          )}
        </div>

        <div className="w-[26%] flex flex-col gap-8">
          <button
            className={`text-white py-4 rounded-full hover:bg-[#7263f3]/90 hover:text-white ${
              isApplied ? "bg-green-500" : "bg-[#7263f3]"
            }`}
            onClick={() => {
              if (isAuthenticated) {
                if (!isApplied) {
                  applyToJob(job._id);
                  setIsApplied(true);
                } else {
                  toast.error("You have already applied to this job");
                }
              } else {
                const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
                window.location.href = `${apiUrl}/login`;
              }
            }}
          >
            {isApplied ? "Applied" : "Apply Now"}
          </button>

          <div className="p-6 flex flex-col gap-2 bg-white rounded-md">
            <h3 className="text-lg font-semibold">Other Information</h3>

            <div className="flex flex-col gap-2">
              <p>
                <span className="font-bold">Posted:</span>{" "}
                {formatDates(createdAt)}
              </p>

              <p>
                <span className="font-bold">Salary negotiable: </span>
                <span
                  className={`${
                    negotiable ? "text-green-500" : "text-red-500"
                  }`}
                >
                  {negotiable ? "Yes" : "No"}
                </span>
              </p>

              <p>
                <span className="font-bold">Location:</span> {location}
              </p>

              <p>
                <span className="font-bold">Job Type:</span> {jobType[0]}
              </p>
            </div>
          </div>

          <div className="p-6 flex flex-col gap-2 bg-white rounded-md">
            <h3 className="text-lg font-semibold">Tags</h3>
            <p>Other relevant tags for the job position.</p>

            <div className="flex flex-wrap gap-4">
              {job.tags.map((tag: string, index: number) => (
                <span
                  key={index}
                  className="px-4 py-1 rounded-full text-sm font-medium flex items-center bg-red-500/20 text-red-600"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>

          {/* SDE Interactive Skills Matcher */}
          <div className="p-6 flex flex-col gap-3 bg-white rounded-md">
            <h3 className="text-lg font-semibold flex items-center gap-2">
              Tech Skills Matcher
            </h3>
            <p className="text-xs text-gray-500">
              Interactive matching checklist. Click the skills you have:
            </p>

            <div className="flex flex-wrap gap-3 mt-1">
              {job.skills && job.skills.map((skill: string, index: number) => {
                const isChecked = checkedSkills.includes(skill);
                return (
                  <button
                    key={index}
                    onClick={() => toggleSkill(skill)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all duration-200 select-none ${
                      isChecked
                        ? "bg-gradient-to-r from-[#7263f3] to-[#a294f9] text-white shadow-md scale-105"
                        : "bg-indigo-500/10 text-[#7263f3] hover:bg-indigo-500/20"
                    }`}
                  >
                    <span>{isChecked ? "✓" : "+"}</span>
                    {skill}
                  </button>
                );
              })}
            </div>

            {/* Match score bar */}
            {job.skills && job.skills.length > 0 && (
              <div className="mt-3 p-3.5 rounded-xl bg-gradient-to-r from-[#7263f3]/5 to-[#a294f9]/5 border border-[#7263f3]/10">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-extrabold text-[#7263f3]">Your Skill Fit</span>
                  <span className="text-xs font-extrabold text-[#7263f3]">
                    {Math.round((checkedSkills.length / job.skills.length) * 100)}% Match
                  </span>
                </div>
                <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-[#7263f3] to-[#a294f9] h-full rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${Math.round((checkedSkills.length / job.skills.length) * 100)}%` }}
                  ></div>
                </div>
                <p className="text-[10px] text-gray-400 mt-2 leading-tight">
                  {checkedSkills.length === job.skills.length 
                    ? "Perfect Match! You have all SDE skills required for this job!" 
                    : "Check the skills you know to instantly see your compatibility score."}
                </p>
              </div>
            )}
          </div>

          {/* Interactive Compensation Breakdown */}
          <div className="p-6 flex flex-col gap-4 bg-white rounded-md">
            <h3 className="text-md font-semibold flex items-center gap-2">
              Est. Compensation Package
            </h3>
            <div className="flex flex-col gap-2 mt-1">
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Base Salary</span>
                <span className="font-extrabold text-[#7263f3]">{formatMoney(salary, "GBP")}</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-[#7263f3] h-full" style={{ width: "70%" }}></div>
              </div>
              
              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Annual RSU / Stock (Est.)</span>
                <span className="font-extrabold text-purple-600">{formatMoney(salary * 0.35, "GBP")}</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-purple-500 h-full" style={{ width: "25%" }}></div>
              </div>

              <div className="flex justify-between items-center text-xs">
                <span className="text-gray-500 font-medium">Sign-on Bonus (Est.)</span>
                <span className="font-extrabold text-emerald-600">{formatMoney(salary * 0.1, "GBP")}</span>
              </div>
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full" style={{ width: "10%" }}></div>
              </div>
            </div>
            <p className="text-[9px] text-gray-400 leading-tight">
              * Figures are based on typical compensation bands for this level of role.
            </p>
          </div>

          {/* SDE Interview Blueprint Stepper */}
          <div className="p-6 flex flex-col gap-3 bg-white rounded-md">
            <h3 className="text-md font-semibold flex items-center gap-2">
              SDE Interview Blueprint
            </h3>
            <div className="flex flex-col gap-4 relative pl-3.5 border-l border-gray-200 ml-1.5 mt-2">
              <div className="relative">
                <span className="absolute -left-[20px] top-0 w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-white ring-2 ring-emerald-500/10"></span>
                <h4 className="text-xs font-bold leading-none">Round 1: Technical Screen</h4>
                <p className="text-[10px] text-gray-400 mt-1">45 mins • Coding & CS fundamentals.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[20px] top-0 w-2.5 h-2.5 rounded-full bg-[#7263f3] border-2 border-white ring-2 ring-[#7263f3]/10"></span>
                <h4 className="text-xs font-bold leading-none">Round 2: Systems Design</h4>
                <p className="text-[10px] text-gray-400 mt-1">60 mins • Scalability & Architecture.</p>
              </div>
              <div className="relative">
                <span className="absolute -left-[20px] top-0 w-2.5 h-2.5 rounded-full bg-purple-500 border-2 border-white ring-2 ring-purple-500/10"></span>
                <h4 className="text-xs font-bold leading-none">Round 3: HM & Leadership</h4>
                <p className="text-[10px] text-gray-400 mt-1">45 mins • Problem-solving & values.</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}

export default page;
