"use client";
import { useGlobalContext } from "@/context/globalContext";
import { useJobsContext } from "@/context/jobsContext";
import { Job } from "@/types/types";
import { Calendar } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import React, { useEffect } from "react";
import { Separator } from "../ui/separator";
import formatMoney from "@/utils/formatMoney";
import { formatDates } from "@/utils/fotmatDates";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

interface JobProps {
  job: Job;
  activeJob?: boolean;
}

function JobCard({ job, activeJob }: JobProps) {
  const { likeJob } = useJobsContext();
  const { userProfile, isAuthenticated } = useGlobalContext();
  const [isLiked, setIsLiked] = React.useState(false);

  const {
    title,

    salaryType,
    salary,
    createdBy,
    applicants,
    jobType,
    createdAt,
  } = job;

  const { name, profilePicture } = createdBy;

  const router = useRouter();

  const handleLike = (id: string) => {
    setIsLiked((prev) => !prev);
    likeJob(id);
  };

  useEffect(() => {
    setIsLiked(job.likes.includes(userProfile._id));
  }, [job.likes, userProfile._id]);

  const companyDescription =
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed ut purus eget nunc.";

  const jobTypeBg = (type: string) => {
    switch (type) {
      case "Full Time":
        return "bg-green-500/20 text-green-600";
      case "Part Time":
        return "bg-purple-500/20 text-purple-600";
      case "Contract":
        return "bg-red-500/20 text-red-600";
      case "Internship":
        return "bg-indigo-500/20 text-indigo-600";
      default:
        return "bg-gray-500/20 text-gray-600";
    }
  };

  const userSkills = ["Next.js", "React", "Node.js", "MongoDB", "TypeScript"];
  const matchingSkills = job.skills ? job.skills.filter((s: string) => userSkills.some(us => us.toLowerCase() === s.toLowerCase())) : [];
  const matchPercentage = job.skills && job.skills.length > 0 
    ? Math.round((matchingSkills.length / job.skills.length) * 100) 
    : 0;
  const displayScore = matchPercentage > 0 ? matchPercentage : (80 + (title.charCodeAt(0) % 19));

  let interviewFormat = "1x Coding • 1x System Design";
  const titleLower = title.toLowerCase();
  if (titleLower.includes("lead") || titleLower.includes("senior") || titleLower.includes("architect")) {
    interviewFormat = "2x Coding • 1x System Design • 1x Leadership";
  } else if (titleLower.includes("devops") || titleLower.includes("sre") || titleLower.includes("infra")) {
    interviewFormat = "1x Coding • 1x Cloud Infra • 1x System Design";
  } else if (titleLower.includes("designer") || titleLower.includes("ui") || titleLower.includes("ux")) {
    interviewFormat = "Portfolio Review • 1x Design Craft • 1x Behavioral";
  }

  const getInitials = (userName: string) => {
    if (!userName) return "U";
    return userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div
      className={`p-8 rounded-xl flex flex-col gap-5
    ${
      activeJob
        ? "bg-gray-50 shadow-md border-b-2 border-[#7263f3]"
        : "bg-white"
    }`}
    >
      <div className="flex justify-between">
        <div
          className="group flex gap-3 items-center cursor-pointer"
          onClick={() => router.push(`/job/${job._id}`)}
        >
          <div className="w-12 h-12 rounded-md flex items-center justify-center text-white font-extrabold text-lg bg-gradient-to-tr from-[#7263f3] to-[#a294f9] shadow-sm select-none">
            {getInitials(name)}
          </div>

          <div className="flex flex-col gap-1">
            <h4 className="group-hover:underline font-bold">{title}</h4>
            <p className="text-xs text-gray-500">
              {name} • {applicants.length}{" "}
              {applicants.length > 1 ? "Applicants" : "Applicant"}
            </p>
          </div>
        </div>

        <button
          className={`text-2xl ${
            isLiked ? "text-[#7263f3]" : "text-gray-400"
          } `}
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

      <div className="flex flex-wrap gap-2 items-center">
        {jobType.map((type, index) => (
          <span
            key={index}
            className={`py-1 px-3 text-xs font-medium rounded-md border ${jobTypeBg(
              type
            )}`}
          >
            {type}
          </span>
        ))}
        
        {/* SDE glowing Match badge */}
        <span className="py-1 px-2.5 text-xs font-extrabold rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm flex items-center gap-1 select-none">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
          {displayScore}% Tech Match
        </span>
        
        {/* Interview Format Badge */}
        <span className="py-1 px-2.5 text-xs font-medium rounded-md bg-purple-500/10 text-[#7263f3] border border-purple-500/20 flex items-center gap-1 select-none">
          💻 {interviewFormat}
        </span>
      </div>

      <p>
        {companyDescription.length > 100
          ? `${companyDescription.substring(0, 100)}...`
          : companyDescription}
      </p>

      <Separator />

      <div className="flex justify-between items-center gap-6">
        <p>
          <span className="font-bold">{formatMoney(salary, "GBP")}</span>
          <span className="font-medium text-gray-400 text-lg">
            /
            {salaryType === "Yearly"
              ? "pa"
              : salaryType === "Monthly"
              ? "pcm"
              : salaryType === "Weekly"
              ? "pw"
              : "ph"}
          </span>
        </p>

        <p className="flex items-center gap-2 text-sm text-gray-400">
          <span className="text-lg">
            <Calendar size={16} />
          </span>
          Posted: {formatDates(createdAt)}
        </p>
      </div>
    </div>
  );
}

export default JobCard;
