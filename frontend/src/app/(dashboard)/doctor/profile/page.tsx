import ProfilePage from "@/components/ProfilePage/ProfilePage";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "Doctor Profile | BeyungCare+",
  description: "View and manage your doctor profile in BeyungCare+ platform.",
};

export default function Page() {
  return  <ProfilePage userType='doctor'/>
}