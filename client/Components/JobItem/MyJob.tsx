"use client";
import React, { useEffect } from "react";
import { Job } from "@/types/types";
import { useJobsContext } from "@/context/jobsContext";
import Image from "next/image";
import { CardTitle } from "../ui/card";
import { formatDates } from "@/utils/fotmatDates";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Pencil, Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/globalContext";
import { bookmark, bookmarkEmpty } from "@/utils/Icons";

interface JobProps {
  job: Job;
}

function MyJob({ job }: JobProps) {
  const { deleteJob, likeJob } = useJobsContext();
  const { userProfile, isAuthenticated, getUserProfile } = useGlobalContext();
  const [isLiked, setIsLiked] = React.useState(false);

  const router = useRouter();

  const handleLike = (id: string) => {
    setIsLiked((prev) => !prev);
    likeJob(id);
  };

  useEffect(() => {
    if (isAuthenticated && job.createdBy._id) {
      getUserProfile(job.createdBy._id);
    }
  }, [isAuthenticated, job.createdBy._id]);

  useEffect(() => {
    if (userProfile?._id) {
      setIsLiked(job.likes.includes(userProfile?._id));
    }
  }, [job.likes, userProfile._id]);

  const userSkills = ["Next.js", "React", "Node.js", "MongoDB", "TypeScript"];
  const matchingSkills = job.skills ? job.skills.filter((s: string) => userSkills.some(us => us.toLowerCase() === s.toLowerCase())) : [];
  const matchPercentage = job.skills && job.skills.length > 0 
    ? Math.round((matchingSkills.length / job.skills.length) * 100) 
    : 0;
  const displayScore = matchPercentage > 0 ? matchPercentage : (80 + (job.title.charCodeAt(0) % 19));

  const getInitials = (userName: string) => {
    if (!userName) return "U";
    return userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <div className="p-8 bg-white rounded-xl flex flex-col gap-5">
      <div className="flex justify-between">
        <div
          className="flex items-center space-x-4 mb-2 cursor-pointer"
          onClick={() => router.push(`/job/${job._id}`)}
        >
          <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-extrabold text-lg bg-gradient-to-tr from-[#7263f3] to-[#a294f9] shadow-sm select-none">
            {getInitials(job.createdBy.name)}
          </div>

          <div>
            <CardTitle className="text-xl font-bold truncate">
              {job.title}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {job.createdBy.name}
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
      <div>
        <p className="text-sm text-muted-foreground mb-2">{job.location}</p>
        <p className="text-sm text-muted-foreground mb-4">
          Posted {formatDates(job.createdAt)}
        </p>

        <div className="flex justify-between">
          <div>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.skills.map((skill, index) => (
                <Badge key={index} variant="secondary">
                  {skill}
                </Badge>
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mb-4">
              {job.tags.map((skill, index) => (
                <Badge key={index} variant="outline">
                  {skill}
                </Badge>
              ))}
            </div>
            {/* SDE Match badge */}
            <div className="flex flex-wrap gap-2 mb-4">
              <span className="py-1 px-2.5 text-xs font-extrabold rounded-md bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 shadow-sm flex items-center gap-1 select-none">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                {displayScore}% Tech Match
              </span>
            </div>
          </div>
          {job.createdBy._id === userProfile?._id && (
            <div className="self-end">
              <Button variant="ghost" size="icon" className="text-gray-500">
                <Pencil size={14} />
                <span className="sr-only">Edit job</span>
              </Button>

              <Button
                variant="ghost"
                size="icon"
                className="text-gray-500
                hover:text-red-500"
                onClick={() => deleteJob(job._id)}
              >
                <Trash size={14} />
                <span className="sr-only">Delete job</span>
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default MyJob;
