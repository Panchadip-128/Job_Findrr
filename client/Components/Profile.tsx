"use client";
import React from "react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/Components/ui/dropdown-menu";
import { Settings, LogOut } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useGlobalContext } from "@/context/globalContext";
import { Badge } from "./ui/badge";

function Profile() {
  const { userProfile } = useGlobalContext();

  const { profilePicture, name, profession, email } = userProfile;

  const getInitials = (userName: string) => {
    if (!userName) return "U";
    return userName.split(" ").map(n => n[0]).join("").toUpperCase().substring(0, 2);
  };

  return (
    <DropdownMenu>
      <div className="flex items-center gap-4">
        <Badge>{profession}</Badge>
        <DropdownMenuTrigger asChild className="cursor-pointer">
          <div className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-extrabold text-sm bg-gradient-to-tr from-[#7263f3] to-[#a294f9] shadow-md border border-[#7263f3]/20 hover:scale-105 transition-all duration-200 select-none">
            {getInitials(name)}
          </div>
        </DropdownMenuTrigger>
      </div>
      <DropdownMenuContent className="w-56" align="end">
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{name}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {email}
            </p>
          </div>
        </DropdownMenuLabel>

        <DropdownMenuSeparator />

        <DropdownMenuItem>
          <Settings className="mr-2 h-4 w-4" />
          <span>Settings</span>
        </DropdownMenuItem>
        <DropdownMenuItem
          className="cursor-pointer"
          onClick={() => {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5005";
            window.location.href = `${apiUrl}/logout`;
          }}
        >
          <LogOut className="mr-2 h-4 w-4" />
          <span>Logout</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

export default Profile;
